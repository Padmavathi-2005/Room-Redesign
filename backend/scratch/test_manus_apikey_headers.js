const axios = require('axios');

const key = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

const headerNames = [
  'x-manus-api-key',
  'X-Manus-API-Key',
  'manus-api-key',
  'api_key',
  'x-api-token',
  'X-Api-Key',
  'apikey',
  'APIKey',
  'X-Auth-Token',
  'Authorization',
];

async function testAllHeaderNames() {
  console.log('Testing Manus API key header names...\n');
  const payload = { prompt: 'floor plan' };

  for (const hName of headerNames) {
    let headerVal = key;
    if (hName === 'Authorization') headerVal = `APIKey ${key}`;

    try {
      const res = await axios.post('https://api.manus.im/v1/tasks', payload, {
        headers: {
          [hName]: headerVal,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      console.log(`🎉🎉🎉 SUCCESS WITH HEADER [${hName}]: Status ${res.status}`);
      console.log('Response:', JSON.stringify(res.data));
      return;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.log(`Header [${hName}]: -> ${msg}`);
    }
  }

  // Test query parameter ?api_key= or ?key=
  console.log('\nTesting query param ?api_key=...');
  try {
    const res = await axios.post(`https://api.manus.im/v1/tasks?api_key=${key}`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    console.log(`🎉🎉🎉 SUCCESS WITH QUERY PARAM ?api_key: Status ${res.status}`);
    console.log('Response:', JSON.stringify(res.data));
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.log(`Query param ?api_key: -> ${msg}`);
  }
}

testAllHeaderNames();
