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

async function test404Retry() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const prompt = 'Generate a high quality modern luxury living room architectural redesign image';
  console.log('1. Creating Task via Manus AI API (sk-_ivAC2s...)...');

  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt, message: { content: prompt } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created Successfully. Task ID:', taskId);
  console.log('Task App URL:', createRes.data?.task_url);

  console.log('\n2. Polling task.listMessages for up to 45 seconds (ignoring 404 while task initializes)...');

  for (let attempt = 1; attempt <= 15; attempt++) {
    await new Promise(r => setTimeout(r, 3000));
    const elapsed = attempt * 3;

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`\n🎉 ATTEMPT #${attempt} (${elapsed}s) SUCCESS! HTTP Status: ${msgRes.status}`);

      const urls = extractAllImageUrls(msgRes.data);
      console.log('Found Output Image URLs:', urls);

      if (urls.length > 0) {
        console.log(`\n✨ GENERATION COMPLETED IN ${elapsed}s! Output Image URL:`, urls[0]);
        return;
      } else {
        console.log(`Task is running (Status ${msgRes.status}), waiting for image generation output...`);
      }
    } catch (err) {
      console.log(`Attempt #${attempt} (${elapsed}s) -> HTTP ${err.response?.status || 'Err'}: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  console.log('\n❌ Polling finished after 45 seconds without image output.');
}

test404Retry();
