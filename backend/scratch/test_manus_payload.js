require('dotenv').config();
const axios = require('axios');

const key = process.env.MANUS_API_KEY;

async function testFullManusPayload() {
  const fullPrompt = '[Source Image: http://localhost:5001/uploads/original/interior_before.png] Redesign the provided source image preserving 100% of non-movable structural walls, doors, windows, and spatial layout. Transformation directive: A modern luxury Japandi living room redesign.';

  const payload = {
    prompt: fullPrompt,
  };

  try {
    console.log('Posting payload to https://api.manus.im/v1/tasks...');
    const res = await axios.post('https://api.manus.im/v1/tasks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': key,
      },
    });
    console.log('✅ Manus Response:', res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testFullManusPayload();
