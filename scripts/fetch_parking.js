const https = require('https');
const fs = require('fs');
const path = require('path');

const BOROUGHS_MAP_PATH = path.join(__dirname, '../scratch/boroughs_map.json');
const OUTPUT_PATH = path.join(__dirname, '../data/parking_data.js');

const USER_AGENT = 'MotorbikeParkingAppCompiler/1.0 (contact: harshavardhanr@google.com)';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// London boroughs that charge for dedicated solo motorcycle bays by default
const PAID_BOROUGHS = [
  'Westminster',
  'Camden',
  'Islington',
  'Hackney',
  'Lewisham',
  'Waltham Forest'
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchWithRetry(url, options, retries = 4, backoff = 2000) {
  return new Promise((resolve, reject) => {
    const makeRequest = (attempt) => {
      https.get(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (e) {
              if (attempt < retries) {
                console.warn(`JSON parse error. Retrying attempt ${attempt + 1}/${retries}...`);
                setTimeout(() => makeRequest(attempt + 1), backoff * Math.pow(2, attempt));
              } else {
                reject(new Error(`Failed to parse JSON on final attempt: ${e.message}`));
              }
            }
          } else if (res.statusCode === 429 || res.statusCode >= 500) {
            if (attempt < retries) {
              console.warn(`Server responded with ${res.statusCode}. Retrying attempt ${attempt + 1}/${retries}...`);
              setTimeout(() => makeRequest(attempt + 1), backoff * Math.pow(2, attempt));
            } else {
              reject(new Error(`Server returned status code ${res.statusCode} on final attempt.`));
            }
          } else {
            reject(new Error(`HTTP request failed with status code ${res.statusCode}`));
          }
        });
      }).on('error', (err) => {
        if (attempt < retries) {
          console.warn(`Network error: ${err.message}. Retrying attempt ${attempt + 1}/${retries}...`);
          setTimeout(() => makeRequest(attempt + 1), backoff * Math.pow(2, attempt));
        } else {
          reject(err);
        }
      });
    };
    makeRequest(1);
  });
}

