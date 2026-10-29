import { connectDatabase, closeDatabase } from './db.js';
import { seedDatabase } from './seed.js';
try { const mode = await connectDatabase(); await seedDatabase(); if (mode === 'memory') console.log('[ShareBite] Seed validated in temporary MongoDB. npm run dev automatically seeds its own memory database.'); } finally { await closeDatabase(); }
