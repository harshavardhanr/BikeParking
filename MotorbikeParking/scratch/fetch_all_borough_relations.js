const https = require('https');
const fs = require('fs');

const query = `
[out:json][timeout:25];
area["name"="Greater London"]->.london;
(
  relation["boundary"="administrative"]["admin_level"="8"](area.london);
  relation["boundary"="administrative"]["admin_level"="6"]["name"="City of London"];
);
out tags;
`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
const options = {
  headers: {
    'User-Agent': 'MotorbikeParkingAppResearcher/1.0 (contact: harshavardhanr@google.com)'
  }
};

https.get(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const boroughs = parsed.elements.map(el => {
        let shortName = el.tags.short_name || el.tags.name;
        if (shortName.startsWith('London Borough of ')) {
          shortName = shortName.replace('London Borough of ', '');
        } else if (shortName.startsWith('Royal Borough of ')) {
          shortName = shortName.replace('Royal Borough of ', '');
        } else if (shortName.startsWith('City of ')) {
          shortName = shortName.replace('City of ', '');
        }
        return {
          id: el.id,
          areaId: 3600000000 + el.id,
          name: el.tags.name,
          shortName: shortName,
          wikidata: el.tags.wikidata
        };
      });
      
      // Sort alphabetically by shortName
      boroughs.sort((a, b) => a.shortName.localeCompare(b.shortName));
      
      console.log(`Found ${boroughs.length} areas.`);
      fs.writeFileSync('scratch/boroughs_map.json', JSON.stringify(boroughs, null, 2));
      console.log('Saved mapping to scratch/boroughs_map.json');
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output:', body.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
