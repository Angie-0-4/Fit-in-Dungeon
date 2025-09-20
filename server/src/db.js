import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    console.error('❌ MONGODB_URI fehlt. Check .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}