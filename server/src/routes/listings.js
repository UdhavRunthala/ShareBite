import { Router } from 'express';
import { z } from 'zod';
import { Listing, Order, User, DonorProfile, publicUser } from '../models/index.js';
import { asyncRoute, HttpError } from '../http.js';
import { allow, verified } from '../auth.js';
import { safeUntil, distanceKm } from '../domain.js';
import { notify, emitPublic } from '../events.js';
import { requireOwnedUpload } from './uploads.js';
export const listingsRouter = Router();
export const listingInput = z.object({
  foodName: z.string().trim().min(3).max(100), description: z.string().trim().min(10).max(2000),
  category: z.enum(['Cooked meals', 'Bakery', 'Packaged', 'Produce', 'Sweets']), dietType: z.enum(['veg', 'non-veg']),
  quantity: z.string().trim().min(1).max(60), servings: z.coerce.number().int().min(1).max(10000),
  allergens: z.array(z.string().max(40)).max(15).default([]), photos: z.array(z.string().max(500).refine(v => /^\/api\/uploads\/[a-f\d]{24}$/.test(v) || /^https:\/\/images\.unsplash\.com\//.test(v), 'Use an uploaded food photo.')).max(5).default([]),
  cookedAt: z.coerce.date(), pickupBy: z.coerce.date(),
  location: z.object({ type: z.literal('Point').default('Point'), coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]) }),
  neighbourhood: z.string().trim().min(2).max(80), exactAddress: z.string().trim().min(10).max(500),
  isPrivate: z.boolean().default(false), invitedNgo: z.string().regex(/^[a-f\d]{24}$/).optional(), safetyDeclared: z.literal(true), saveTemplate: z.boolean().default(false),
});
const id = value => String(value?._id || value || '');
export function canSeeListing(listing, user) { return !listing.isPrivate || user?.role === 'admin' || id(listing.donor) === id(user) || id(listing.invitedNgo) === id(user); }
export function serializeListing(listing, user) {
  const data = listing.toObject ? listing.toObject() : { ...listing };
  const owns = user && (user.role === 'admin' || id(listing.donor) === id(user) || id(listing.claimedBy) === id(user));
  if (!owns) { delete data.exactAddress; data.location = { type: 'Point', coordinates: data.location.coordinates.map(n => Math.round(n * 100) / 100) }; }
  if (data.donor?.name) data.donor = publicUser(data.donor);
  if (!owns) delete data.invitedNgo;
  return data;
}
async function createListing(input, donor) {
  for (const photo of input.photos) if (photo.startsWith('/api/uploads/')) await requireOwnedUpload(photo,donor._id,'food');
  const now = Date.now(), safety = safeUntil(input.category, input.cookedAt);
  if (input.cookedAt.getTime() > now + 60000 || input.pickupBy.getTime() <= now || input.pickupBy > safety) throw new HttpError(400, 'Choose a future pickup deadline within the food’s safety window. Cooked time cannot be in the future.');
  if (input.isPrivate && !await User.exists({ _id: input.invitedNgo, role: 'ngo', verificationStatus: 'verified', banned: false })) throw new HttpError(400, 'Choose a verified NGO for a private donation.');
  const listing = await Listing.create({ ...input, donor: donor._id, safeUntil: safety });
  if (input.saveTemplate) {
    const template = { ...input, name: input.foodName };
    await DonorProfile.findOneAndUpdate({ user: donor._id }, { $push: { templates: { $each: [template], $slice: -10 } }, $setOnInsert: { businessName: donor.name, donorType: 'individual' } }, { upsert: true });
  }
  const ngos = await User.find({ role: 'ngo', verificationStatus: 'verified', banned: false, ...(input.isPrivate ? { _id: input.invitedNgo } : {}) });
  await Promise.all(ngos.filter(ngo => input.isPrivate || distanceKm(input.location.coordinates, ngo.location.coordinates) < 25).map(ngo => notify(ngo._id, input.isPrivate ? 'A donation reserved for your team' : 'Fresh food in your neighbourhood', `${input.servings} servings of ${input.foodName} are ready to share.`, `/listings/${listing._id}`, 'listing')));
  emitPublic('listings:changed');
  return listing;
}
listingsRouter.get(['/','/nearby'], asyncRoute(async (req, res) => {
  const query = z.object({ mine: z.enum(['true','false']).optional(), dietType: z.enum(['veg','non-veg','']).optional(), category: z.string().max(40).optional(), distance: z.coerce.number().min(0).max(500).optional(), servings: z.coerce.number().min(0).max(10000).optional(), sort: z.enum(['urgency','distance']).default('urgency'), search: z.string().max(100).optional(), lat: z.coerce.number().min(-90).max(90).optional(), lon: z.coerce.number().min(-180).max(180).optional() }).parse(req.query);
  if (query.mine === 'true' && !req.user) throw new HttpError(401, 'Sign in to see your donations.');
  const filter = query.mine === 'true' ? { donor: req.user._id } : { status: 'Available', pickupBy: { $gt: new Date() }, safeUntil: { $gt: new Date() } };
  if (query.dietType) filter.dietType = query.dietType;
  if (query.category) filter.category = query.category;
  if (query.servings) filter.servings = { $gte: query.servings };
  const origin = query.lon != null && query.lat != null ? [query.lon, query.lat] : req.user?.location?.coordinates || [75.8032, 26.906];
  const rows = await Listing.find(filter).select('+exactAddress').populate('donor').sort({ pickupBy: 1 }).limit(500);
  const result = rows.filter(row => canSeeListing(row, req.user) && !row.donor.banned && (!query.search || `${row.foodName} ${row.neighbourhood} ${row.donor.name}`.toLowerCase().includes(query.search.toLowerCase()))).map(row => ({ ...serializeListing(row, req.user), distance: distanceKm(origin, row.location.coordinates) })).filter(row => !query.distance || row.distance <= query.distance);
  result.sort(query.sort === 'distance' ? (a,b) => a.distance - b.distance : (a,b) => new Date(a.pickupBy) - new Date(b.pickupBy) || a.distance - b.distance);
  res.json(result);
}));
listingsRouter.get('/templates', allow('donor'), asyncRoute(async (req, res) => res.json((await DonorProfile.findOne({ user: req.user._id }))?.templates || [])));
listingsRouter.post('/templates/:templateId/post', allow('donor'), verified, asyncRoute(async (req,res) => {
  if (req.body.safetyDeclared !== true) throw new HttpError(400, 'Confirm safe food handling before posting.');
  const profile = await DonorProfile.findOne({ user: req.user._id }); const template = profile?.templates.id(req.params.templateId);
  if (!template) throw new HttpError(404, 'Template not found.');
  const input = listingInput.parse({ ...template.toObject(), cookedAt: new Date(), pickupBy: new Date(Date.now() + 2 * 3600000), safetyDeclared: true });
  res.status(201).json(await createListing(input, req.user));
}));
listingsRouter.post('/', allow('donor'), verified, asyncRoute(async (req,res) => res.status(201).json(await createListing(listingInput.parse(req.body), req.user))));
listingsRouter.get('/:listingId', asyncRoute(async (req,res) => {
  const listing = await Listing.findById(req.params.listingId).select('+exactAddress').populate('donor');
  if (!listing || !canSeeListing(listing, req.user)) throw new HttpError(404, 'Donation not found.');
  const order = req.user && await Order.findOne({ listing: listing._id, $or: [{ donor: req.user._id }, { ngo: req.user._id }] });
  res.json({ ...serializeListing(listing, req.user), orderId: order?._id });
}));
listingsRouter.post('/:listingId/claim', allow('ngo'), verified, asyncRoute(async (req,res) => {
  const existing = await Listing.findById(req.params.listingId).populate('donor');
  if (!existing || !canSeeListing(existing, req.user) || existing.donor.banned) throw new HttpError(404, 'Donation not found.');
  const listing = await Listing.findOneAndUpdate({ _id: existing._id, status: 'Available', pickupBy: { $gt: new Date() }, safeUntil: { $gt: new Date() } }, { $set: { status: 'Claimed', claimedBy: req.user._id } }, { new: true });
  if (!listing) throw new HttpError(409, 'Another team has claimed this donation, or its collection window has closed.');
  let order;
  try { order = await Order.create({ listing: listing._id, donor: listing.donor, ngo: req.user._id, status: 'Claimed', timeline: [{ status: 'Available', at: listing.createdAt }, { status: 'Claimed', at: new Date() }] }); }
  catch (error) { await Listing.updateOne({ _id: listing._id, status: 'Claimed', claimedBy: req.user._id }, { $set: { status: 'Available' }, $unset: { claimedBy: 1 } }); throw error; }
  await notify(listing.donor, 'Your food has found its next table', `${req.user.name} has claimed ${listing.foodName}.`, `/orders/${order._id}`, 'claim');
  emitPublic('listings:changed'); res.status(201).json(order);
}));
listingsRouter.post('/:listingId/cancel', allow('donor'), asyncRoute(async (req,res) => {
  const listing = await Listing.findOneAndUpdate({ _id: req.params.listingId, donor: req.user._id, status: 'Available' }, { status: 'Cancelled' }, { new: true });
  if (!listing) throw new HttpError(409, 'Only your available donations can be cancelled.');
  emitPublic('listings:changed'); res.json(listing);
}));
