import { Router } from 'express';
import { z } from 'zod';
import { Order, User, Listing, Certificate, publicUser } from '../models/index.js';
import { requireAuth } from '../auth.js';
import { asyncRoute, HttpError } from '../http.js';
import { tierFor } from '../domain.js';
import { issueCertificate } from '../recognition.js';
export const statsRouter = Router();
statsRouter.get('/',asyncRoute(async (req,res) => {
  if (req.query.mine === 'true' && !req.user) throw new HttpError(401,'Sign in to view your impact.');
  const scope = req.query.mine === 'true' ? { $or:[{ donor:req.user._id },{ ngo:req.user._id }] } : {};
  const orders = await Order.find({ ...scope,status:'Distributed' }).select('distributionProof');
  const meals = orders.reduce((sum,o) => sum + o.distributionProof.peopleFed,0);
  const days = new Map();
  for (let i=29;i>=0;i--) { const day = new Date(Date.now()-i*86400000).toLocaleDateString('en-CA',{ timeZone:'Asia/Kolkata' }); days.set(day,0); }
  for (const order of orders) { const day = order.distributionProof.submittedAt.toLocaleDateString('en-CA',{ timeZone:'Asia/Kolkata' }); if (days.has(day)) days.set(day,days.get(day)+order.distributionProof.peopleFed); }
  res.json({ meals,kg:Math.round(meals*.35),co2:Math.round(meals*.35*2.5),completed:orders.length,donors:await User.countDocuments({ role:'donor',banned:false,verificationStatus:'verified' }),ngos:await User.countDocuments({ role:'ngo',banned:false,verificationStatus:'verified' }),active:await Listing.countDocuments({ status:'Available',pickupBy:{$gt:new Date()},isPrivate:false }),series:[...days].map(([date,meals]) => ({ date,meals,kg:Math.round(meals*.35) })),estimates:{ kgPerMeal:.35,co2PerKg:2.5 } });
}));
export const leaderboardRouter = Router();
leaderboardRouter.get('/',asyncRoute(async (req,res) => {
  const { role,period } = z.object({ role:z.enum(['donor','ngo']).default('donor'),period:z.enum(['all','month']).default('all') }).parse(req.query);
  const now = new Date(Date.now()+19800000), monthStart = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)-19800000);
  const rows = await Order.aggregate([{ $match:{ status:'Distributed',...(period === 'month' ? { 'distributionProof.submittedAt':{$gte:monthStart} } : {}) } },{ $group:{ _id:`$${role}`,mealsServed:{$sum:'$distributionProof.peopleFed'},donations:{$sum:1} } },{ $sort:{ mealsServed:-1,_id:1 } }]);
  const users = await User.find({ _id:{$in:rows.map(r=>r._id)},banned:false,verificationStatus:'verified' });
  const indexed = new Map(users.map(u=>[String(u._id),u]));
  res.json(rows.filter(row=>indexed.has(String(row._id))).map(row=>({ ...publicUser(indexed.get(String(row._id))),mealsServed:row.mealsServed,donations:row.donations,tier:tierFor(row.mealsServed) })));
}));
export const certificatesRouter = Router();
certificatesRouter.get('/mine',requireAuth,asyncRoute(async (req,res) => res.json(await Certificate.find({ user:req.user._id }).sort({ issuedAt:-1 }).limit(30))));
certificatesRouter.post('/',requireAuth,asyncRoute(async (req,res) => { const certificate = await issueCertificate(req.user._id); if (!certificate) throw new HttpError(409,'Your first certificate arrives after a completed distribution.'); res.json(certificate); }));
certificatesRouter.get('/:certId',asyncRoute(async (req,res) => { const certificate = await Certificate.findOne({ certId:req.params.certId }).populate('user'); if (!certificate) throw new HttpError(404,'Certificate not found.'); res.json({ ...certificate.toObject(),user:publicUser(certificate.user) }); }));
