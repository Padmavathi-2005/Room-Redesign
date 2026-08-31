const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function discover() {
  console.log('--- Testing Manus API Authorization & Endpoints ---\n');

  const authVariants = [
    { name: 'Bearer Token', headers: { Authorization: `Bearer ${apiKey}` } },
    { name: 'x-manus-api-key', headers: { 'x-manus-api-key': apiKey } },
    { name: 'API_KEY', headers: { 'API_KEY': apiKey } },
    { name: 'Combined', headers: { Authorization: `Bearer ${apiKey}`, 'x-manus-api-key': apiKey } },
  ];

  const testEndpoints = [
    { method: 'get', url: 'https://api.manus.ai/v2/models' },
    { method: 'get', url: 'https://api.manus.ai/v2/user' },
    { method: 'get', url: 'https://api.manus.ai/v2/tasks' },
    { method: 'get', url: 'https://api.manus.ai/v2/task.list' },
    { method: 'get', url: 'https://api.manus.im/v1/models' },
  ];

  for (const ep of testEndpoints) {
    for (const auth of authVariants) {
      try {
        const res = await axios({ method: ep.method, url: ep.url, headers: auth.headers, timeout: 4000 });
        console.log(`✅ SUCCESS: ${ep.url} with ${auth.name} -> Status ${res.status}`);
        console.log('   Data:', JSON.stringify(res.data, null, 2).slice(0, 300));
      } catch (err) {
        // Only print non-404 or success
        if (err.response?.status !== 404) {
          console.log(`❌ ERROR ${err.response?.status}: ${ep.url} with ${auth.name} -> ${JSON.stringify(err.response?.data || err.message).slice(0, 150)}`);
        }
      }
    }
  }
}

discover();
