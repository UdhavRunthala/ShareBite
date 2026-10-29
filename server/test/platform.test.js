import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { connectDatabase, closeDatabase } from '../src/db.js';
import { seedDatabase } from '../src/seed.js';
import { createApp } from '../src/app.js';
import { User, Listing, Order, Review } from '../src/models/index.js';
import { issueToken } from '../src/auth.js';
let app;
before(async () => { app = createApp(await connectDatabase()); await seedDatabase(); });
after(closeDatabase);
test('seed creates rich histories, live windows and three working demo roles', async () => {
  assert.equal(await User.countDocuments({ role: 'donor' }), 26);
  assert.equal(await User.countDocuments({ role: 'ngo', verificationStatus: 'verified' }), 12);
  assert.equal(await Order.countDocuments({ status: 'Distributed' }), 36);
  assert.equal(await Review.countDocuments(), 72);
  assert.ok(await Listing.countDocuments({ status: 'Available', pickupBy: { $gt: new Date() } }) >= 20);
  for (const role of ['donor', 'ngo', 'admin']) {
    const response = await request(app).post('/api/auth/demo').send({ role });
    assert.equal(response.status, 200);
    assert.equal(response.body.user.role, role);
  }
  await seedDatabase();
  assert.equal(await Listing.countDocuments(), 68);
});
test('claim is atomic and exact addresses stay hidden until confirmed', async () => {
  const donor = await User.findOne({ email: 'donor@demo.com' });
  const ngos = await User.find({ role: 'ngo', verificationStatus: 'verified' }).limit(2);
  const response = await request(app).post('/api/listings').set('Authorization', `Bearer ${issueToken(donor)}`).send({ foodName: 'Test meal boxes', description: 'Freshly cooked meals packed for our community.', category: 'Cooked meals', dietType: 'veg', quantity: '20 kg', servings: 80, cookedAt: new Date(), pickupBy: new Date(Date.now() + 3600000), location: { type: 'Point', coordinates: [75.80321,26.90612] }, neighbourhood: 'C-Scheme', exactAddress: 'Private kitchen, 42 Community Lane, Jaipur', safetyDeclared: true });
  assert.equal(response.status, 201);
  const listingId = response.body._id;
  const publicView = await request(app).get(`/api/listings/${listingId}`);
  assert.equal(publicView.body.exactAddress, undefined);
  assert.deepEqual(publicView.body.location.coordinates, [75.8,26.91]);
  const claims = await Promise.all(ngos.map(ngo => request(app).post(`/api/listings/${listingId}/claim`).set('Authorization', `Bearer ${issueToken(ngo)}`)));
  assert.deepEqual(claims.map(r => r.status).sort(), [201,409]);
  const winner = ngos[claims.findIndex(r => r.status === 201)];
  const privateView = await request(app).get(`/api/listings/${listingId}`).set('Authorization', `Bearer ${issueToken(winner)}`);
  assert.equal(privateView.body.exactAddress, 'Private kitchen, 42 Community Lane, Jaipur');
  assert.equal(await Order.countDocuments({ listing: listingId }), 1);
});
