import mongoose from 'mongoose';
const MessageSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
}, { timestamps: true });
export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