async function runOverpassQuery(query, endpointIndex = 0, context = 'query') {
  const endpoint = OVERPASS_ENDPOINTS[endpointIndex];
  const url = `${endpoint}?data=${encodeURIComponent(query)}`;

  try {
    const data = await fetchWithRetry(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (data.remark) {
      console.warn(`Overpass remark (${context}): ${data.remark}`);
    }
    return data.elements || [];
  } catch (error) {
    if (endpointIndex + 1 < OVERPASS_ENDPOINTS.length) {
      console.warn(`Overpass request failed on ${endpoint} (${context}): ${error.message}. Trying fallback...`);
      return runOverpassQuery(query, endpointIndex + 1, context);
    }
    throw error;
  }
}

function deriveAreaLabel(tags) {
  return (
    tags['addr:city'] ||
    tags['addr:town'] ||
    tags['addr:village'] ||
    tags['addr:hamlet'] ||
    tags['addr:suburb'] ||
    tags['addr:county'] ||
    tags['is_in:city'] ||
    tags['is_in'] ||
    tags['addr:state'] ||
    'United Kingdom'
  );
}

function elementToSpot(el, boroughName) {
  const tags = el.tags || {};
  const lat = el.lat || el.center?.lat;
  const lng = el.lon || el.center?.lon;

  let capacity = null;
  if (tags.capacity) {
    const parsedCap = parseInt(tags.capacity, 10);
    if (!isNaN(parsedCap)) {
      capacity = parsedCap;
    }
  }

  let fee = 'no';
  if (tags.fee) {
    fee = tags.fee.toLowerCase() === 'yes' ? 'yes' : 'no';
  } else if (boroughName && PAID_BOROUGHS.includes(boroughName)) {
    fee = 'yes';
  }

  let street = tags['addr:street'] || tags.street || tags.name || tags.description || null;
  if (!street) {
    street = 'Solo Motorcycle Parking Bay';
  }

  const cleanedTags = {};
  if (tags.covered) cleanedTags.covered = tags.covered;
  if (tags.restriction) cleanedTags.restriction = tags.restriction;
  if (tags.charge) cleanedTags.charge = tags.charge;
  if (tags.note) cleanedTags.note = tags.note;
  if (tags.payment) cleanedTags.payment = tags.payment;

  return {
    id: `${el.type}/${el.id}`,
    lat,
    lng,
    borough: boroughName || deriveAreaLabel(tags),
    street,
    capacity,
    fee,
    tags: Object.keys(cleanedTags).length > 0 ? cleanedTags : undefined
  };
}

async function fetchBoroughElements(borough, elementType) {
  const selector = elementType === 'node' ? 'node' : 'way';
  const outClause = elementType === 'node' ? 'out;' : 'out center;';
  const query = `
[out:json][timeout:180];
area(${borough.areaId})->.borough;
${selector}["amenity"="motorcycle_parking"](area.borough);
${outClause}`;

  const context = `${borough.shortName} ${elementType}s`;
  const elements = await runOverpassQuery(query, 0, context);
  return elements
    .map(el => elementToSpot(el, borough.shortName))
    .filter(spot => typeof spot.lat === 'number' && typeof spot.lng === 'number');
}

// Overpass can return partial borough results (notably Camden). Split node/way
// queries and union multiple passes until the result set stabilises.
async function fetchBoroughParking(borough) {
  const spotById = new Map();
  const maxPasses = 3;
  let previousSize = 0;

  for (let pass = 0; pass < maxPasses; pass++) {
    const nodes = await fetchBoroughElements(borough, 'node');
    await delay(800);
    const ways = await fetchBoroughElements(borough, 'way');

    for (const spot of [...nodes, ...ways]) {
      spotById.set(spot.id, spot);
    }

    console.log(`   pass ${pass + 1}: ${spotById.size} unique spots`);
    if (spotById.size === previousSize && pass >= 1) {
      break;
    }
    previousSize = spotById.size;

    if (pass < maxPasses - 1) {
      await delay(2000);
    }
  }

  return Array.from(spotById.values());
}

const LONDON_BBOX = { south: 51.28, west: -0.55, north: 51.7, east: 0.35 };

function loadExistingParkingData() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return [];
  }

  const content = fs.readFileSync(OUTPUT_PATH, 'utf8');
  const match = content.match(/const PARKING_DATA = (\[[\s\S]*\]);/);
  if (!match) {
    return [];
  }

  return JSON.parse(match[1]);
}

async function fetchSpotsByIds(ids) {
  const results = new Map();
  const chunkSize = 80;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const selectors = chunk
      .map(id => {
        const [type, osmId] = id.split('/');
        return `${type}(${osmId});`;
      })
      .join('\n  ');

    const query = `
[out:json][timeout:120];
(
  ${selectors}
);
out center;`;

    const elements = await runOverpassQuery(query, 0, `OSM id batch ${Math.floor(i / chunkSize) + 1}`);
    for (const el of elements) {
      if (el.tags?.amenity !== 'motorcycle_parking') continue;
      const spot = elementToSpot(el, null);
      if (typeof spot.lat === 'number' && typeof spot.lng === 'number') {
        results.set(spot.id, spot);
      }
    }

    if (i + chunkSize < ids.length) {
      await delay(1000);
    }
  }

  return results;
}

