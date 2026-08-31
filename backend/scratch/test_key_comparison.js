const axios = require('axios');

const oldKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';
const userKey = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function testKeyComparison() {
  console.log('--- Testing Key 1 (sk-_ivAC2s...) ---');
  try {
    const create1 = await axios.post('https://api.manus.ai/v2/task.create', 
      { prompt: 'Key comparison test 1', message: { content: 'Key comparison test 1' } }, 
      { headers: { 'x-manus-api-key': oldKey, 'Content-Type': 'application/json' } }
    );
    console.log('Key 1 Task Created:', create1.data);
    const id1 = create1.data.task_id;

    await new Promise(r => setTimeout(r, 6000));
    try {
      const msg1 = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${id1}`, { headers: { 'x-manus-api-key': oldKey } });
      console.log('Key 1 listMessages SUCCESS:', msg1.status, msg1.data);
    } catch (e) {
      console.log('Key 1 listMessages ERR:', e.response?.status, e.response?.data || e.message);
    }
  } catch (e) {
    console.log('Key 1 Create ERR:', e.response?.status, e.response?.data || e.message);
  }

  console.log('\n--- Testing Key 2 (User Key: sk-i_etowZ...) ---');
  try {
    const create2 = await axios.post('https://api.manus.ai/v2/task.create', 
      { prompt: 'Key comparison test 2', message: { content: 'Key comparison test 2' } }, 
      { headers: { 'x-manus-api-key': userKey, 'Content-Type': 'application/json' } }
    );
    console.log('Key 2 Task Created:', create2.data);
    const id2 = create2.data.task_id;

    await new Promise(r => setTimeout(r, 6000));
    try {
      const msg2 = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${id2}`, { headers: { 'x-manus-api-key': userKey } });
      console.log('Key 2 listMessages SUCCESS:', msg2.status, msg2.data);
    } catch (e) {
      console.log('Key 2 listMessages ERR:', e.response?.status, e.response?.data || e.message);
    }
  } catch (e) {
    console.log('Key 2 Create ERR:', e.response?.status, e.response?.data || e.message);
  }
}

testKeyComparison();
