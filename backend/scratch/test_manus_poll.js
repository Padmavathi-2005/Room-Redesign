const axios = require('axios');

const key = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testManusPoll() {
  try {
    console.log('Submitting task...');
    const submitRes = await axios.post(
      'https://api.manus.im/v1/tasks',
      { prompt: 'Floor Plan Design test' },
      {
        headers: {
          'x-manus-api-key': key,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Submit Response:', submitRes.data);
    const taskId = submitRes.data.task_id || submitRes.data.id;

    if (!taskId) {
      console.log('No taskId returned!');
      return;
    }

    const pollEndpoints = [
      `https://api.manus.im/v1/tasks/${taskId}`,
      `https://api.manus.im/v1/tasks/${taskId}/status`,
      `https://api.manus.im/v1/tasks/${taskId}/result`,
      `https://api.manus.im/v1/tasks/${taskId}/output`,
    ];

    for (const ep of pollEndpoints) {
      try {
        const pollRes = await axios.get(ep, {
          headers: { 'x-manus-api-key': key },
        });
        console.log(`✅ SUCCESS polling [${ep}]: Status ${pollRes.status}`);
        console.log('Poll Response:', JSON.stringify(pollRes.data));
        return;
      } catch (err) {
        console.log(`❌ Failed polling [${ep}]: Status ${err.response?.status}`);
      }
    }
  } catch (err) {
    console.error('Submit Error:', err.response?.data || err.message);
  }
}

testManusPoll();
