const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadDistinct2DBlueprint() {
  const url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800';
  const dest = path.join(__dirname, '../uploads/original/3d_floor_plan_before.png');
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(dest, Buffer.from(res.data));
  console.log('Saved distinct 3d_floor_plan_before.png successfully!');
}

downloadDistinct2DBlueprint().catch(console.error);
