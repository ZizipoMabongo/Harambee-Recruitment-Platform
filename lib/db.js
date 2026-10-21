import mongoose from 'mongoose';

// Reuse one connection across serverless invocations (important on Vercel).
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connect() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (cached.conn) return cached.conn;
  cached.promise ||= mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
