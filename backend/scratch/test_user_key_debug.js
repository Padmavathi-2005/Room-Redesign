const axios = require('axios');

const apiKey = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function debugTaskList() {
  const headers = { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' };

  console.log('1. Fetching task.list...');
  try {
    const listRes = await axios.get('https://api.manus.ai/v2/task.list', { headers });
    console.log('TASK LIST RESPONSE:', JSON.stringify(listRes.data, null, 2));
  } catch (err) {
    console.log('TASK LIST ERROR:', err.response?.status, err.response?.data || err.message);
  }

  console.log('\n2. Creating a task...');
  let taskId = '';
  try {
    const createRes = await axios.post(
      'https://api.manus.ai/v2/task.create',
      { message: { content: [{ type: 'text', text: 'Reply with MANUS TEST SUCCESS' }] }, agent_profile: 'manus-1.6', title: 'API Test' },
      { headers }
    );
    console.log('CREATE RES:', createRes.data);
    taskId = createRes.data.task_id;
  } catch (err) {
    console.log('CREATE ERR:', err.response?.status, err.response?.data || err.message);
    return;
  }

  console.log(`\n3. Task created with ID: ${taskId}. Polling task.list and task.listMessages every 10s for 60s...`);

  for (let i = 1; i <= 6; i++) {
    await new Promise(r => setTimeout(r, 10000));
    console.log(`\n--- Attempt ${i} (${i * 10}s) ---`);

    // Check task.list
    try {
      const listRes = await axios.get('https://api.manus.ai/v2/task.list', { headers });
      const foundInList = listRes.data?.data?.find((t) => t.id === taskId || t.task_id === taskId);
      console.log(`task.list check: ${foundInList ? 'FOUND in list!' : 'Not in task.list'}`);
      if (foundInList) {
        console.log('Found Task Status:', foundInList);
      }
    } catch (err) {
      console.log('task.list err:', err.response?.status, err.response?.data || err.message);
    }

    // Check task.listMessages
    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`task.listMessages check: SUCCESS [${msgRes.status}]!`);
      console.log('Messages Data:', JSON.stringify(msgRes.data, null, 2).slice(0, 500));
      break;
    } catch (err) {
      console.log(`task.listMessages err: [${err.response?.status}] ${err.response?.data?.error?.message || err.message}`);
    }
  }
}

debugTaskList();
