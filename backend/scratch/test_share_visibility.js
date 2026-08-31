const axios = require('axios');

const API_KEY = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function testShareVisibility() {
  const headers = { 'x-manus-api-key': API_KEY, 'Content-Type': 'application/json' };

  console.log('Testing task.create with share_visibility: "public"...');
  try {
    const res = await axios.post('https://api.manus.ai/v2/task.create', {
      prompt: 'Test public task creation',
      message: { content: 'Test public task creation' },
      share_visibility: 'public',
      visibility: 'public'
    }, { headers });
    console.log('CREATE RESPONSE:', res.data);
  } catch (err) {
    console.log('CREATE ERR:', err.response?.status, err.response?.data || err.message);
  }
}

testShareVisibility();
