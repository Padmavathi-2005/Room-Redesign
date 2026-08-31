const axios = require('axios');

// Test Google AI Studio / Vertex AI Imagen 3 endpoint
async function testImagen() {
  const apiKey = process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY || '';
  console.log('Testing Imagen 3 with API Key...');

  if (!apiKey) {
    console.log('Please provide a GCP / Gemini API key (starting with AIzaSy...)');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

  const payload = {
    instances: [
      {
        prompt: 'Photorealistic 8K UHD architectural interior redesign of a Living Room in Modern Japandi style',
      },
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: '1:1',
      outputOptions: {
        mimeType: 'image/jpeg',
      },
    },
  };

  try {
    const res = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
    console.log('✅ IMAGEN 3 SUCCESS! Status:', res.status);
    const predictions = res.data?.predictions;
    if (predictions && predictions.length > 0) {
      console.log('Base64 image length:', predictions[0].bytesBase64Encoded?.length || 'N/A');
    }
  } catch (err) {
    console.log('❌ IMAGEN 3 ERR:', err.response?.status, err.response?.data || err.message);
  }
}

testImagen();
