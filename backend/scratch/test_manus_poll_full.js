const axios = require('axios');

const API_KEY = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function testManusPolling() {
  const headers = { 'x-manus-api-key': API_KEY, 'Content-Type': 'application/json' };

  console.log('1. Creating Task via Manus API v2...');
  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt: 'Reply with MANUS API TEST SUCCESS', message: { content: 'Reply with MANUS API TEST SUCCESS' } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created! Task ID:', taskId);
  console.log('🔗 Live App Progress URL:', createRes.data?.task_url);

  console.log('\n2. Polling task.listMessages every 10 seconds until Manus agent finishes execution...\n');

  for (let attempt = 1; attempt <= 18; attempt++) {
    await new Promise((r) => setTimeout(r, 10000));
    const elapsed = attempt * 10;

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`\n🎉 TASK COMPLETED (${elapsed}s elapsed)! HTTP Status: ${msgRes.status}`);
      console.log('Messages Response:', JSON.stringify(msgRes.data, null, 2));
      return;
    } catch (err) {
      if (err.response?.status === 404) {
        console.log(`Attempt #${attempt} (${elapsed}s elapsed): Agent running on Manus platform... (HTTP 404 expected during processing)`);
      } else {
        console.log(`Attempt #${attempt} (${elapsed}s elapsed): HTTP ${err.response?.status || 'Err'} -> ${err.response?.data?.error?.message || err.message}`);
      }
    }
  }

  console.log('\n⚠️ Polling finished after 3 minutes. The task is still processing on Manus platform.');
  console.log('Check live status at:', createRes.data?.task_url);
}

testManusPolling();
