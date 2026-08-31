const axios = require('axios');

const apiKey = 'sk-proj_2ee089a7b0f8c436427101da2fd34e275c46db3f99ff703776feaeef11092fec';

async function testDocSpec() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const payload = {
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    room_type: 'Living Room',
    design_style: 'Modern',
    mode: 'beautiful-redesign',
    ai_intervention: 'medium',
    num_designs: 1,
    project_name: 'API Room Redesign Test',
    project_description: 'Test room redesign via API',
  };

  console.log('Testing RoomWhiz API with exact documentation spec payload...');
  try {
    const res = await axios.post('https://roomwhiz.com/api/v1/generate', payload, { headers, timeout: 45000 });
    console.log('🎉 SUCCESS! Status:', res.status);
    console.log('Response Payload:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('❌ FAIL Status:', err.response?.status);
    console.log('Error Data:', err.response?.data || err.message);
  }
}

testDocSpec();
