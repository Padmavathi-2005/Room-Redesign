require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.MANUS_API_KEY ? process.env.MANUS_API_KEY.trim() : '';

async function testManusV2() {
  console.log('Testing Manus AI v2 API (https://api.manus.ai/v2/task.create)...');
  console.log('Using Key:', apiKey.slice(0, 15) + '...\n');

  const imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';
  const userPrompt = 'Redesign this room into a modern luxury Japandi living room';
  const manusCombinedPrompt = `${imageUrl} ${userPrompt}`;

  try {
    const res = await axios.post(
      'https://api.manus.ai/v2/task.create',
      {
        message: {
          content: manusCombinedPrompt,
        },
        prompt: manusCombinedPrompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-manus-api-key': apiKey,
          'API_KEY': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ MANUS V2 TASK CREATE SUCCESS! Status:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));

    const taskId = res.data?.task_id || res.data?.id || res.data?.data?.id;
    if (taskId) {
      console.log(`\nTesting Manus v2 Task Detail Polling (task_id: ${taskId})...`);
      const detailRes = await axios.get(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
        headers: {
          'x-manus-api-key': apiKey,
          'API_KEY': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000,
      });
      console.log('✅ MANUS V2 TASK DETAIL SUCCESS! Status:', detailRes.status);
      console.log('Detail Response:', JSON.stringify(detailRes.data, null, 2));
    }
  } catch (err) {
    console.error('❌ MANUS V2 ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

testManusV2();
