const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testList() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  console.log('Fetching https://api.manus.ai/v2/task.list...');
  try {
    const res = await axios.get('https://api.manus.ai/v2/task.list', { headers });
    console.log('TASK LIST STATUS:', res.status);
    console.log('TASK LIST DATA:', JSON.stringify(res.data, null, 2).slice(0, 1000));
  } catch (err) {
    console.log('TASK LIST ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

testList();
