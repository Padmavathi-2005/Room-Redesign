const axios = require('axios');

const key = 'sk-Qk7Psg9VqpSUFIcmaC4ahAX6uAtjo0D_Cb2Dw2z8wHe1rML1ycFjgjXKmq7Ck-ZNcAyZsjH4Wwhh7qdasSczwpJcFMoc';

async function testKey() {
  console.log('Testing key against Manus API (https://api.manus.im/v1)...');
  try {
    const res1 = await axios.get('https://api.manus.im/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    console.log('Manus API Success:', res1.status);
  } catch (err) {
    console.log('Manus API Error:', err.response?.status, err.response?.data || err.message);
  }

  console.log('\nTesting key against OpenAI API (https://api.openai.com/v1)...');
  try {
    const res2 = await axios.get('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    console.log('OpenAI API Success:', res2.status);
  } catch (err) {
    console.log('OpenAI API Error:', err.response?.status, err.response?.data || err.message);
  }
}

testKey();
