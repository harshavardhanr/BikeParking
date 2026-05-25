const https = require('https');
const fs = require('fs');
const path = require('path');

const BOROUGHS_MAP_PATH = path.join(__dirname, '../scratch/boroughs_map.json');
const OUTPUT_PATH = path.join(__dirname, '../data/parking_data.js');

// List of boroughs that charge for dedicated solo motorcycle bays by default
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

function fetchWithRetry(url, options, retries = 3, backoff = 2000) {
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

async function fetchBoroughParking(borough) {
  const query = `
[out:json][timeout:30];
area(${borough.areaId})->.borough;
(
  node["amenity"="motorcycle_parking"](area.borough);
  way["amenity"="motorcycle_parking"](area.borough);
);
out center;
`;

  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const options = {
    headers: {
      'User-Agent': 'MotorbikeParkingAppCompiler/1.0 (contact: harshavardhanr@google.com)'
    }
  };

  const data = await fetchWithRetry(url, options);
  const elements = data.elements || [];

  return elements.map(el => {
    const tags = el.tags || {};
    
    // Determine coordinate
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    
    // Determine capacity
    let capacity = null;
    if (tags.capacity) {
      const parsedCap = parseInt(tags.capacity, 10);
      if (!isNaN(parsedCap)) {
        capacity = parsedCap;
      }
    }
    
    // Determine fee
    let fee = null;
    if (tags.fee) {
      fee = tags.fee.toLowerCase() === 'yes' ? 'yes' : 'no';
    } else {
      // Default based on borough charging rules
      fee = PAID_BOROUGHS.includes(borough.shortName) ? 'yes' : 'no';
    }
    
    // Determine street / location name
    let street = tags['addr:street'] || tags.street || tags.name || tags.description || null;
    if (!street) {
      street = 'Solo Motorcycle Parking Bay';
    }
    
    // Clean up key tags to store
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
      borough: borough.shortName,
      street,
      capacity,
      fee,
      tags: Object.keys(cleanedTags).length > 0 ? cleanedTags : undefined
    };
  });
}

async function main() {
  console.log('Starting London Motorbike Parking compilation...');
  
  if (!fs.existsSync(BOROUGHS_MAP_PATH)) {
    console.error(`Boroughs map not found at ${BOROUGHS_MAP_PATH}. Please run the scraper script first.`);
    process.exit(1);
  }
  
  const boroughs = JSON.parse(fs.readFileSync(BOROUGHS_MAP_PATH, 'utf8'));
  console.log(`Loaded ${boroughs.length} boroughs to query.`);
  
  const allSpots = [];
  
  for (let i = 0; i < boroughs.length; i++) {
    const b = boroughs[i];
    console.log(`[${i + 1}/${boroughs.length}] Fetching spots for ${b.name}...`);
    
    try {
      const spots = await fetchBoroughParking(b);
      console.log(` -> Found ${spots.length} spots in ${b.shortName}.`);
      allSpots.push(...spots);
    } catch (e) {
      console.error(` -> Error fetching for ${b.name}: ${e.message}`);
    }
    
    // Add a polite delay between queries to avoid rate limits
    await delay(1200);
  }
  
  console.log(`\nFetching complete! Total spots compiled: ${allSpots.length}`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write as static JS variable rather than raw JSON
  const outputContent = `// Compiled London motorcycle parking bays\nconst PARKING_DATA = ${JSON.stringify(allSpots, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_PATH, outputContent);
  console.log(`Successfully wrote dataset to ${OUTPUT_PATH}`);
}

main();
