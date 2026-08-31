const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abinayashri1985_db_user:PXON0UtUKRVKSu5k@cluster0.3h4gabt.mongodb.net/roomgpt?retryWrites=true&w=majority&appName=Cluster0';

const SEED_TOOLS = [
  {
    slug: 'floor-plan-generator',
    originalImage: '/uploads/original/floor_plan_generator_before.png',
    convertedImage: '/uploads/generated/floor_plan_generator_after.png',
  },
  {
    slug: '3d-floor-plan',
    originalImage: '/uploads/original/3d_floor_plan_before.png',
    convertedImage: '/uploads/generated/3d_floor_plan_after.png',
  },
  {
    slug: 'floor-plan-maker',
    originalImage: '/uploads/original/3d_floor_plan_before.png',
    convertedImage: '/uploads/generated/floor_plan_generator_after.png',
  },
  {
    slug: 'interior-design',
    originalImage: '/uploads/original/interior_before.png',
    convertedImage: '/uploads/generated/interior_after.png',
  },
  {
    slug: 'kitchen-design',
    originalImage: '/uploads/original/kitchen_before.png',
    convertedImage: '/uploads/generated/kitchen_after.png',
  },
  {
    slug: 'bathroom-design',
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'bedroom-design',
    originalImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'office-design',
    originalImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'ai-room-decorator',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'style-transfer',
    originalImage: '/uploads/original/interior_before.png',
    convertedImage: '/uploads/generated/interior_after.png',
  },
  {
    slug: 'ai-room-cleaner',
    originalImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'paint-color-visualizer',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'change-room-light',
    originalImage: '/uploads/original/interior_before.png',
    convertedImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'ai-wall-design',
    originalImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'ai-flooring-design',
    originalImage: '/uploads/original/flooring_before.png',
    convertedImage: '/uploads/generated/flooring_after.png',
  },
  {
    slug: 'flooring-visualizer',
    originalImage: '/uploads/original/flooring_before.png',
    convertedImage: '/uploads/generated/flooring_after.png',
  },
  {
    slug: 'change-furniture-ai',
    originalImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    convertedImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'exterior-design',
    originalImage: '/uploads/original/exterior_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'landscape-design',
    originalImage: '/uploads/original/exterior_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'garden-design',
    originalImage: '/uploads/original/exterior_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'change-sky',
    originalImage: '/uploads/original/exterior_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'sketch-to-render',
    originalImage: '/uploads/original/floor_plan_generator_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'ai-architecture-generator',
    originalImage: '/uploads/original/exterior_before.png',
    convertedImage: '/uploads/generated/exterior_after.png',
  },
  {
    slug: 'ai-blueprint-generator',
    originalImage: '/uploads/original/floor_plan_generator_before.png',
    convertedImage: '/uploads/generated/floor_plan_generator_after.png',
  },
];

async function syncMongo() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection.db;
  const collection = db.collection('producttools');

  for (const t of SEED_TOOLS) {
    const res = await collection.updateOne(
      { slug: t.slug },
      { $set: { originalImage: t.originalImage, convertedImage: t.convertedImage } }
    );
    console.log(`Updated ${t.slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('MongoDB sync completed cleanly!');
}

syncMongo().catch(console.error);
