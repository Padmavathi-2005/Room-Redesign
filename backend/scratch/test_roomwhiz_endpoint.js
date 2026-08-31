const axios = require('axios');

const apiKey = 'sk-proj_2ee089a7b0f8c436427101da2fd34e275c46db3f99ff703776feaeef11092fec';

async function testRoomWhizEndpoints() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'x-api-key': apiKey,
  };

  const payload = {
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    prompt: 'Modern Japandi living room redesign',
  };

  const endpoints = [
    'https://roomwhiz.com/api/v1/generate',
    'https://roomwhiz.com/api/generate',
    'https://roomwhiz.com/api/v1/redesign',
    'https://api.roomwhiz.com/v1/generate',
    'https://api.roomwhiz.com/generate',
  ];

  for (const ep of endpoints) {
    console.log(`\nTesting endpoint: ${ep}...`);
    try {
      const res = await axios.post(ep, payload, { headers, timeout: 8000 });
      console.log(`✅ SUCCESS [${res.status}] ${ep}:`, res.data);
    } catch (err) {
      console.log(`❌ FAIL [${err.response?.status || 'ERR'}] ${ep} ->`, err.response?.data || err.message);
    }
  }
}

testRoomWhizEndpoints();
