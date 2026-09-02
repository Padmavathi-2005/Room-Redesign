const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function cleanUserUploadsAndGenerations() {
  console.log('🧹 Starting cleanup of user uploaded & generated images...');

  // 1. Delete user files in uploads/generated/2026 and uploads/original/2026
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const dirsToClean = [
    path.join(uploadsDir, 'generated', '2026'),
    path.join(uploadsDir, 'original', '2026'),
    path.join(uploadsDir, 'images'),
  ];

  let deletedFilesCount = 0;

  for (const targetDir of dirsToClean) {
    if (fs.existsSync(targetDir)) {
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log(`[Filesystem] Cleared directory: ${targetDir}`);
        deletedFilesCount++;
      } catch (err) {
        console.error(`[Filesystem] Error clearing ${targetDir}:`, err.message);
      }
    }
  }

  // Ensure 2026 directory exists as empty folder
  fs.mkdirSync(path.join(uploadsDir, 'generated', '2026'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'original', '2026'), { recursive: true });

  // 2. Connect to MongoDB and clear user room generations & media files
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in .env');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    
    // Clear roomgenerations collection
    const roomGenRes = await db.collection('roomgenerations').deleteMany({});
    console.log(`[MongoDB] Cleared ${roomGenRes.deletedCount} documents from roomgenerations collection`);

    // Clear rooms collection if exists
    try {
      const roomRes = await db.collection('rooms').deleteMany({});
      console.log(`[MongoDB] Cleared ${roomRes.deletedCount} documents from rooms collection`);
    } catch (e) {}

    // Clear mediafiles collection
    try {
      const mediaRes = await db.collection('mediafiles').deleteMany({});
      console.log(`[MongoDB] Cleared ${mediaRes.deletedCount} documents from mediafiles collection`);
    } catch (e) {}

    console.log('\n✨ Cleanup Complete! All user generated & uploaded images and DB records have been wiped cleanly.');
  } catch (err) {
    console.error('❌ MongoDB Cleanup Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanUserUploadsAndGenerations();
