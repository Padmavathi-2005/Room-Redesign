const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testCorrectHeaders() {
  // STRICTLY USE x-manus-api-key (NO Authorization: Bearer which breaks Manus JWT validator)
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const prompt = 'Modern luxury living room interior design';
  console.log('1. Creating Task via Manus AI API (x-manus-api-key header)...');

  try {
    const createRes = await axios.post(
      'https://api.manus.ai/v2/task.create',
      { prompt, message: { content: prompt } },
      { headers }
    );

    const taskId = createRes.data?.task_id;
    console.log('✅ Task Created Successfully. Task ID:', taskId);
    console.log('Task App URL:', createRes.data?.task_url);

    console.log('\n2. Polling task.listMessages with x-manus-api-key header...');

    for (let attempt = 1; attempt <= 10; attempt++) {
      await new Promise(r => setTimeout(r, 3000));
      const elapsed = attempt * 3;

      try {
        const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
        console.log(`\n🎉 ATTEMPT #${attempt} (${elapsed}s) SUCCESS! Status: ${msgRes.status}`);
        console.log('Messages Response Data:', JSON.stringify(msgRes.data, null, 2).slice(0, 500));
        return;
      } catch (err) {
        console.log(`Attempt #${attempt} (${elapsed}s) -> HTTP ${err.response?.status || 'Err'}: ${JSON.stringify(err.response?.data || err.message)}`);
      }
    }
  } catch (err) {
    console.log('Task Create Error:', err.response?.status, err.response?.data || err.message);
  }
}

testCorrectHeaders();
