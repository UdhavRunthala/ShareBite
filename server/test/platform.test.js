import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { connectDatabase, closeDatabase } from '../src/db.js';
import { seedDatabase } from '../src/seed.js';
import { createApp } from '../src/app.js';
import { User, Listing, Order, Review } from '../src/models/index.js';
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
