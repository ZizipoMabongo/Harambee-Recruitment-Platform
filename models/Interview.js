import mongoose from 'mongoose';
const InterviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
  scheduledAt: { type: Date, required: true },
  location: { type: String, default: '' },
  note: { type: String, default: '' },
  status: { type: String, enum: ['invited', 'accepted', 'declined'], default: 'invited' },
}, { timestamps: true });
export default mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
