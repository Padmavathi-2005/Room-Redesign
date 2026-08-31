const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testAll() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const createEndpoints = [
    { name: 'Manus IM v1', url: 'https://api.manus.im/v1/tasks', payload: { prompt: 'Redesign room' } },
    { name: 'Manus AI v2', url: 'https://api.manus.ai/v2/task.create', payload: { prompt: 'Redesign room', message: { content: 'Redesign room' } } },
    { name: 'Manus IM v2', url: 'https://api.manus.im/v2/task.create', payload: { prompt: 'Redesign room', message: { content: 'Redesign room' } } },
    { name: 'Manus AI v1', url: 'https://api.manus.ai/v1/tasks', payload: { prompt: 'Redesign room' } },
  ];

  for (const ep of createEndpoints) {
    console.log(`\n=== Testing Create: ${ep.name} (${ep.url}) ===`);
    try {
      const res = await axios.post(ep.url, ep.payload, { headers, timeout: 10000 });
      console.log('✅ CREATED! Status:', res.status);
      console.log('Response:', JSON.stringify(res.data, null, 2));

      const taskId = res.data?.task_id || res.data?.id || res.data?.data?.id;
      if (taskId) {
        console.log('Created Task ID:', taskId);

        // Test polling endpoints
        const pollCandidates = [
          `https://api.manus.ai/v2/task.detail?task_id=${taskId}`,
          `https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`,
          `https://api.manus.im/v2/task.detail?task_id=${taskId}`,
          `https://api.manus.im/v2/task.listMessages?task_id=${taskId}`,
          `https://api.manus.im/v1/tasks/${taskId}`,
          `https://api.manus.ai/v1/tasks/${taskId}`,
        ];

        for (const pollUrl of pollCandidates) {
          try {
            const pollRes = await axios.get(pollUrl, { headers, timeout: 5000 });
            console.log(`   🎉 POLL SUCCESS: ${pollUrl} -> Status ${pollRes.status}`);
            console.log('   Data:', JSON.stringify(pollRes.data, null, 2).slice(0, 300));
          } catch (pollErr) {
            console.log(`   ❌ POLL FAILED: ${pollUrl} -> Status ${pollErr.response?.status}: ${pollErr.response?.data?.message || pollErr.message}`);
          }
        }
      }
    } catch (err) {
      console.log('❌ CREATE FAILED:', err.response?.status, err.response?.data || err.message);
    }
  }
}

testAll();
