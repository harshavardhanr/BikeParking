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

async function runOverpassQuery(query, endpointIndex = 0) {
  const endpoint = OVERPASS_ENDPOINTS[endpointIndex];
  const url = `${endpoint}?data=${encodeURIComponent(query)}`;

  try {
    const data = await fetchWithRetry(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    return data.elements || [];
  } catch (error) {
    if (endpointIndex + 1 < OVERPASS_ENDPOINTS.length) {
      console.warn(`Overpass request failed on ${endpoint}: ${error.message}. Trying fallback...`);
      return runOverpassQuery(query, endpointIndex + 1);
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

async function fetchBoroughParking(borough) {
  const query = `
[out:json][timeout:90];
area(${borough.areaId})->.borough;
(
  node["amenity"="motorcycle_parking"](area.borough);
  way["amenity"="motorcycle_parking"](area.borough);
);
out center;
`;

  const elements = await runOverpassQuery(query);
  return elements
    .map(el => elementToSpot(el, borough.shortName))
    .filter(spot => typeof spot.lat === 'number' && typeof spot.lng === 'number');
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
  const elements = await runOverpassQuery(query);
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
