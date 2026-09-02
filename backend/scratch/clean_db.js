const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function cleanDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ No MONGODB_URI found in .env');
    return;
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  // Collections to wipe completely for a fresh clean state
  const targetCollections = [
    'users',
    'projects',
    'rooms',
    'roomgenerations',
    'mediafiles',
    'conversations',
    'notifications',
    'invoices',
    'leads',
    'adminlogs',
    'teams',
    'team'
  ];

  console.log('🧹 Wiping user records & user data collections...');
  const results = {};

  for (const colName of targetCollections) {
    try {
      const col = db.collection(colName);
      const beforeCount = await col.countDocuments();
      if (beforeCount > 0) {
        await col.deleteMany({});
      }
      results[colName] = { before: beforeCount, remaining: 0 };
      console.log(`✅ [${colName}]: Deleted ${beforeCount} documents.`);
    } catch (err) {
      results[colName] = { error: err.message };
    }
  }

  console.log('\n📊 DATABASE CLEANUP SUMMARY:');
  console.table(results);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB Atlas.');
}

cleanDatabase().catch((err) => {
  console.error('❌ Error cleaning database:', err);
  process.exit(1);
});
