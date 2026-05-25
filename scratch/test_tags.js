const https = require('https');

const query = `
[out:json][timeout:90];
area["name"="Greater London"]->.london;
(
  node["amenity"="motorcycle_parking"](area.london);
  way["amenity"="motorcycle_parking"](area.london);
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
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      const elements = parsed.elements || [];
      console.log('Total elements returned:', elements.length);
      
      let operatorCount = 0;
      let addrCityCount = 0;
      let addrSuburbCount = 0;
      let postcodeCount = 0;
      let feeCount = 0;
      let capacityCount = 0;
      
      const uniqueOperators = new Set();
      
      elements.forEach(el => {
        if (!el.tags) return;
        if (el.tags.operator) {
          operatorCount++;
          uniqueOperators.add(el.tags.operator);
        }
        if (el.tags['addr:city']) addrCityCount++;
        if (el.tags['addr:suburb']) addrSuburbCount++;
        if (el.tags['addr:postcode'] || el.tags.postcode) postcodeCount++;
        if (el.tags.fee) feeCount++;
        if (el.tags.capacity) capacityCount++;
      });
      
      console.log('Stats:');
      console.log('- operator tag present:', operatorCount);
      console.log('- addr:city tag present:', addrCityCount);
      console.log('- addr:suburb tag present:', addrSuburbCount);
      console.log('- postcode tag present:', postcodeCount);
      console.log('- fee tag present:', feeCount);
      console.log('- capacity tag present:', capacityCount);
      console.log('\nUnique operator values (first 20):');
      console.log(Array.from(uniqueOperators).slice(0, 20));
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw output (first 1000 chars):\n', body.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
