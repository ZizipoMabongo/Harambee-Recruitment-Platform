import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: 'info' },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '/notifications' },
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
