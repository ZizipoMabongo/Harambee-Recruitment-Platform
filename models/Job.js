import mongoose from 'mongoose';
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skills: { type: [String], default: [] },            // required skills, used for matching
  autoShortlist: { type: Boolean, default: false },   // automation: shortlist strong matches automatically
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
JobSchema.index({ title: 'text', description: 'text', location: 'text', company: 'text' });
export default mongoose.models.Job || mongoose.model('Job', JobSchema);
