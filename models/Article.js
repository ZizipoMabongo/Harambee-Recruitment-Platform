import mongoose from 'mongoose';
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  body: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
}, { timestamps: true });
ArticleSchema.index({ title: 'text', body: 'text' });
ArticleSchema.index({ category: 1, status: 1, createdAt: -1 });
export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
