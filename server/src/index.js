import { createApp } from './app.js';
import { connectDatabase, closeDatabase } from './db.js';
import { config } from './config.js';
const mode = await connectDatabase();
const server = createApp(mode).listen(config.port, () => console.log(`ShareBite API: http://localhost:${config.port}`));
async function shutdown() { server.close(); await closeDatabase(); process.exit(0); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
