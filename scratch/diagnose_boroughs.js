const https = require('https');

// From our boroughs_map.json
const TEST_BOROUGHS = [
  { name: 'London Borough of Waltham Forest', areaId: 3600065595, shortName: 'Waltham Forest' },
  { name: 'London Borough of Hackney', areaId: 3600051806, shortName: 'Hackney' },
];

function fetchQuery(query) {
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MotoParkDebug/1.0' } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error('Parse error: ' + body.slice(0, 300))); }
      });
    }).on('error', reject);
  });
}

async function diagnose() {
  for (const b of TEST_BOROUGHS) {
    console.log(`\n=== ${b.name} (areaId: ${b.areaId}) ===`);

    // 1. Verify the area itself resolves
    const areaQuery = `[out:json][timeout:15]; area(${b.areaId}); out tags;`;
    try {
      const areaResult = await fetchQuery(areaQuery);
      const el = areaResult.elements[0];
      console.log('Area tag "name":', el?.tags?.name || 'NOT FOUND');
    } catch(e) {
      console.log('Area lookup error:', e.message);
    }

    await new Promise(r => setTimeout(r, 1500));

    // 2. Count motorcycle parking in the area
    const countQuery = `
[out:json][timeout:25];
area(${b.areaId})->.b;
(
  node["amenity"="motorcycle_parking"](area.b);
  way["amenity"="motorcycle_parking"](area.b);
);
out count;`;
    try {
      const countResult = await fetchQuery(countQuery);
      const tags = countResult.elements[0]?.tags || {};
      console.log(`Motorcycle parking in OSM: nodes=${tags.nodes}, ways=${tags.ways}, total=${tags.total}`);
    } catch(e) {
      console.log('Count query error:', e.message);
    }

    await new Promise(r => setTimeout(r, 1500));

    // 3. Also try by name-based area (fallback)
    const nameQuery = `
[out:json][timeout:25];
area["name"="${b.name}"]->.b;
(
  node["amenity"="motorcycle_parking"](area.b);
  way["amenity"="motorcycle_parking"](area.b);
);
out count;`;
    try {
      const nameResult = await fetchQuery(nameQuery);
      const tags = nameResult.elements[0]?.tags || {};
      console.log(`By name query: nodes=${tags.nodes}, ways=${tags.ways}, total=${tags.total}`);
    } catch(e) {
      console.log('Name query error:', e.message);
    }

    await new Promise(r => setTimeout(r, 2000));
  }
}

diagnose().catch(console.error);
