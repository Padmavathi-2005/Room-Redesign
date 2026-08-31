const axios = require('axios');

const apiKey = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function longPollTest() {
  const headers = { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' };

  console.log('1. Creating Task via Manus API v2...');
  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt: 'Reply with MANUS TEST COMPLETE', message: { content: 'Reply with MANUS TEST COMPLETE' } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created! ID:', taskId);
  console.log('   Task App URL:', createRes.data?.task_url);

  console.log('\n2. Polling task.listMessages every 10 seconds for up to 90s...\n');

  for (let attempt = 1; attempt <= 9; attempt++) {
    await new Promise(r => setTimeout(r, 10000));
    const elapsed = attempt * 10;

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`🎉 SUCCESS ON ATTEMPT #${attempt} (${elapsed}s elapsed)! Status: ${msgRes.status}`);
      console.log('Messages Response:', JSON.stringify(msgRes.data, null, 2));
      return;
    } catch (err) {
      console.log(`Attempt #${attempt} (${elapsed}s elapsed): HTTP ${err.response?.status || 'Err'} -> ${err.response?.data?.error?.message || err.message} (Task still queued/running on Manus platform)`);
    }
  }

  console.log('\nTask is still executing on Manus Agent platform. View live progress at:', createRes.data?.task_url);
}

longPollTest();
