const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

function extractAllImageUrls(obj, foundUrls = new Set()) {
  if (!obj) return Array.from(foundUrls);
  if (typeof obj === 'string') {
    const matches = obj.match(/https?:\/\/[^"\s\)\}\],]+\.(png|jpg|jpeg|webp)(\?[^"\s\)\}\],]+)?/gi);
    if (matches) matches.forEach(url => foundUrls.add(url));
    return Array.from(foundUrls);
  }
  if (Array.isArray(obj)) {
    obj.forEach(item => extractAllImageUrls(item, foundUrls));
    return Array.from(foundUrls);
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      extractAllImageUrls(obj[key], foundUrls);
    }
  }
  return Array.from(foundUrls);
}

async function testManusListPoll() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const prompt = 'Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style';
  console.log('1. Submitting Task to Manus AI v2 (x-manus-api-key)...');

  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt, message: { content: prompt } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created. Task ID:', taskId);

  console.log('\n2. Polling task.list & task.listMessages for up to 45 seconds...');

  for (let attempt = 1; attempt <= 15; attempt++) {
    await new Promise(r => setTimeout(r, 3000));
    const elapsed = attempt * 3;

    try {
      // Step A: Check task.list to see if task is listed & ready
      const listRes = await axios.get('https://api.manus.ai/v2/task.list', { headers });
      const taskObj = listRes.data?.data?.find(t => t.id === taskId);
      const status = taskObj ? taskObj.status : 'queued/initializing';

      console.log(`Attempt #${attempt} (${elapsed}s) -> Task Status in task.list: "${status}"`);

      // Step B: Query listMessages
      try {
        const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
        const urls = extractAllImageUrls(msgRes.data);
        if (urls.length > 0) {
          console.log(`\n🎉 SUCCESS ON ATTEMPT #${attempt} (${elapsed}s)!`);
          console.log('Generated Image URL:', urls[0]);
          return;
        }
      } catch (msgErr) {
        // listMessages returns 404 while task is queued in task.list
      }

      if (taskObj && (taskObj.status === 'completed' || taskObj.status === 'stopped' || taskObj.status === 'error')) {
        if (taskObj.status === 'error') {
          console.log('❌ Task reported error status in task.list');
          return;
        }
      }
    } catch (err) {
      console.log(`Attempt #${attempt} error:`, err.message);
    }
  }
}

testManusListPoll();
