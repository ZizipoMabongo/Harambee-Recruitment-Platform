import mongoose from 'mongoose';
const S = mongoose.Schema;
const ProfileSchema = new S({
  user: { type: S.Types.ObjectId, ref: 'User', required: true, unique: true },
  headline: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  summary: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: [{ role: String, company: String, from: String, to: String, desc: String }], default: [] },
  education: { type: [{ school: String, qualification: String, year: String }], default: [] },
  visible: { type: Boolean, default: false },   // candidate consents to recruiters browsing their profile
  openToWork: { type: Boolean, default: true },
}, { timestamps: true });
ProfileSchema.index({ headline: 'text', summary: 'text', location: 'text', skills: 'text' });
export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
