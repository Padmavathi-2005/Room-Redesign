const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testEndpoints() {
  console.log('Testing Manus API key:', apiKey.slice(0, 20) + '...\n');

  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const prompt = 'Generate a modern minimalist living room redesign';
  const payload = {
    prompt: prompt,
    message: { content: prompt },
    query: prompt,
  };

  console.log('1. Creating task at https://api.manus.ai/v2/task.create...');
  try {
    const createRes = await axios.post('https://api.manus.ai/v2/task.create', payload, { headers });
    console.log('CREATE RESPONSE STATUS:', createRes.status);
    console.log('CREATE RESPONSE DATA:', JSON.stringify(createRes.data, null, 2));

    const taskId = createRes.data?.task_id || createRes.data?.id;
    console.log('\nTASK ID:', taskId);

    if (!taskId) {
      console.log('No task ID returned!');
      return;
    }

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n2. Testing various GET polling endpoints for task:', taskId);

    const testUrls = [
      `https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.get?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.get?id=${taskId}`,
      `https://api.manus.ai/v2/task.detail?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.detail?id=${taskId}`,
      `https://api.manus.ai/v2/task.messages?task_id=${taskId}`,
      `https://api.manus.ai/v2/tasks/${taskId}`,
      `https://api.manus.im/v1/tasks/${taskId}`,
      `https://api.manus.ai/v1/tasks/${taskId}`,
    ];

    for (const url of testUrls) {
      try {
        const res = await axios.get(url, { headers, timeout: 5000 });
        console.log(`\n✅ URL WORKS: ${url}`);
        console.log(`Status: ${res.status}`);
        console.log(`Data:`, JSON.stringify(res.data, null, 2).slice(0, 500));
      } catch (err) {
        console.log(`❌ URL FAILED: ${url} -> Status ${err.response?.status}: ${JSON.stringify(err.response?.data || err.message)}`);
      }
    }
  } catch (err) {
    console.log('Create task failed:', err.response?.status, err.response?.data || err.message);
  }
}

testEndpoints();
