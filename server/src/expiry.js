import cron from 'node-cron';
import { Listing,Order } from './models/index.js';
import { notify,emitPublic,emitToUser } from './events.js';
export async function expireListings(now=new Date()) {
  const filter={status:{$in:['Available','Claimed']},$or:[{pickupBy:{$lte:now}},{safeUntil:{$lte:now}}]};
  const candidates=await Listing.find(filter).select('_id'); let count=0;
  for (const candidate of candidates) {
    const listing=await Listing.findOneAndUpdate({_id:candidate._id,...filter},{status:'Expired'},{new:true});
    if (!listing) continue;
    count++;
    const order=await Order.findOneAndUpdate({listing:listing._id,status:'Claimed'},{$set:{status:'Expired'},$push:{timeline:{status:'Expired',at:now}}},{new:true});
    await notify(listing.donor,'The collection window has closed',`${listing.foodName} has expired. Thank you for trying to share it.`,order?`/orders/${order._id}`:'/dashboard','expiry');
    if (order) { await notify(order.ngo,'Please do not collect this donation','Its collection window has closed. Find another fresh donation nearby.',`/orders/${order._id}`,'expiry'); emitToUser(order.ngo,'orders:changed',{}); }
    emitToUser(listing.donor,'orders:changed',{});
  }
  if(count) emitPublic('listings:changed');
  return count;
}
export function startExpiryJob() { return cron.schedule('* * * * *',()=>expireListings().catch(error=>console.error('[ShareBite] Expiry job failed:',error.message)),{noOverlap:true}); }
