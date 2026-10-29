import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { Message, Notification } from '../models/index.js';
import { participantOrder } from './orders.js';
import { requireAuth } from '../auth.js';
import { asyncRoute, HttpError } from '../http.js';
import { maskContact } from '../domain.js';
import { emitToOrder, emitToUser, notify } from '../events.js';
export const chatRouter = Router();
chatRouter.use(requireAuth);
chatRouter.get('/:orderId', asyncRoute(async (req,res) => {
  await participantOrder(req.params.orderId,req.user);
  await Message.updateMany({ order: req.params.orderId, readBy: { $ne:req.user._id } }, { $addToSet: { readBy:req.user._id } });
  emitToUser(req.user._id,'messages:read',{});
  res.json(await Message.find({ order:req.params.orderId }).sort({ createdAt:1 }).limit(500).populate('sender','name'));
}));
export async function sendMessage(orderId,user,text) {
  const input = z.string().trim().min(1).max(2000).parse(text);
  const order = await participantOrder(orderId,user);
  const message = await Message.create({ order:order._id,sender:user._id,maskedText:maskContact(input),readBy:[user._id] });
  await message.populate('sender','name');
  emitToOrder(order._id,'message',message);
  const recipient = String(order.donor) === String(user._id) ? order.ngo : order.donor;
  await notify(recipient,'A new message about your donation',`${user.name}: ${message.maskedText.slice(0,100)}`,`/orders/${order._id}`,'message');
  return message;
}
chatRouter.post('/:orderId',rateLimit({ windowMs:60000,limit:40,standardHeaders:'draft-7',legacyHeaders:false }),asyncRoute(async (req,res) => res.status(201).json(await sendMessage(req.params.orderId,req.user,req.body.text))));
export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.get('/',asyncRoute(async (req,res) => res.json(await Notification.find({ user:req.user._id }).sort({ createdAt:-1 }).limit(100))));
notificationsRouter.patch('/read-all',asyncRoute(async (req,res) => { await Notification.updateMany({ user:req.user._id,read:false },{ read:true }); res.json({ ok:true }); }));
notificationsRouter.patch('/:notificationId/read',asyncRoute(async (req,res) => { const item = await Notification.findOneAndUpdate({ _id:req.params.notificationId,user:req.user._id },{ read:true },{ new:true }); if (!item) throw new HttpError(404,'Notification not found.'); res.json(item); }));
