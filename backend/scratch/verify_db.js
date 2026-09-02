const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function verifyDBCleanup() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('No MONGODB_URI found');
    return;
  }

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const collections = ['roomgenerations', 'rooms', 'mediafiles', 'conversations'];
  
  for (const colName of collections) {
    try {
      const count = await db.collection(colName).countDocuments();
      console.log(`Collection [${colName}]: ${count} documents remaining.`);
    } catch (e) {
      console.log(`Collection [${colName}]: 0 (or does not exist)`);
    }
  }

  await mongoose.disconnect();
}

verifyDBCleanup();
