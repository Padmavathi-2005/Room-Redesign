const axios = require('axios');

const apiKey = 'sk-i_etowZTbmAKomnjdWFGwZTjKtqqZKJcKuXbbbzq7tABLXcot0bACJn1Nqx5Nhd0l79lYPgRTyc_kaCw0yQqQ-VNMP8P';

async function scanEndpoints() {
  const headers = {
    'Content-Type': 'application/json',
    'x-manus-api-key': apiKey,
  };

  console.log('1. Creating a fresh task to scan endpoint paths...');
  const createRes = await axios.post(
    'https://api.manus.ai/v2/task.create',
    { prompt: 'Test task scan', message: { content: 'Test task scan' } },
    { headers }
  );

  const taskId = createRes.data?.task_id;
  console.log('Created Task ID:', taskId);
  console.log('Task URL:', createRes.data?.task_url);

  const hosts = ['https://api.manus.ai', 'https://api.manus.im'];

  const testPaths = [
    // GET endpoints
    { method: 'get', path: `/v2/task.list` },
    { method: 'get', path: `/v2/task.list?task_id=${taskId}` },
    { method: 'get', path: `/v2/task.detail?task_id=${taskId}` },
    { method: 'get', path: `/v2/task.get?task_id=${taskId}` },
    { method: 'get', path: `/v2/task.status?task_id=${taskId}` },
    { method: 'get', path: `/v2/task/detail?task_id=${taskId}` },
    { method: 'get', path: `/v2/task/messages?task_id=${taskId}` },
    { method: 'get', path: `/v2/task/get?task_id=${taskId}` },
    { method: 'get', path: `/v2/tasks/${taskId}` },
    { method: 'get', path: `/v2/tasks` },
    { method: 'get', path: `/v1/tasks/${taskId}` },
    { method: 'get', path: `/v1/tasks` },
    { method: 'get', path: `/v2/task.listMessages?task_id=${taskId}` },
    { method: 'get', path: `/v2/task.list_messages?task_id=${taskId}` },
    // POST endpoints
    { method: 'post', path: `/v2/task.get`, body: { task_id: taskId } },
    { method: 'post', path: `/v2/task.detail`, body: { task_id: taskId } },
    { method: 'post', path: `/v2/task.listMessages`, body: { task_id: taskId } },
  ];

  console.log('\n2. Testing all path combinations across hosts...\n');

  for (const host of hosts) {
    for (const item of testPaths) {
      const fullUrl = `${host}${item.path}`;
      try {
        let res;
        if (item.method === 'get') {
          res = await axios.get(fullUrl, { headers, timeout: 5000 });
        } else {
          res = await axios.post(fullUrl, item.body, { headers, timeout: 5000 });
        }
        console.log(`✅ SUCCESS [${res.status}] ${item.method.toUpperCase()} ${fullUrl}`);
        console.log('   Response Data:', JSON.stringify(res.data, null, 2).slice(0, 300));
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        if (status !== 404) {
          console.log(`⚠️ NON-404 RESPONSE [${status}] ${item.method.toUpperCase()} ${fullUrl} -> ${msg}`);
        } else {
          console.log(`❌ 404 [${status}] ${item.method.toUpperCase()} ${fullUrl} -> ${msg}`);
        }
      }
    }
  }
}

scanEndpoints();