async function reconcileLondonBaseline(spotMap, baselineSpots, boroughs) {
  const londonBoroughNames = new Set(boroughs.map(b => b.shortName));
  const londonBaseline = baselineSpots.filter(spot => londonBoroughNames.has(spot.borough));
  const missing = londonBaseline.filter(spot => !spotMap.has(spot.id));

  if (missing.length === 0) {
    console.log('London baseline reconcile: nothing missing.');
    return;
  }

  console.log(`London baseline reconcile: ${missing.length} London spots missing from Overpass fetch.`);
  const fetchedById = await fetchSpotsByIds(missing.map(spot => spot.id));

  let refreshed = 0;
  let preserved = 0;
  for (const baseline of missing) {
    const fresh = fetchedById.get(baseline.id);
    if (fresh) {
      fresh.borough = baseline.borough;
      fresh.street = fresh.street || baseline.street;
      fresh.capacity = fresh.capacity ?? baseline.capacity;
      if (PAID_BOROUGHS.includes(fresh.borough) && fresh.fee !== 'yes') {
        fresh.fee = 'yes';
      }
      spotMap.set(baseline.id, fresh);
      refreshed++;
    } else {
      spotMap.set(baseline.id, baseline);
      preserved++;
    }
  }

  console.log(
    `London baseline reconcile: restored ${missing.length} spots (${refreshed} refreshed from OSM, ${preserved} kept from previous dataset).`
  );
}

async function fetchLondonBboxParking() {
  const tiles = [
    [51.28, -0.55, 51.49, -0.05, 'SW'],
    [51.28, -0.05, 51.49, 0.35, 'SE'],
    [51.49, -0.55, 51.70, -0.05, 'NW'],
    [51.49, -0.05, 51.70, 0.35, 'NE']
  ];

  const spotById = new Map();

  console.log('Running London bbox backfill query (4 tiles)...');
  for (const [south, west, north, east, name] of tiles) {
    const query = `
[out:json][timeout:120];
(
  node["amenity"="motorcycle_parking"](${south},${west},${north},${east});
  way["amenity"="motorcycle_parking"](${south},${west},${north},${east});
);
out center;`;

    const elements = await runOverpassQuery(query, 0, `London bbox ${name}`);
    console.log(` -> ${name}: received ${elements.length} OSM elements.`);

    for (const el of elements) {
      const spot = elementToSpot(el, null);
      if (typeof spot.lat !== 'number' || typeof spot.lng !== 'number') continue;
      spotById.set(spot.id, spot);
    }

    await delay(1000);
  }

  console.log(` -> London bbox union: ${spotById.size} unique spots.`);
  return Array.from(spotById.values());
}

async function findBoroughMembership(spotIds, borough) {
  if (spotIds.length === 0) return [];

  const idSelectors = spotIds
    .map(id => {
      const [type, osmId] = id.split('/');
      return `${type}(${osmId});`;
    })
    .join('\n  ');

  const query = `
[out:json][timeout:120];
area(${borough.areaId})->.borough;
(
  ${idSelectors}
)(area.borough);
out;`;

  const elements = await runOverpassQuery(query, 0, `${borough.shortName} membership`);
  return elements.map(el => `${el.type}/${el.id}`);
}

async function backfillLondonSpots(spotMap, boroughs) {
  const bboxSpots = await fetchLondonBboxParking();
  const missingIds = bboxSpots
    .filter(spot => !spotMap.has(spot.id))
    .map(spot => spot.id);

  if (missingIds.length === 0) {
    console.log('London backfill: no missing spots.');
    return;
  }

  console.log(`London backfill: ${missingIds.length} spots missing after borough fetch.`);
  const spotById = new Map(bboxSpots.map(spot => [spot.id, spot]));
  const boroughBySpotId = new Map();
  let remaining = [...missingIds];

  for (const borough of boroughs) {
    if (remaining.length === 0) break;

    const matched = await findBoroughMembership(remaining, borough);
    for (const id of matched) {
      boroughBySpotId.set(id, borough.shortName);
    }
    remaining = remaining.filter(id => !boroughBySpotId.has(id));
    await delay(500);
  }

  let added = 0;
  for (const id of missingIds) {
    const boroughName = boroughBySpotId.get(id);
    if (!boroughName) continue;

    const spot = spotById.get(id);
    spot.borough = boroughName;
    if (PAID_BOROUGHS.includes(boroughName) && spot.fee !== 'yes') {
      spot.fee = 'yes';
    }
    spotMap.set(id, spot);
    added++;
  }

  if (remaining.length > 0) {
    console.warn(`London backfill: ${remaining.length} spots could not be assigned to a borough.`);
  }

  console.log(`London backfill: added ${added} spots (${spotMap.size} London+ total before UK pass).`);
}

