const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testQueryParams() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const prompt = 'Test room redesign';
  console.log('1. Creating task at https://api.manus.ai/v2/task.create...');

  try {
    const createRes = await axios.post(
      'https://api.manus.ai/v2/task.create',
      { prompt, message: { content: prompt } },
      { headers }
    );

    console.log('CREATE RESPONSE DATA:', JSON.stringify(createRes.data, null, 2));

    const taskId = createRes.data?.task_id || createRes.data?.id;
    console.log('\nTASK ID:', taskId);

    if (!taskId) return;

    // Test different query parameter names
    const queryVariants = [
      `https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.listMessages?id=${taskId}`,
      `https://api.manus.ai/v2/task.listMessages?chat_id=${taskId}`,
      `https://api.manus.ai/v2/task.listMessages?session_id=${taskId}`,
      `https://api.manus.ai/v2/task.detail?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.detail?id=${taskId}`,
      `https://api.manus.ai/v2/task.get?task_id=${taskId}`,
      `https://api.manus.ai/v2/task.get?id=${taskId}`,
    ];

    console.log('\n2. Testing Query Parameter Variants...');
    for (const url of queryVariants) {
      try {
        const res = await axios.get(url, { headers, timeout: 5000 });
        console.log(`\n✅ SUCCESS URL: ${url}`);
        console.log('   Status:', res.status);
        console.log('   Data:', JSON.stringify(res.data, null, 2).slice(0, 400));
      } catch (err) {
        console.log(`❌ FAILED URL: ${url} -> Status ${err.response?.status}: ${JSON.stringify(err.response?.data || err.message)}`);
      }
    }
  } catch (err) {
    console.log('Create failed:', err.response?.status, err.response?.data || err.message);
  }
}

testQueryParams();
