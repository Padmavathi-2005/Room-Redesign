const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testManusIM() {
  console.log('Testing Manus IM API (https://api.manus.im/v1/tasks)...');
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const payload = {
    prompt: 'Generate a modern minimalist living room redesign',
  };

  try {
    const createRes = await axios.post('https://api.manus.im/v1/tasks', payload, { headers });
    console.log('CREATE STATUS:', createRes.status);
    console.log('CREATE DATA:', JSON.stringify(createRes.data, null, 2));

    const taskId = createRes.data?.task_id || createRes.data?.id;
    console.log('TASK ID:', taskId);

    if (taskId) {
      console.log('\nPolling GET https://api.manus.im/v1/tasks/' + taskId + '...');
      for (let i = 1; i <= 5; i++) {
        await new Promise(r => setTimeout(r, 4000));
        try {
          const pollRes = await axios.get(`https://api.manus.im/v1/tasks/${taskId}`, { headers });
          console.log(`Poll Attempt #${i} SUCCESS! Status: ${pollRes.status}`);
          console.log('Data:', JSON.stringify(pollRes.data, null, 2));
        } catch (pollErr) {
          console.log(`Poll Attempt #${i} ERROR:`, pollErr.response?.status, pollErr.response?.data || pollErr.message);
        }
      }
    }
  } catch (err) {
    console.log('CREATE ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

testManusIM();
