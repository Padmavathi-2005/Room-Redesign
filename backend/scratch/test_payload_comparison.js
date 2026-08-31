const axios = require('axios');

const apiKey = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function testPayloads() {
  const headers = { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' };

  console.log('--- TEST 1: Standard Prompt Payload ---');
  try {
    const res1 = await axios.post('https://api.manus.ai/v2/task.create', {
      prompt: 'Reply with MANUS TEST 1',
      message: { content: 'Reply with MANUS TEST 1' }
    }, { headers });
    console.log('Test 1 Task Created:', res1.data);
    const id1 = res1.data.task_id;

    console.log('Checking task.listMessages for Test 1 task...');
    await new Promise(r => setTimeout(r, 5000));
    try {
      const msgRes1 = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${id1}`, { headers });
      console.log('✅ Test 1 listMessages OK:', msgRes1.status, msgRes1.data);
    } catch (e) {
      console.log('❌ Test 1 listMessages Err:', e.response?.status, e.response?.data || e.message);
    }
  } catch (e) {
    console.log('Test 1 Create Err:', e.response?.status, e.response?.data || e.message);
  }

  console.log('\n--- TEST 2: Agent Profile Payload ---');
  try {
    const res2 = await axios.post('https://api.manus.ai/v2/task.create', {
      message: { content: [{ type: 'text', text: 'Reply with MANUS TEST 2' }] },
      agent_profile: 'manus-1.6',
      title: 'API Test Task'
    }, { headers });
    console.log('Test 2 Task Created:', res2.data);
    const id2 = res2.data.task_id;

    console.log('Checking task.listMessages for Test 2 task...');
    await new Promise(r => setTimeout(r, 5000));
    try {
      const msgRes2 = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${id2}`, { headers });
      console.log('✅ Test 2 listMessages OK:', msgRes2.status, msgRes2.data);
    } catch (e) {
      console.log('❌ Test 2 listMessages Err:', e.response?.status, e.response?.data || e.message);
    }
  } catch (e) {
    console.log('Test 2 Create Err:', e.response?.status, e.response?.data || e.message);
  }
}

testPayloads();
