const axios = require('axios');

const apiKey = 'sk-proj_2ee089a7b0f8c436427101da2fd34e275c46db3f99ff703776feaeef11092fec';

async function testRoomWhizHeaders() {
  const payload = {
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    room_type: 'Living Room',
    design_style: 'Modern',
    prompt: 'Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style',
  };

  const headerVariants = [
    { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } },
    { name: 'x-api-key', headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } },
    { name: 'Both', headers: { 'Authorization': `Bearer ${apiKey}`, 'x-api-key': apiKey, 'Content-Type': 'application/json' } },
  ];

  for (const h of headerVariants) {
    console.log(`\nTesting RoomWhiz API with ${h.name}...`);
    try {
      const res = await axios.post('https://roomwhiz.com/api/v1/generate', payload, { headers: h.headers, timeout: 15000 });
      console.log(`✅ SUCCESS [${res.status}]:`, JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log(`❌ FAIL [${err.response?.status || 'ERR'}]:`, err.response?.data || err.message);
    }
  }
}

testRoomWhizHeaders();
