import bcrypt from 'bcrypt';
import { User, DonorProfile, NGOProfile, Listing, Order, Message, Review, Certificate, Report, Notification, DemandRequest } from './models/index.js';
import { neighbourhoods, donors, ngos, foods, photos } from './seed-data.js';
import { safeUntil, tierFor } from './domain.js';
import { demoDocument } from './seed-documents.js';
const hours = n => n * 3600000;
export async function seedDatabase() {
  if (await User.exists({})) { console.log('[ShareBite] Database already contains users; seed skipped without deleting data.'); return; }
  const now = Date.now();
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const donorUsers = [], ngoUsers = [];
  for (let i = 0; i < donors.length; i++) {
    const [name, donorType] = donors[i], [area, lon, lat] = neighbourhoods[i % neighbourhoods.length];
    const user = await User.create({ name, email: i === 0 ? 'donor@demo.com' : `donor${i}@sharebite.example`, passwordHash, role: 'donor', verificationStatus: i === 25 ? 'pending' : 'verified', location: { type: 'Point', coordinates: [lon, lat] }, isDemo: true });
    donorUsers.push(user);
    await DonorProfile.create({ user: user._id, donorType, businessName: name, fssaiNumber: `DEMO-FSSAI-${1000 + i}`, address: `${12 + i}, Community Lane, ${area}, Jaipur`, documents: [], templates: [{ name: 'Our usual lunch surplus', foodName: foods[i % foods.length][0], description: foods[i % foods.length][3], category: foods[i % foods.length][1], dietType: foods[i % foods.length][2], servings: 60 + i * 5, quantity: `${15 + i} kg`, allergens: foods[i % foods.length][4], photos: [photos[i % photos.length]], neighbourhood: area, exactAddress: `${12 + i}, Community Lane, ${area}, Jaipur`, location: user.location }] });
  }
  for (let i = 0; i < ngos.length; i++) {
    const [name, about, capacity] = ngos[i], [, lon, lat] = neighbourhoods[i % neighbourhoods.length];
    const user = await User.create({ name, email: i === 0 ? 'ngo@demo.com' : `ngo${i}@sharebite.example`, passwordHash, role: 'ngo', verificationStatus: i < 12 ? 'verified' : i < 14 ? 'pending' : 'rejected', location: { type: 'Point', coordinates: [lon, lat] }, isDemo: true });
    ngoUsers.push(user);
    await NGOProfile.create({ user: user._id, registrationNumber: `DEMO-RJ-SOC-${2010 + i}-${180 + i}`, documents: [], areasServed: [neighbourhoods[i % 12][0], neighbourhoods[(i + 1) % 12][0]], capacity, hasVehicle: i % 3 !== 2, about, peopleFed: 0 });
  }
  const admin = await User.create({ name: 'Aditi · ShareBite', email: 'admin@demo.com', passwordHash, role: 'admin', verificationStatus: 'verified', isDemo: true });
  for (const user of [...donorUsers,...ngoUsers]) {
    const model=user.role==='ngo'?NGOProfile:DonorProfile;
    const profile=await model.findOne({user:user._id});
    profile.documents=[await demoDocument(user,profile.registrationNumber||profile.fssaiNumber)];
    await profile.save();
  }
  const listings = [], completed = [], totals = new Map();
  for (let i = 0; i < 68; i++) {
    const historical = i < 36;
    const donorIndex = historical ? (i < 8 ? 0 : i < 14 ? 1 : i < 18 ? 2 : (i - 15) % 25) : (i - 36) % 25;
    const ngoIndex = historical ? (i < 10 ? 0 : i < 16 ? 1 : i < 20 ? 2 : (i - 17) % 12) : (i - 36) % 12;
    const donor = donorUsers[donorIndex], ngo = ngoUsers[ngoIndex];
    const [foodName, category, dietType, description, allergens] = foods[i % foods.length];
    const [area, lon, lat] = neighbourhoods[donorIndex % 12];
    const base = historical ? now - hours(24 * (1 + i % 38)) : now - hours(.15 + (i % 4) * .15);
    const status = historical ? 'Distributed' : i < 60 ? 'Available' : i < 63 ? 'Claimed' : i < 65 ? 'Picked Up' : i < 67 ? 'Expired' : 'Cancelled';
    const servings = historical ? (donorIndex === 0 ? 520 + i * 15 : donorIndex === 1 ? 430 : donorIndex === 2 ? 380 : 50 + i * 9) : 25 + ((i * 17) % 180);
    const pickupBy = new Date(historical || status === 'Expired' ? base + hours(2) - (status === 'Expired' ? hours(4) : 0) : now + hours(.3 + (i % 9) * .27));
    const listing = await Listing.create({ donor: donor._id, foodName, category, dietType, description, allergens, quantity: `${Math.round(servings * .35)} kg`, servings, photos: [photos[i % photos.length]], cookedAt: new Date(base), safeUntil: safeUntil(category, base), pickupBy, location: { type: 'Point', coordinates: [lon + (i % 3) * .001, lat + (i % 2) * .001] }, neighbourhood: area, exactAddress: `${12 + donorIndex}, Community Lane, ${area}, Jaipur. Collect from the side entrance.`, isPrivate: i === 58, invitedNgo: i === 58 ? ngoUsers[0]._id : undefined, status, claimedBy: ['Claimed', 'Picked Up', 'Distributed'].includes(status) ? ngo._id : undefined, safetyDeclared: true, createdAt: new Date(base) });
    listings.push(listing);
    if (['Distributed', 'Claimed', 'Picked Up'].includes(status)) {
      const at = new Date(base + hours(.5));
      const timeline = [{ status: 'Available', at: new Date(base) }, { status: 'Claimed', at }];
      if (status !== 'Claimed') timeline.push({ status: 'Picked Up', at: new Date(base + hours(1)) });
      if (historical) timeline.push({ status: 'Distributed', at: new Date(base + hours(2)) });
      const fed = Math.max(1, servings - (i % 4) * 2);
      const order = await Order.create({ listing: listing._id, donor: donor._id, ngo: ngo._id, status, timeline, pickupConfirmedAt: status !== 'Claimed' ? new Date(base + hours(1)) : undefined, distributionProof: historical ? { photo: photos[(i + 7) % photos.length], peopleFed: fed, note: `Shared with ${fed} community members in ${area}. Containers returned clean.`, submittedAt: new Date(base + hours(2)) } : undefined, createdAt: at });
      await Message.insertMany([{ order: order._id, sender: ngo._id, maskedText: 'Thank you for sharing. Our volunteer team will arrive within 20 minutes.', readBy: [ngo._id, donor._id], createdAt: at }, { order: order._id, sender: donor._id, maskedText: 'Wonderful. The food is packed and ready at the side entrance. Please bring insulated containers.', readBy: [donor._id], createdAt: new Date(at.getTime() + 60000) }]);
      if (historical) {
        completed.push(order);
        await Review.insertMany([{ order: order._id, reviewer: ngo._id, recipient: donor._id, rating: i % 5 === 0 ? 4 : 5, text: 'Fresh, thoughtfully packed food and a smooth collection. Our community was grateful.' }, { order: order._id, reviewer: donor._id, recipient: ngo._id, rating: 5, text: 'Punctual collection and a lovely distribution update. We would happily share again.' }]);
        for (const user of [donor, ngo]) totals.set(String(user._id), (totals.get(String(user._id)) || 0) + fed);
      }
    }
  }
  for (const user of [...donorUsers, ...ngoUsers]) {
    const mealsServed = totals.get(String(user._id)) || 0;
    if (user.role === 'ngo') await NGOProfile.updateOne({ user: user._id }, { peopleFed: mealsServed });
    if (mealsServed > 0) await Certificate.create({ user: user._id, certId: `SB-DEMO-${String(user._id).slice(-8).toUpperCase()}`, tier: tierFor(mealsServed), mealsServed, issuedAt: new Date(now) });
  }
  await DemandRequest.insertMany([{ ngo: ngoUsers[0]._id, title: '200 meals for our Sunday community table', description: 'Vegetarian, individually packed meals would help families joining our weekly gathering. We can arrange pickup.', meals: 200, neededBy: new Date(now + hours(72)), neighbourhood: 'C-Scheme' }, { ngo: ngoUsers[3]._id, title: 'Breakfast for 80 children', description: 'Bread, fruit or fresh breakfast portions for our learning centre. Please avoid nuts.', meals: 80, neededBy: new Date(now + hours(20)), neighbourhood: 'Raja Park' }]);
  await Report.insertMany([{ reporter: ngoUsers[1]._id, targetType: 'listing', targetId: listings[66]._id, reason: 'The collection window appears to have passed. Please review the listing.' }, { reporter: donorUsers[3]._id, targetType: 'user', targetId: ngoUsers[14]._id, reason: 'Registration details need clarification before this organisation can collect.' }, { reporter: ngoUsers[0]._id, targetType: 'listing', targetId: listings[67]._id, reason: 'The donor cancelled before collection. Please check that no other team is on the way.' }]);
  await Notification.insertMany([{ user: donorUsers[0]._id, title: 'Your kindness has travelled far', body: 'Your latest distribution proof is in. Your meals-served total has been updated.', link: '/dashboard', kind: 'status' }, { user: donorUsers[0]._id, title: 'Your Certificate of Honor is ready', body: 'A little recognition for a lot of good.', link: '/dashboard', kind: 'certificate' }, { user: ngoUsers[0]._id, title: 'Fresh food near your community', body: 'New donations are ready to collect around Jaipur.', link: '/discover', kind: 'listing' }, { user: ngoUsers[0]._id, title: 'A private invitation for your team', body: 'A donor has reserved a donation for your organisation.', link: '/discover', kind: 'listing' }, { user: admin._id, title: 'Three accounts await verification', body: 'Review submitted organisation details in the admin workspace.', link: '/admin', kind: 'verification' }]);
  console.log(`[ShareBite] Seeded ${donorUsers.length} donors, ${ngoUsers.length} NGOs, ${listings.length} listings, ${completed.length} completed orders. Demo password: Demo@1234`);
}
