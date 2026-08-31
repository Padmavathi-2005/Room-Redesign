require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testNeuralTransform() {
  const sampleImagePath = path.join(__dirname, '../uploads/original/interior_before.png');
  const inputBuffer = fs.readFileSync(sampleImagePath);

  const transformedBuffer = await sharp(inputBuffer)
    .sharpen({ sigma: 1.2 })
    .modulate({ brightness: 1.06, saturation: 1.2, contrast: 1.15 })
    .tint({ r: 248, g: 242, b: 235 })
    .png()
    .toBuffer();

  const dest = path.join(__dirname, '../uploads/generated/test_neural_output.png');
  fs.writeFileSync(dest, transformedBuffer);
  console.log(`✅ Saved transformed image render to ${dest} (Size: ${(transformedBuffer.length / 1024).toFixed(1)} KB)`);
}

testNeuralTransform().catch(console.error);
