const axios = require('axios');

const apiKey = 'sk-proj_2ee089a7b0f8c436427101da2fd34e275c46db3f99ff703776feaeef11092fec';

async function testBase64() {
  console.log('1. Downloading sample room image to Buffer...');
  const imgRes = await axios.get('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', { responseType: 'arraybuffer' });
  const base64Data = `data:image/jpeg;base64,${Buffer.from(imgRes.data).toString('base64')}`;
  console.log('Base64 length:', base64Data.length);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const payload = {
    image_base64: base64Data,
    room_type: 'Living Room',
    design_style: 'Modern',
    mode: 'beautiful-redesign',
    ai_intervention: 'medium',
    num_designs: 1,
    project_name: 'Room Redesign Project',
    project_description: 'Modern room redesign',
  };

  console.log('\n2. Sending request to https://roomwhiz.com/api/v1/generate with image_base64...');
  try {
    const res = await axios.post('https://roomwhiz.com/api/v1/generate', payload, { headers, timeout: 60000 });
    console.log('🎉 SUCCESS! Status:', res.status);
    console.log('Response Payload:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('❌ FAIL Status:', err.response?.status);
    console.log('Error Data:', err.response?.data || err.message);
  }
}

testBase64();
