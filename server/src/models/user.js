import mongoose from 'mongoose';
export const pointSchema = new mongoose.Schema({ type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [75.7873, 26.9124] } }, { _id: false });
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], required: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  phone: { type: String, select: false }, avatar: String,
  location: { type: pointSchema, default: () => ({}) }, banned: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ location: '2dsphere' });
export const User = mongoose.model('User', schema);
export const publicUser = user => ({ _id: user._id, name: user.name, role: user.role, verificationStatus: user.verificationStatus, avatar: user.avatar, isDemo: user.isDemo });
export const sessionUser = user => ({ ...publicUser(user), email: user.email, location: user.location, banned: user.banned });
