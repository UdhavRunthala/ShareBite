import { Router } from 'express';
import { z } from 'zod';
import { User, DonorProfile, NGOProfile, Order, Report, Listing, Message } from '../models/index.js';
import { allow } from '../auth.js';
import { asyncRoute, HttpError } from '../http.js';
import { notify, disconnectUser, emitPublic } from '../events.js';
export const adminRouter = Router();
adminRouter.use(allow('admin'));
adminRouter.get('/users',asyncRoute(async (_req,res) => {
  const users = await User.find({ role:{$ne:'admin'} }).sort({ verificationStatus:1,createdAt:-1 });
  res.json(await Promise.all(users.map(async user=>({ ...user.toObject(),profile:await (user.role==='ngo'?NGOProfile:DonorProfile).findOne({ user:user._id }) }))));
}));
adminRouter.patch('/users/:userId',asyncRoute(async (req,res) => {
  const input = z.object({ verificationStatus:z.enum(['verified','rejected','pending']).optional(),banned:z.boolean().optional(),reason:z.string().trim().max(500).optional() }).refine(v=>v.verificationStatus!==undefined||v.banned!==undefined,'Choose a moderation action.').parse(req.body);
  const user = await User.findById(req.params.userId);
  if (!user || user.role==='admin') throw new HttpError(404,'Account not found.');
  if (input.verificationStatus==='verified') { const profile = await (user.role==='ngo'?NGOProfile:DonorProfile).findOne({ user:user._id }); if (!profile?.documents?.length) throw new HttpError(400,'Review at least one submitted document before verification.'); }
  if (input.verificationStatus) user.verificationStatus=input.verificationStatus;
  if (input.banned!==undefined) user.banned=input.banned;
  await user.save();
  await notify(user._id,input.banned===true?'Your account has been suspended':input.banned===false?'Your account has been restored':`Verification ${input.verificationStatus}`,input.reason||'Your account review has been updated. Visit your profile for details.','/settings','verification');
  if (user.banned) disconnectUser(user._id);
  emitPublic('listings:changed'); res.json(user);
}));
adminRouter.get('/orders',asyncRoute(async (_req,res) => res.json(await Order.find().populate('donor','name').populate('ngo','name').populate('listing','foodName servings neighbourhood').sort({ createdAt:-1 }).limit(500))));
adminRouter.get('/reports',asyncRoute(async (_req,res) => {
  const reports = await Report.find().populate('reporter','name').sort({ createdAt:-1 });
  res.json(await Promise.all(reports.map(async report=>({ ...report.toObject(),target:await ({listing:Listing,user:User,message:Message}[report.targetType]).findById(report.targetId).lean() }))));
}));
adminRouter.patch('/reports/:reportId',asyncRoute(async (req,res) => {
  const input = z.object({ status:z.enum(['resolved','dismissed']),resolution:z.string().trim().min(5).max(1000) }).parse(req.body);
  const report = await Report.findByIdAndUpdate(req.params.reportId,input,{ new:true });
  if (!report) throw new HttpError(404,'Report not found.');
  await notify(report.reporter,'Your report has been reviewed',input.resolution,'/dashboard','report'); res.json(report);
}));
