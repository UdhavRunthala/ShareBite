import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
export const root = fileURLToPath(new URL('../../', import.meta.url));
dotenv.config({ path: path.join(root, '.env') });
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) throw new Error('JWT_SECRET is required in production.');
export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  demo: process.env.DEMO_MODE === 'true' || (process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false'),
  origins: [process.env.CLIENT_ORIGIN || 'http://localhost:5173', 'http://127.0.0.1:5173'],
};
