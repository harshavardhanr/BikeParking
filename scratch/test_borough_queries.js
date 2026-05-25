const https = require('https');

const boroughs = [
  { name: 'London Borough of Camden', short: 'Camden' },
  { name: 'City of Westminster', short: 'Westminster' },
  { name: 'City of London', short: 'City of London' }
];

async function fetchForBorough(borough) {
  const query = `
[out:json][timeout:25];
area["name"="${borough.name}"]->.borough;
(
  node["amenity"="motorcycle_parking"](area.borough);
  way["amenity"="motorcycle_parking"](area.borough);
);
out center;
`;

  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const options = {
    headers: {
      'User-Agent': 'MotorbikeParkingAppResearcher/1.0 (contact: harshavardhanr@google.com)'
    }
  };

  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ borough: borough.short, count: parsed.elements?.length || 0, sample: parsed.elements?.[0] });
        } catch (e) {
          reject(new Error(`Failed to parse response for ${borough.name}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const b of boroughs) {
    try {
      console.log(`Fetching parking for ${b.name}...`);
      const result = await fetchForBorough(b);
      console.log(`Result: ${result.borough} has ${result.count} spots.`);
      if (result.count > 0) {
        console.log(`Sample spot in ${result.borough}:`, JSON.stringify(result.sample, null, 2));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

run();
