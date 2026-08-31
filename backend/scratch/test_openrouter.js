const axios = require('axios');

const key = 'sk-_ivAC2sVJNykA34rfPdSV-4ATKpUdX5sZtvJfTqZavOPtho-uJBs0uJWlS1MrI36xLXNu-hFFDmlvjhNJcEhk5FrGY1t';

async function testOpenRouterGen() {
  try {
    console.log('Sending OpenRouter completion request...');
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: 'Say hello in 3 words',
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Room Redesign AI',
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('OpenRouter Test Success:', res.data.choices[0].message.content);
  } catch (err) {
    console.log('OpenRouter Gen Error:', err.response?.status, err.response?.data || err.message);
  }
}

testOpenRouterGen();
