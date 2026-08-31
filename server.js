const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/generate', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure public directory and uploads folder exist
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to print neat console logs
function printNeatBox(title, content) {
  const width = 70;
  const line = "═".repeat(width);
  console.log(`\n\x1b[36m╔${line}╗\x1b[0m`);
  console.log(`\x1b[36m║ \x1b[1m\x1b[33m${title.padEnd(width - 1)}\x1b[0m\x1b[36m ║\x1b[0m`);
  console.log(`\x1b[36m╠${line}╣\x1b[0m`);
  
  const rawLines = content.split('\n');
  for (let rawLine of rawLines) {
    let cleanLine = rawLine.replace(/\r/g, '');
    if (cleanLine.length === 0) {
      console.log(`\x1b[36m║\x1b[0m ${"".padEnd(width - 1)} \x1b[36m║\x1b[0m`);
      continue;
    }
    while (cleanLine.length > 0) {
      let chunk = cleanLine.slice(0, width - 2);
      console.log(`\x1b[36m║\x1b[0m ${chunk.padEnd(width - 2)} \x1b[36m║\x1b[0m`);
      cleanLine = cleanLine.slice(width - 2);
    }
  }
  console.log(`\x1b[36m╚${line}╝\x1b[0m\n`);
}

function logStep(stepNum, message) {
  console.log(`\x1b[32m[STEP ${stepNum}]\x1b[0m ${message}`);
}

// Helper to recursively extract all image URLs from Manus AI response objects
function extractAllImageUrls(obj, foundUrls = new Set()) {
  if (!obj) return Array.from(foundUrls);

  if (typeof obj === 'string') {
    const matches = obj.match(/https?:\/\/[^"\s\)\}\],]+\.(png|jpg|jpeg|webp)(\?[^"\s\)\}\],]+)?/gi);
    if (matches) {
      matches.forEach(url => foundUrls.add(url));
    }
    return Array.from(foundUrls);
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => extractAllImageUrls(item, foundUrls));
    return Array.from(foundUrls);
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key === 'url' || key === 'image_url' || key === 'output') {
        const val = obj[key];
        if (typeof val === 'string' && val.startsWith('http')) {
          if (/\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(val) || val.includes('image')) {
            foundUrls.add(val);
          }
        }
      }
      extractAllImageUrls(obj[key], foundUrls);
    }
  }

  return Array.from(foundUrls);
}

