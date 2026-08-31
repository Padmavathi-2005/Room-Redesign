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

async function testManusWait() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const prompt = 'Generate a modern minimalist living room redesign image';
  const payload = { prompt, message: { content: prompt } };

  console.log('Creating task at https://api.manus.ai/v2/task.create with User Key...');
  const createRes = await axios.post('https://api.manus.ai/v2/task.create', payload, { headers });
  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created. ID:', taskId);

  console.log('\nPolling task.listMessages every 5 seconds for up to 50s...\n');

  for (let i = 1; i <= 10; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const elapsed = i * 5;
    console.log(`Polling Attempt #${i} (Elapsed: ${elapsed}s)...`);

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`✅ Attempt #${i} (${elapsed}s) SUCCESS! Status: ${msgRes.status}`);
      console.log('Response Payload Snippet:', JSON.stringify(msgRes.data).slice(0, 300));

      const urls = extractAllImageUrls(msgRes.data);
      console.log('Extracted Image URLs:', urls);

      if (urls.length > 0) {
        console.log(`\n🎉 MANUS GENERATION FINISHED ON ATTEMPT #${i} (${elapsed}s)!`);
        console.log('Generated Image URL:', urls[0]);
        break;
      }
    } catch (err) {
      console.log(`Attempt #${i} (${elapsed}s) -> Status ${err.response?.status || 'Err'}:`, JSON.stringify(err.response?.data || err.message));
    }
  }
}

testManusWait().catch(console.error);
