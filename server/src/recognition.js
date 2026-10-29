import { randomUUID } from 'node:crypto';
import { Order, Certificate, NGOProfile } from './models/index.js';
import { tierFor } from './domain.js';
export async function mealsFor(user) {
  const totals = await Order.aggregate([{ $match: { status: 'Distributed', $or: [{ donor: user }, { ngo: user }] } }, { $group: { _id: null, total: { $sum: '$distributionProof.peopleFed' } } }]);
  return totals[0]?.total || 0;
}
export async function issueCertificate(user) {
  const mealsServed = await mealsFor(user);
  if (!mealsServed) return null;
  const latest = await Certificate.findOne({ user, mealsServed });
  if (latest) return latest;
  return Certificate.create({ user, certId: `SB-${randomUUID().slice(0,13).toUpperCase()}`, tier: tierFor(mealsServed), mealsServed, issuedAt: new Date() });
}
export async function refreshRecognition(order) { await NGOProfile.updateOne({ user: order.ngo }, { peopleFed: await mealsFor(order.ngo) }); return Promise.all([issueCertificate(order.donor), issueCertificate(order.ngo)]); }