// SSE process endpoint
app.get('/api/process', async (req, res) => {
  const { imageUrl, prompt } = req.query;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Both imageUrl and prompt query parameters are required.' });
  }

  // Set headers for SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (step, message, details = {}) => {
    res.write(`data: ${JSON.stringify({ step, message, ...details })}\n\n`);
  };

  try {
    let targetUrl = imageUrl;

    // ----------------------------------------------------
    // STEP 1: Fetching & Storing original image in /uploads/
    // ----------------------------------------------------
    logStep(1, `Received request for image URL: ${imageUrl}`);
    sendProgress('fetching_image', 'Downloading source image to uploads section...');

    let imageBuffer;
    let extension = 'jpg';

    try {
      let response = await axios.get(targetUrl, { responseType: 'arraybuffer', timeout: 20000 });
      let contentType = response.headers['content-type'] || '';
      let cleanType = contentType.split(';')[0].trim().toLowerCase();

      // Handle Unsplash HTML page URLs by extracting direct CDN image link
      if (cleanType === 'text/html') {
        logStep(1, `Content is HTML page. Extracting direct image link...`);
        const htmlContent = Buffer.from(response.data).toString('utf-8');
        const imageMatch = htmlContent.match(/https:\/\/images\.unsplash\.com\/photo-[^"\s\?]+/);

        if (imageMatch) {
          const extractedUrl = imageMatch[0] + '?q=80&w=1000';
          logStep(1, `Extracted direct image URL: ${extractedUrl}`);
          response = await axios.get(extractedUrl, { responseType: 'arraybuffer', timeout: 20000 });
          contentType = response.headers['content-type'] || 'image/jpeg';
          cleanType = contentType.split(';')[0].trim().toLowerCase();
        } else {
          sendProgress('error', 'Could not extract direct image link from the provided web page.');
          return res.end();
        }
      }

      imageBuffer = Buffer.from(response.data);

      if (cleanType.includes('png')) extension = 'png';
      else if (cleanType.includes('webp')) extension = 'webp';
      else if (cleanType.includes('gif')) extension = 'gif';
      else extension = 'jpg';

      // Save original uploaded image into /uploads directory
      const uploadFilename = `upload_${Date.now()}.${extension}`;
      const uploadPath = path.join(uploadsDir, uploadFilename);
      fs.writeFileSync(uploadPath, imageBuffer);

      const localUploadUrl = `/uploads/${uploadFilename}`;
      logStep(1, `Successfully stored original image in uploads: ${localUploadUrl}`);
      sendProgress('image_stored', `Original image saved to uploads folder (${localUploadUrl})`, { uploadUrl: localUploadUrl });

    } catch (err) {
      logStep(1, `❌ Error downloading image: ${err.message}`);
      sendProgress('error', `Failed to download source image: ${err.message}`);
      return res.end();
    }

    // ----------------------------------------------------
    // STEP 2: Preparing Manus AI Prompt (Embedding Image URL in Prompt String)
    // ----------------------------------------------------
    logStep(2, 'Formatting combined Manus AI prompt (Image URL + User Prompt)...');
    sendProgress('preparing_prompt', 'Formatting combined prompt for Manus AI...');

    // Embed the target image URL directly inside the prompt string parameter as requested
    const manusCombinedPrompt = `${targetUrl} ${prompt}`;

    printNeatBox('MANUS AI PROMPT PAYLOAD', `COMBINED PROMPT:\n${manusCombinedPrompt}`);
    sendProgress('prompt_prepared', 'Manus AI prompt formatted successfully!', { combinedPrompt: manusCombinedPrompt });

    // ----------------------------------------------------
    // STEP 3: Dispatching to Manus AI Task API & Polling
    // ----------------------------------------------------
    logStep(3, 'Dispatching request to Manus AI Agent API...');
    sendProgress('generating_image', 'Sending task to Manus AI Agent...');

    const apiKey = process.env.MANUS_API_KEY ? process.env.MANUS_API_KEY.trim() : '';

    if (!apiKey) {
      logStep(3, '❌ MANUS_API_KEY is not defined in .env file.');
      sendProgress('error', 'MANUS_API_KEY missing in server .env configuration.');
      return res.end();
    }

    let returnedImageUrls = [];

    try {
      logStep(3, `Calling Manus API (v2/task.create)...`);
      const manusResponse = await axios.post(
        'https://api.manus.ai/v2/task.create',
        {
          prompt: manusCombinedPrompt
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-manus-api-key': apiKey,
            'API_KEY': apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000,
        }
      );

      const taskData = manusResponse.data;
      const taskId = taskData?.task_id || taskData?.id || taskData?.data?.id;

      let extractedInitial = extractAllImageUrls(taskData);
      extractedInitial.forEach(url => returnedImageUrls.push(url));

      if (taskId) {
        logStep(3, `Manus task created successfully (Task ID: ${taskId}). Polling for results...`);
        sendProgress('generating_image', `Manus AI task running (${taskId}). Monitoring execution...`);

        for (let attempt = 0; attempt < 240; attempt++) {
          await new Promise((res) => setTimeout(res, 5000));
          const elapsed = (attempt + 1) * 5;
          sendProgress('generating_image', `Manus AI Agent processing redesign... (${elapsed}s elapsed)`);

          try {
            let statusRes;
            try {
              statusRes = await axios.get(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
                headers: {
                  'x-manus-api-key': apiKey,
                  'API_KEY': apiKey,
                  Authorization: `Bearer ${apiKey}`,
                },
                timeout: 20000,
              });
            } catch (e1) {
              statusRes = await axios.get(`https://api.manus.ai/v1/tasks/${taskId}`, {
                headers: {
                  'x-manus-api-key': apiKey,
                  'API_KEY': apiKey,
                  Authorization: `Bearer ${apiKey}`,
                },
                timeout: 20000,
              });
            }

            const sData = statusRes.data;
            const statusStr = (sData?.status || sData?.data?.status || '').toLowerCase();

            const polledUrls = extractAllImageUrls(sData);
            polledUrls.forEach(url => {
              if (!returnedImageUrls.includes(url)) returnedImageUrls.push(url);
            });

            if (statusStr === 'completed' || statusStr === 'stopped' || statusStr === 'done' || (attempt > 0 && attempt % 3 === 0)) {
              try {
                const msgRes = await axios.get(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, {
                  headers: {
                    'x-manus-api-key': apiKey,
                    'API_KEY': apiKey,
                    Authorization: `Bearer ${apiKey}`,
                  },
                  timeout: 15000,
                });
                const msgUrls = extractAllImageUrls(msgRes.data);
                msgUrls.forEach(url => {
                  if (!returnedImageUrls.includes(url)) returnedImageUrls.push(url);
                });
              } catch (msgErr) {
                // Ignore listing message errors
              }
            }

            if (returnedImageUrls.length > 0 || statusStr === 'completed' || statusStr === 'stopped' || statusStr === 'done') {
              if (returnedImageUrls.length > 0) {
                logStep(3, `Manus returned ${returnedImageUrls.length} output image(s).`);
                break;
              }
            }
          } catch (pollErr) {
            logStep(3, `Polling Manus attempt ${attempt + 1}: ${pollErr.message}`);
          }
        }
      }
    } catch (manusErr) {
      logStep(3, `❌ Manus API call error: ${manusErr.message}`);
      sendProgress('error', `Manus AI API returned an error: ${manusErr.message}`);
      return res.end();
    }

    if (returnedImageUrls.length === 0) {
      logStep(3, `❌ Manus AI completed but returned no output images.`);
      sendProgress('error', 'Manus AI task completed, but no generated images were found in the response.');
      return res.end();
    }

    // ----------------------------------------------------
    // STEP 4: Store Returned Image(s) in /uploads/ & Finalize
    // ----------------------------------------------------
    logStep(4, `Downloading and storing ${returnedImageUrls.length} returned image(s) in uploads directory...`);
    sendProgress('saving_outputs', `Saving ${returnedImageUrls.length} generated image(s) to uploads folder...`);

    const localGeneratedUrls = [];
    const timestamp = Date.now();

    for (let i = 0; i < returnedImageUrls.length; i++) {
      const imgUrl = returnedImageUrls[i];
      try {
        const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const imgBuffer = Buffer.from(imgRes.data);
        const filename = `generated_${timestamp}_${i + 1}.png`;
        const outputPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outputPath, imgBuffer);

        const localUrl = `/uploads/${filename}`;
        localGeneratedUrls.push(localUrl);
        logStep(4, `Saved returned image [${i + 1}/${returnedImageUrls.length}]: ${localUrl}`);
      } catch (dlErr) {
        logStep(4, `⚠️ Could not download returned image ${imgUrl}: ${dlErr.message}`);
        // If download fails, pass original remote URL as fallback
        localGeneratedUrls.push(imgUrl);
      }
    }

    logStep(4, `Pipeline completed successfully! Returned ${localGeneratedUrls.length} image(s).`);
    sendProgress('complete', 'Processing complete!', {
      originalUrl: imageUrl,
      generatedUrls: localGeneratedUrls
    });

    res.end();

  } catch (err) {
    logStep(5, `❌ Unexpected error: ${err.message}`);
    sendProgress('error', `An unexpected server error occurred: ${err.message}`);
    res.end();
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`\n\x1b[1m\x1b[35m🚀 Manus AI Image Processor running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[37mOpen your browser and navigate to http://localhost:${PORT}\x1b[0m\n`);
});
