require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const key = process.env.MANUS_API_KEY;

async function testAttachment() {
  const sampleImagePath = path.join(__dirname, '../uploads/original/interior_before.png');
  const buffer = fs.readFileSync(sampleImagePath);
  const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

  const payload = {
    prompt: 'Redesign this room into a modern luxury Japandi living room preserving exact wall layout.',
    attachments: [
      {
        filename: 'room_image.png',
        file_data: base64,
      },
    ],
  };

  try {
    console.log('Sending test POST with attachment payload to Manus API...');
    const res = await axios.post('https://api.manus.im/v1/tasks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': key,
      },
    });
    console.log('✅ MANUS ATTACHMENT TEST SUCCESS! Status:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ MANUS ATTACHMENT ERROR:', err.response?.data || err.message);
  }
}

testAttachment();
