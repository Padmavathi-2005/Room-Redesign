const axios = require('axios');

const apiKey = 'sk-proj_2ee089a7b0f8c436427101da2fd34e275c46db3f99ff703776feaeef11092fec';

async function testVariations() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const sampleUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';

  const variants = [
    { name: 'v1: capital room_type & design_style', data: { image_url: sampleUrl, room_type: 'Living Room', design_style: 'Modern' } },
    { name: 'v2: lowercase room_type & design_style', data: { image_url: sampleUrl, room_type: 'living_room', design_style: 'modern' } },
    { name: 'v3: with mode & ai_intervention', data: { image_url: sampleUrl, room_type: 'Living Room', design_style: 'Modern', mode: 'beautiful-redesign', ai_intervention: 'medium' } },
    { name: 'v4: with num_designs', data: { image_url: sampleUrl, room_type: 'Living Room', design_style: 'Modern', num_designs: 1 } },
  ];

  for (const v of variants) {
    console.log(`\nTesting ${v.name}...`);
    try {
      const res = await axios.post('https://roomwhiz.com/api/v1/generate', v.data, { headers, timeout: 15000 });
      console.log(`🎉 SUCCESS [${res.status}]:`, JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log(`❌ FAIL [${err.response?.status}]:`, err.response?.data || err.message);
    }
  }
}

testVariations();
