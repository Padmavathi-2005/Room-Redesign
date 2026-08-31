const axios = require('axios');

let apiKey = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

function extractAllImageUrls(obj, inputImageUrl, foundUrls = []) {
  const cleanInputUrl = inputImageUrl ? inputImageUrl.trim() : '';

  const addUrl = (url) => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (cleanInputUrl && trimmed === cleanInputUrl) return;
    if (trimmed.includes('trycloudflare.com') || trimmed.includes('localhost')) return;
    if (!foundUrls.includes(trimmed)) {
      foundUrls.push(trimmed);
    }
  };

  const search = (item) => {
    if (!item) return;

    if (typeof item === 'string') {
      const extMatches = item.match(/https?:\/\/[^"\s\)\}\],]+\.(png|jpg|jpeg|webp|gif)(\?[^"\s\)\}\],]+)?/gi);
      if (extMatches) extMatches.forEach(addUrl);
      const manusCdnMatches = item.match(/https?:\/\/[^"\s\)\}\],]*manuscdn[^"\s\)\}\],]+/gi);
      if (manusCdnMatches) manusCdnMatches.forEach(addUrl);
      return;
    }

    if (Array.isArray(item)) {
      item.forEach((subItem) => search(subItem));
      return;
    }

    if (typeof item === 'object') {
      if (typeof item.url === 'string') addUrl(item.url);
      if (typeof item.file_url === 'string') addUrl(item.file_url);
      if (typeof item.download_url === 'string') addUrl(item.download_url);
      if (typeof item.image_url === 'string') addUrl(item.image_url);

      for (const key of Object.keys(item)) {
        search(item[key]);
      }
    }
  };

  search(obj);
  return foundUrls;
}

async function testFullCycle() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
  };

  const inputImageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';
  const prompt = `Generate a photorealistic modern living room redesign. Source Image: ${inputImageUrl}`;

  console.log('1. Submitting Task to Manus AI v2...');
  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt, message: { content: prompt } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created! ID:', taskId);
  console.log('App Link:', createRes.data?.task_url);

  console.log('\n2. Polling task.listMessages & task.list for up to 60 seconds...');

  for (let attempt = 1; attempt <= 15; attempt++) {
    await new Promise(r => setTimeout(r, 4000));
    const elapsed = attempt * 4;

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`Attempt #${attempt} (${elapsed}s) -> listMessages status: ${msgRes.status}`);

      const urls = extractAllImageUrls(msgRes.data, inputImageUrl);
      console.log(`   Found Image URLs:`, urls);

      if (urls.length > 0) {
        console.log(`\n🎉 SUCCESS ON ATTEMPT #${attempt} (${elapsed}s)! Output Image URL:`, urls[0]);
        return;
      }
    } catch (err) {
      console.log(`Attempt #${attempt} (${elapsed}s) listMessages status: ${err.response?.status || err.message}`);
    }
  }
}

testFullCycle();
