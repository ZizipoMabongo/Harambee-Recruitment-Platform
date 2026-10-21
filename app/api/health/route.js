import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import { json } from '@/lib/auth';

// Simple uptime check for monitoring: GET /api/health
export async function GET() {
  const t = Date.now();
  try {
    await connect();
    await mongoose.connection.db.admin().ping();
    return json({ ok: true, dbMs: Date.now() - t });
  } catch {
    return json({ ok: false }, 503);
  }
}
