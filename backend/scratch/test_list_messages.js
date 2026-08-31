const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testListMsg() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const taskId = 'bZCX2bNY7wLxjg76S7jLKm';
  console.log(`Fetching task.listMessages for listed task #${taskId}...`);
  try {
    const res = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(res.data, null, 2).slice(0, 1000));
  } catch (err) {
    console.log('ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

testListMsg();
