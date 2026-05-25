const https = require('https');

const query = `
[out:json][timeout:25];
(
  relation["boundary"="administrative"]["admin_level"="8"]["name"="City of London"];
  relation["boundary"="administrative"]["admin_level"="6"]["name"="City of London"];
  relation["boundary"="administrative"]["name"="City of London"];
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
      console.log('HTTP Status:', res.statusCode);
      const parsed = JSON.parse(body);
      console.log('Found relations:', parsed.elements.map(el => ({
        id: el.id,
        tags: {
          name: el.tags.name,
          admin_level: el.tags.admin_level,
          boundary: el.tags.boundary,
          wikidata: el.tags.wikidata
        }
      })));
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output:', body.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
