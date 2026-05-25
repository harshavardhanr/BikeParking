const https = require('https');

const query = `
[out:json][timeout:25];
area(3600051800)->.borough;
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

https.get(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      console.log('HTTP Status:', res.statusCode);
      const parsed = JSON.parse(body);
      console.log('City of London parking spots count:', parsed.elements?.length || 0);
      if (parsed.elements?.length > 0) {
        console.log('Sample spot:', JSON.stringify(parsed.elements[0], null, 2));
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output:', body.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
