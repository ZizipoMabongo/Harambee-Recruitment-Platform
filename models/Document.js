import mongoose from 'mongoose';
const DocumentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  kind: { type: String, enum: ['cv', 'certificate', 'id', 'other'], default: 'other' },
  mime: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
}, { timestamps: true });
export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
