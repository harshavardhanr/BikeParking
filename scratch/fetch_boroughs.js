const https = require('https');

const query = `
[out:json][timeout:50];
area["name"="Greater London"]->.london;
relation["admin_level"="8"]["boundary"="administrative"](area.london);
out tags geom;
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
      console.log('Boroughs response relations count:', parsed.elements.length);
      if (parsed.elements.length > 0) {
        console.log('Sample relation tags:', JSON.stringify(parsed.elements[0].tags, null, 2));
        console.log('Sample geometry members count:', parsed.elements[0].members?.length);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output (first 500 chars):\n', body.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
