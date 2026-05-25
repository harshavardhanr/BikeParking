const https = require('https');

const query = `
[out:json][timeout:25];
area["name"="Greater London"]->.london;
(
  node["amenity"="motorcycle_parking"](area.london);
  way["amenity"="motorcycle_parking"](area.london);
);
out count;
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
      console.log('Count response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output:', body.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
