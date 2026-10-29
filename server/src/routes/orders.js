import { Router } from 'express';
import { z } from 'zod';
import { Order, Listing, Review, Message, publicUser } from '../models/index.js';
import { requireAuth, allow } from '../auth.js';
import { asyncRoute, HttpError } from '../http.js';
import { serializeListing } from './listings.js';
import { requireOwnedUpload } from './uploads.js';
import { notify, emitPublic, emitToUser } from '../events.js';
import { refreshRecognition } from '../recognition.js';
export const ordersRouter = Router();
ordersRouter.use(requireAuth);
export async function participantOrder(orderId, user, admin = false) {
  const order = await Order.findById(orderId);
  if (!order || (!admin || user.role !== 'admin') && ![String(order.donor),String(order.ngo)].includes(String(user._id))) throw new HttpError(404, 'Order not found.');
  return order;
}
async function presentOrder(order, user) {
  await order.populate([{ path: 'listing', select: '+exactAddress', populate: { path: 'donor' } }, { path: 'donor' }, { path: 'ngo' }]);
  return { ...order.toObject(), listing: serializeListing(order.listing, user), donor: publicUser(order.donor), ngo: publicUser(order.ngo), unreadCount: await Message.countDocuments({ order: order._id, sender: { $ne: user._id }, readBy: { $ne: user._id } }) };
}
ordersRouter.get('/', asyncRoute(async (req,res) => {
  const orders = await Order.find({ $or: [{ donor: req.user._id }, { ngo: req.user._id }] }).sort({ updatedAt: -1 });
  res.json(await Promise.all(orders.map(order => presentOrder(order,req.user))));
}));
ordersRouter.get('/:orderId', asyncRoute(async (req,res) => res.json(await presentOrder(await participantOrder(req.params.orderId,req.user,true),req.user))));
ordersRouter.patch('/:orderId/status', asyncRoute(async (req,res) => {
  z.object({ status: z.literal('Picked Up') }).parse(req.body);
  const current = await participantOrder(req.params.orderId,req.user);
  const listing = await Listing.findById(current.listing);
  if (listing.pickupBy < new Date() || listing.safeUntil < new Date()) throw new HttpError(409, 'The collection window has closed. This food cannot be picked up.');
  const at = new Date();
  const order = await Order.findOneAndUpdate({ _id: current._id, status: 'Claimed' }, { $set: { status: 'Picked Up', pickupConfirmedAt: at }, $push: { timeline: { status: 'Picked Up', at } } }, { new: true });
  if (!order) throw new HttpError(409, 'Only a claimed order can be marked picked up.');
  await Listing.updateOne({ _id: order.listing }, { status: 'Picked Up' });
  await notify(String(order.donor) === String(req.user._id) ? order.ngo : order.donor, 'The food is on its way', `${listing.foodName} has been collected.`, `/orders/${order._id}`);
  emitToUser(order.donor,'orders:changed',{}); emitToUser(order.ngo,'orders:changed',{}); res.json(order);
}));
ordersRouter.post('/:orderId/proof', allow('ngo'), asyncRoute(async (req,res) => {
  const input = z.object({ photo: z.string().max(200), peopleFed: z.coerce.number().int().min(1).max(10000), note: z.string().trim().min(5).max(1000) }).parse(req.body);
  const current = await participantOrder(req.params.orderId,req.user);
  const listing = await Listing.findById(current.listing);
  if (input.peopleFed > listing.servings) throw new HttpError(400, 'People fed cannot exceed the donation’s servings.');
  await requireOwnedUpload(input.photo,req.user._id,'proof');
  const at = new Date();
  const order = await Order.findOneAndUpdate({ _id: current._id, ngo: req.user._id, status: 'Picked Up' }, { $set: { status: 'Distributed', distributionProof: { ...input, submittedAt: at } }, $push: { timeline: { status: 'Distributed', at } } }, { new: true });
  if (!order) throw new HttpError(409, 'Confirm pickup before completing this order. A completed proof cannot be submitted twice.');
  await Listing.updateOne({ _id: order.listing }, { status: 'Distributed' });
  await refreshRecognition(order);
  await notify(order.donor, `${input.peopleFed} people. One generous act.`, 'Distribution proof received. Your impact and Certificate of Honor are updated.', `/orders/${order._id}`);
  emitToUser(order.donor,'orders:changed',{}); emitToUser(order.ngo,'orders:changed',{}); emitPublic('impact:changed'); res.json(order);
}));
ordersRouter.get('/:orderId/reviews', asyncRoute(async (req,res) => { await participantOrder(req.params.orderId,req.user,true); res.json(await Review.find({ order: req.params.orderId }).populate('reviewer','name')); }));
ordersRouter.post('/:orderId/reviews', asyncRoute(async (req,res) => {
  const input = z.object({ rating: z.coerce.number().int().min(1).max(5), text: z.string().trim().min(5).max(600) }).parse(req.body);
  const order = await participantOrder(req.params.orderId,req.user);
  if (order.status !== 'Distributed') throw new HttpError(409, 'Reviews open after distribution is complete.');
  const recipient = String(order.donor) === String(req.user._id) ? order.ngo : order.donor;
  res.status(201).json(await Review.create({ ...input, order: order._id, reviewer: req.user._id, recipient }));
}));
