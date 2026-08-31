require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.MANUS_API_KEY ? process.env.MANUS_API_KEY.trim() : '';

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

async function testManusPolling() {
  const imageUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';
  const prompt = `${imageUrl}\nPhotorealistic 8K UHD architectural interior redesign of a Living Room. Design Style: Modern Japandi. Strict Preservation: Lock 1:1 camera angle and structural walls.`;

  console.log('Submitting task to Manus AI v2 (https://api.manus.ai/v2/task.create)...');
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
    'API_KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  const createRes = await axios.post('https://api.manus.ai/v2/task.create', { prompt, message: { content: prompt } }, { headers });
  const taskId = createRes.data?.task_id;
  console.log('✅ Task Created. ID:', taskId);
  console.log('Task URL:', createRes.data?.task_url);

  console.log('\nPolling task execution for up to 30 seconds...');
  for (let i = 1; i <= 6; i++) {
    await new Promise(r => setTimeout(r, 5000));
    console.log(`Polling attempt ${i} (Elapsed: ${i * 5}s)...`);

    try {
      const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, { headers });
      console.log(`Message Response Status: ${msgRes.status}`);
      const urls = extractAllImageUrls(msgRes.data);
      console.log('Found Image URLs:', urls);
      if (urls.length > 0) {
        console.log('🎉 SUCCESS! Found Manus Generated Image URL:', urls[0]);
        break;
      }
    } catch (err) {
      console.log('Polling error:', err.response?.status, err.response?.data || err.message);
    }
  }
}

testManusPolling().catch(console.error);
