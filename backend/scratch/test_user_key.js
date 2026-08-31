const axios = require('axios');

const key = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

const endpoints = [
  { name: 'Manus IM (api.manus.im)', url: 'https://api.manus.im/v1/tasks', method: 'post' },
  { name: 'Manus AI (api.manus.ai)', url: 'https://api.manus.ai/v1/models', method: 'get' },
  { name: 'OpenAI (api.openai.com)', url: 'https://api.openai.com/v1/models', method: 'get' },
  { name: 'OpenRouter (openrouter.ai)', url: 'https://openrouter.ai/api/v1/models', method: 'get' },
  { name: 'Together AI (api.together.xyz)', url: 'https://api.together.xyz/v1/models', method: 'get' },
  { name: 'Replicate (api.replicate.com)', url: 'https://api.replicate.com/v1/models', method: 'get' },
];

async function runTests() {
  console.log('Testing Key:', key.slice(0, 15) + '...\n');
  for (const ep of endpoints) {
    try {
      if (ep.method === 'get') {
        const res = await axios.get(ep.url, {
          headers: { Authorization: `Bearer ${key}` },
          timeout: 5000,
        });
        console.log(`✅ ${ep.name}: SUCCESS (${res.status})`);
      } else {
        const res = await axios.post(ep.url, {}, {
          headers: { Authorization: `Bearer ${key}` },
          timeout: 5000,
        });
        console.log(`✅ ${ep.name}: SUCCESS (${res.status})`);
      }
    } catch (err) {
      const status = err.response?.status || 'No Response';
      const msg = JSON.stringify(err.response?.data || err.message).slice(0, 150);
      console.log(`❌ ${ep.name}: Status ${status} -> ${msg}`);
    }
  }
}

runTests();
