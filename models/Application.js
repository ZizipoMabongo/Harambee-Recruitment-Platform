import mongoose from 'mongoose';
const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverNote: { type: String, default: '' },
  status: { type: String, enum: ['applied', 'shortlisted', 'interview', 'offer', 'rejected'], default: 'applied' },
  matchScore: { type: Number, default: 0 },
  matchLabel: { type: String, default: 'low' },
  matchNotes: { type: [String], default: [] },
}, { timestamps: true });
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true }); // one application per job
export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
