const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testListCheck() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  try {
    const res = await axios.get('https://api.manus.ai/v2/task.list', { headers });
    console.log('TOTAL TASKS FOUND IN TASK.LIST:', res.data?.data?.length);
    if (res.data?.data) {
      console.log('LATEST 5 TASKS:');
      res.data.data.slice(0, 5).forEach(t => {
        console.log(`- ID: ${t.id} | Status: ${t.status} | Title: ${t.title} | URL: ${t.task_url}`);
      });
    }
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

testListCheck();
