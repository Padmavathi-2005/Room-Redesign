const axios = require('axios');

const API_KEY = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function testManusImVsAi() {
  const headers = { 'x-manus-api-key': API_KEY, 'Content-Type': 'application/json' };

  console.log('Testing Manus IM Host (api.manus.im)...');
  try {
    const resIm = await axios.post('https://api.manus.im/v2/task.create', {
      prompt: 'Short test',
      message: { content: 'Short test' }
    }, { headers });
    console.log('Manus IM Create OK:', resIm.data);
    const idIm = resIm.data.task_id;

    console.log('\nPolling task.listMessages on api.manus.im vs api.manus.ai...');
    for (let i = 1; i <= 3; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const m1 = await axios.get(`https://api.manus.im/v2/task.listMessages?task_id=${idIm}`, { headers });
        console.log(`api.manus.im listMessages: [${m1.status}]`, m1.data);
      } catch (e) {
        console.log(`api.manus.im listMessages Err: [${e.response?.status}]`, e.response?.data?.error?.message || e.message);
      }

      try {
        const m2 = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${idIm}`, { headers });
        console.log(`api.manus.ai listMessages: [${m2.status}]`, m2.data);
      } catch (e) {
        console.log(`api.manus.ai listMessages Err: [${e.response?.status}]`, e.response?.data?.error?.message || e.message);
      }
    }
  } catch (e) {
    console.log('Manus IM Create Fail:', e.response?.status, e.response?.data || e.message);
  }
}

testManusImVsAi();
