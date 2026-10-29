import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authRouter, optionalAuth } from './auth.js';
import { errorHandler } from './http.js';
export function createApp(databaseMode) {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cors({ origin: config.origins }));
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', databaseMode, demo: config.demo }));
  app.use('/api', optionalAuth);
  app.use('/api/auth', authRouter);
  app.use('/api', (_req, res) => res.status(404).json({ message: 'This endpoint does not exist.' }));
  app.use(errorHandler);
  return app;
}
