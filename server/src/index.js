import { createApp } from './app.js';
import { connectDatabase, closeDatabase } from './db.js';
import { config } from './config.js';
import { seedDatabase } from './seed.js';
import { createServer } from 'node:http';
import { attachSockets } from './socket.js';
import { startExpiryJob } from './expiry.js';
const mode = await connectDatabase();
if (mode === 'memory' || config.demo) await seedDatabase();
const server = createServer(createApp(mode));
const io = attachSockets(server);
const expiryJob = startExpiryJob();
server.listen(config.port, () => console.log(`ShareBite API: http://localhost:${config.port}`));
async function shutdown() { expiryJob.stop(); io.close(); server.close(); await closeDatabase(); process.exit(0); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