async function fetchUkParkingOutsideLondon(spotMap) {
  const query = `
[out:json][timeout:180];
area["ISO3166-1"="GB"]->.uk;
(
  node["amenity"="motorcycle_parking"](area.uk);
  way["amenity"="motorcycle_parking"](area.uk);
);
out center;
`;

  console.log('Fetching UK-wide motorcycle parking from OpenStreetMap...');
  const elements = await runOverpassQuery(query, 0, 'UK-wide');
  console.log(` -> Received ${elements.length} OSM elements for the UK.`);

  let added = 0;
  for (const el of elements) {
    const spot = elementToSpot(el, null);
    if (typeof spot.lat !== 'number' || typeof spot.lng !== 'number') continue;
    if (spotMap.has(spot.id)) continue;
    spotMap.set(spot.id, spot);
    added++;
  }

  console.log(` -> Added ${added} non-London spots (${spotMap.size} total).`);
}

async function main() {
  console.log('Starting UK motorcycle parking compilation...');

  if (!fs.existsSync(BOROUGHS_MAP_PATH)) {
    console.error(`Boroughs map not found at ${BOROUGHS_MAP_PATH}.`);
    process.exit(1);
  }

  const boroughs = JSON.parse(fs.readFileSync(BOROUGHS_MAP_PATH, 'utf8'));
  const baselineSpots = loadExistingParkingData();
  const spotMap = new Map();

  console.log(`Fetching ${boroughs.length} London boroughs...`);
  for (let i = 0; i < boroughs.length; i++) {
    const b = boroughs[i];
    console.log(`[${i + 1}/${boroughs.length}] Fetching spots for ${b.name}...`);

    try {
      const spots = await fetchBoroughParking(b);
      console.log(` -> Found ${spots.length} spots in ${b.shortName}.`);
      for (const spot of spots) {
        spotMap.set(spot.id, spot);
      }
    } catch (e) {
      console.error(` -> Error fetching for ${b.name}: ${e.message}`);
    }

    await delay(1200);
  }

  console.log(`London compilation complete: ${spotMap.size} spots.`);

  try {
    await backfillLondonSpots(spotMap, boroughs);
  } catch (e) {
    console.error(`London backfill failed: ${e.message}`);
  }

  try {
    await reconcileLondonBaseline(spotMap, baselineSpots, boroughs);
  } catch (e) {
    console.error(`London baseline reconcile failed: ${e.message}`);
  }

  const londonBoroughNames = new Set(boroughs.map(b => b.shortName));
  const londonCount = Array.from(spotMap.values()).filter(
    spot => londonBoroughNames.has(spot.borough)
  ).length;
  console.log(`London borough-labelled spots: ${londonCount}`);

  if (londonCount < 1550) {
    console.warn(`WARNING: London spot count (${londonCount}) is lower than expected (~1610).`);
  }

  try {
    await fetchUkParkingOutsideLondon(spotMap);
  } catch (e) {
    console.error(`Failed UK-wide fetch: ${e.message}`);
    console.warn('Continuing with London-only dataset.');
  }

  const allSpots = Array.from(spotMap.values()).filter(
    spot => typeof spot.lat === 'number' && typeof spot.lng === 'number'
  );

  console.log(`\nFetching complete! Total spots compiled: ${allSpots.length}`);

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputContent = `// Compiled UK motorcycle parking bays (OpenStreetMap amenity=motorcycle_parking)\nconst PARKING_DATA = ${JSON.stringify(allSpots, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_PATH, outputContent);
  console.log(`Successfully wrote dataset to ${OUTPUT_PATH}`);
}

main();
