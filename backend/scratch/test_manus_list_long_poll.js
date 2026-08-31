const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testLongPoll() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';
  const prompt = `Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style. Lock 1:1 camera angle and structural walls. Source Image: ${imageUrl}`;

  console.log('1. Creating Manus AI Task...');
  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt, message: { content: prompt } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created! ID:', taskId);
  console.log('Task Platform Link:', createRes.data?.task_url);

  console.log('\n2. Polling task.list every 10 seconds for up to 90s...');

  for (let i = 1; i <= 9; i++) {
    await new Promise(r => setTimeout(r, 10000));
    const elapsed = i * 10;

    try {
      const listRes = await axios.get('https://api.manus.ai/v2/task.list', { headers });
      const taskObj = listRes.data?.data?.find(t => t.id === taskId);

      if (taskObj) {
        console.log(`Poll Attempt #${i} (${elapsed}s) -> Task Status in task.list: "${taskObj.status}" | Title: "${taskObj.title}"`);
        
        // Try listMessages once task is found in task.list
        try {
          const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
          console.log(`   🎉 listMessages SUCCESS (HTTP ${msgRes.status})!`);
          console.log('   Payload Snippet:', JSON.stringify(msgRes.data).slice(0, 300));
          return;
        } catch (msgErr) {
          console.log(`   listMessages status: ${msgErr.response?.status}`);
        }
      } else {
        console.log(`Poll Attempt #${i} (${elapsed}s) -> Task not yet in task.list queue.`);
      }
    } catch (err) {
      console.log(`Poll Attempt #${i} error:`, err.message);
    }
  }
}

testLongPoll();
