import mongoose from 'mongoose';
import { pointSchema } from './user.js';
export { User, publicUser, sessionUser } from './user.js';
const { Schema } = mongoose;
const ref = name => ({ type: Schema.Types.ObjectId, ref: name });
const model = (name, fields, indexes = []) => { const schema = new Schema(fields, { timestamps: true }); for (const [keys, options] of indexes) schema.index(keys, options); return mongoose.model(name, schema); };
export const DonorProfile = model('DonorProfile', { user: { ...ref('User'), unique: true }, donorType: String, businessName: String, fssaiNumber: String, address: String, documents: [String], templates: [{ name: String, foodName: String, description: String, category: String, dietType: String, servings: Number, quantity: String, allergens: [String], photos: [String], neighbourhood: String, exactAddress: String, location: pointSchema }] });
export const NGOProfile = model('NGOProfile', { user: { ...ref('User'), unique: true }, registrationNumber: String, documents: [String], areasServed: [String], capacity: Number, hasVehicle: Boolean, about: String, peopleFed: { type: Number, default: 0 } });
export const Listing = model('Listing', {
  donor: { ...ref('User'), required: true }, foodName: { type: String, required: true }, description: String,
  category: { type: String, enum: ['Cooked meals', 'Bakery', 'Packaged', 'Produce', 'Sweets'], required: true },
  dietType: { type: String, enum: ['veg', 'non-veg'], required: true }, allergens: [String], quantity: String,
  servings: { type: Number, min: 1, required: true }, photos: [String], cookedAt: Date, safeUntil: Date, pickupBy: Date,
  location: { type: pointSchema, required: true }, neighbourhood: String, exactAddress: { type: String, select: false },
  isPrivate: { type: Boolean, default: false }, invitedNgo: ref('User'), claimedBy: ref('User'),
  status: { type: String, enum: ['Available', 'Claimed', 'Picked Up', 'Distributed', 'Expired', 'Cancelled'], default: 'Available' },
  safetyDeclared: { type: Boolean, required: true },
}, [[{ location: '2dsphere' }], [{ status: 1, pickupBy: 1 }]]);
export const Order = model('Order', {
  listing: { ...ref('Listing'), unique: true, required: true }, ngo: ref('User'), donor: ref('User'),
  status: { type: String, enum: ['Claimed', 'Picked Up', 'Distributed', 'Cancelled', 'Expired'], default: 'Claimed' },
  timeline: [{ status: String, at: Date }], pickupConfirmedAt: Date,
  distributionProof: { photo: String, peopleFed: Number, note: String, submittedAt: Date },
}, [[{ ngo: 1, status: 1 }], [{ donor: 1, status: 1 }]]);
export const Message = model('Message', { order: ref('Order'), sender: ref('User'), text: { type: String, select: false }, maskedText: String, readBy: [ref('User')] });
export const Review = model('Review', { order: ref('Order'), reviewer: ref('User'), recipient: ref('User'), rating: { type: Number, min: 1, max: 5 }, text: String }, [[{ order: 1, reviewer: 1 }, { unique: true }]]);
export const Certificate = model('Certificate', { certId: { type: String, unique: true }, user: ref('User'), tier: String, mealsServed: Number, issuedAt: Date });
export const Report = model('Report', { reporter: ref('User'), targetType: { type: String, enum: ['listing', 'user', 'message'] }, targetId: Schema.Types.ObjectId, reason: String, status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' }, resolution: String });
export const Notification = model('Notification', { user: ref('User'), title: String, body: String, link: String, read: { type: Boolean, default: false }, kind: String });
export const DemandRequest = model('DemandRequest', { ngo: ref('User'), title: String, description: String, meals: Number, neededBy: Date, neighbourhood: String, status: { type: String, enum: ['open', 'fulfilled'], default: 'open' } });
export const Upload = model('Upload', { owner: ref('User'), filename: String, mime: String, kind: { type: String, enum: ['food', 'proof', 'document'] } });
