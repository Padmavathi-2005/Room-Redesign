require('dotenv').config();
const axios = require('axios');

async function testManusCall() {
  const key = process.env.MANUS_API_KEY;
  console.log('Using MANUS_API_KEY from .env:', key ? key.slice(0, 15) + '...' : 'NONE');

  const payload = {
    prompt: '[Uploaded Image Provided] Redesign room with Japandi living room',
    image_url: 'http://localhost:5001/uploads/original/interior_before.png',
    negative_prompt: 'blurry',
  };

  try {
    console.log('Sending test POST to https://api.manus.im/v1/tasks...');
    const res = await axios.post('https://api.manus.im/v1/tasks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': key,
      },
    });
    console.log('✅ MANUS API CALL SUCCESS! Status:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ MANUS API CALL ERROR:', err.response?.data || err.message);
  }
}

testManusCall();
