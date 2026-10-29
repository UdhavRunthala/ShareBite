import { Router } from 'express';
import { z } from 'zod';
import { User, NGOProfile, DonorProfile, Review, DemandRequest, Report, Listing, Message, publicUser, sessionUser } from '../models/index.js';
import { asyncRoute, HttpError } from '../http.js';
import { allow, verified, requireAuth } from '../auth.js';
import { mealsFor } from '../recognition.js';
import { requireOwnedUpload } from './uploads.js';
import { canSeeListing } from './listings.js';
import { participantOrder } from './orders.js';
export const ngosRouter = Router();
async function ngoView(profile) {
  const reviews = await Review.find({ recipient:profile.user._id }).populate('reviewer','name').sort({ createdAt:-1 });
  const data = profile.toObject(); delete data.documents;
  return { ...data,user:publicUser(profile.user),peopleFed:await mealsFor(profile.user._id),rating:reviews.length ? reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length : null,reviewCount:reviews.length,reviews:reviews.slice(0,20) };
}
ngosRouter.get('/',asyncRoute(async (req,res) => {
  const { search='',vehicle='',capacity=0 } = z.object({ search:z.string().max(100).optional(),vehicle:z.enum(['','true']).optional(),capacity:z.coerce.number().min(0).max(10000).optional() }).parse(req.query);
  const profiles = await NGOProfile.find({ capacity:{$gte:capacity},...(vehicle==='true'?{hasVehicle:true}:{}) }).populate('user');
  res.json(await Promise.all(profiles.filter(p=>p.user && !p.user.banned && p.user.verificationStatus==='verified' && `${p.user.name} ${p.areasServed.join(' ')}`.toLowerCase().includes(search.toLowerCase())).map(ngoView)));
}));
ngosRouter.get('/:userId',asyncRoute(async (req,res) => { const profile = await NGOProfile.findOne({ user:req.params.userId }).populate('user'); if (!profile || profile.user.banned || profile.user.verificationStatus!=='verified') throw new HttpError(404,'Organisation not found.'); res.json(await ngoView(profile)); }));
export const usersRouter = Router();
usersRouter.get('/me',requireAuth,asyncRoute(async (req,res) => { const model = req.user.role==='ngo'?NGOProfile:DonorProfile; res.json({ user:sessionUser(req.user),profile:await model.findOne({ user:req.user._id }) }); }));
usersRouter.patch('/me',requireAuth,asyncRoute(async (req,res) => {
  const base = z.object({ name:z.string().trim().min(2).max(100),documents:z.array(z.string().max(200)).max(5).default([]),location:z.object({ type:z.literal('Point'),coordinates:z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90)]) }).optional() });
  const schema = req.user.role==='ngo' ? base.extend({ registrationNumber:z.string().trim().min(3).max(100),areasServed:z.array(z.string().max(80)).min(1).max(15),capacity:z.coerce.number().int().min(1).max(10000),hasVehicle:z.boolean(),about:z.string().trim().min(10).max(2000) }) : base.extend({ donorType:z.enum(['restaurant','hotel','wedding venue','household','individual','cafe','bakery']),businessName:z.string().trim().min(2).max(100),fssaiNumber:z.string().max(100).optional(),address:z.string().trim().min(10).max(500) });
  const input = schema.parse(req.body);
  for (const document of input.documents) await requireOwnedUpload(document,req.user._id,'document');
  const { name,location,...profile } = input;
  await User.updateOne({ _id:req.user._id },{ name,...(location?{location}:{}),...(req.user.verificationStatus==='rejected'?{verificationStatus:'pending'}:{}) });
  const model = req.user.role==='ngo'?NGOProfile:DonorProfile;
  res.json(await model.findOneAndUpdate({ user:req.user._id },profile,{ upsert:true,new:true,runValidators:true }));
}));
export const demandsRouter = Router();
demandsRouter.get('/',asyncRoute(async (_req,res) => { const rows = await DemandRequest.find({ status:'open',neededBy:{$gt:new Date()} }).populate('ngo').sort({ neededBy:1 }); res.json(rows.filter(r=>!r.ngo.banned&&r.ngo.verificationStatus==='verified').map(r=>({...r.toObject(),ngo:publicUser(r.ngo)}))); }));
demandsRouter.post('/',allow('ngo'),verified,asyncRoute(async (req,res) => { const input = z.object({ title:z.string().trim().min(5).max(120),description:z.string().trim().min(10).max(1000),meals:z.coerce.number().int().min(1).max(10000),neededBy:z.coerce.date().refine(d=>d>new Date(),'Choose a future date.'),neighbourhood:z.string().min(2).max(80) }).parse(req.body); res.status(201).json(await DemandRequest.create({...input,ngo:req.user._id})); }));
demandsRouter.patch('/:demandId',allow('ngo'),asyncRoute(async (req,res) => { const item = await DemandRequest.findOneAndUpdate({ _id:req.params.demandId,ngo:req.user._id },{ status:'fulfilled' },{ new:true }); if (!item) throw new HttpError(404,'Request not found.'); res.json(item); }));
export const reportsRouter = Router();
reportsRouter.post('/',requireAuth,asyncRoute(async (req,res) => {
  const input = z.object({ targetType:z.enum(['listing','user','message']),targetId:z.string().regex(/^[a-f\d]{24}$/),reason:z.string().trim().min(10).max(1000) }).parse(req.body);
  const Model = { listing:Listing,user:User,message:Message }[input.targetType]; const target = await Model.findById(input.targetId);
  if (!target) throw new HttpError(404,'The reported item could not be found.');
  if (input.targetType==='listing' && !canSeeListing(target,req.user)) throw new HttpError(404,'Donation not found.');
  if (input.targetType==='message') await participantOrder(target.order,req.user);
  res.status(201).json(await Report.create({...input,reporter:req.user._id}));
}));
