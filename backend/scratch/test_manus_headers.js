const axios = require('axios');

const key = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

const headerVariations = [
  { name: 'x-api-key', headers: { 'x-api-key': key } },
  { name: 'X-API-Key', headers: { 'X-API-Key': key } },
  { name: 'Authorization: Direct Key (no Bearer)', headers: { 'Authorization': key } },
  { name: 'Authorization: Bearer Key', headers: { 'Authorization': `Bearer ${key}` } },
  { name: 'api-key', headers: { 'api-key': key } },
];

async function testManusHeaders() {
  console.log('Testing Manus API key headers...\n');
  const payload = {
    prompt: '2d architectural floor plan',
  };

  for (const h of headerVariations) {
    try {
      const res = await axios.post('https://api.manus.im/v1/tasks', payload, {
        headers: {
          ...h.headers,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      console.log(`✅ SUCCESS with ${h.name}: Status ${res.status}`);
      console.log('Response:', JSON.stringify(res.data).slice(0, 200));
      return;
    } catch (err) {
      const status = err.response?.status || 'No Response';
      const msg = JSON.stringify(err.response?.data || err.message).slice(0, 150);
      console.log(`❌ ${h.name}: Status ${status} -> ${msg}`);
    }
  }
}

testManusHeaders();
