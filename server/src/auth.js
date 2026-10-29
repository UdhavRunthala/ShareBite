import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User, sessionUser } from './models/user.js';
import { config } from './config.js';
import { asyncRoute, HttpError } from './http.js';
export function issueToken(user) { return jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: '7d', issuer: 'sharebite' }); }
export async function userFromToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret, { issuer: 'sharebite', algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user || user.banned) throw new Error('Unavailable');
    return user;
  } catch { throw new HttpError(401, 'Please sign in again to continue.'); }
}
export const optionalAuth = asyncRoute(async (req, _res, next) => { const header = req.headers.authorization; if (header) { if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Invalid authentication.'); req.user = await userFromToken(header.slice(7)); } next(); });
export const requireAuth = (req, _res, next) => req.user ? next() : next(new HttpError(401, 'Sign in to continue.'));
export const allow = (...roles) => (req, _res, next) => req.user && roles.includes(req.user.role) ? next() : next(new HttpError(403, 'This action is not available for your role.'));
export const verified = (req, _res, next) => req.user?.verificationStatus === 'verified' ? next() : next(new HttpError(403, 'Your account needs verification before you can do this.'));
export const authRouter = Router();
authRouter.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
const credentials = z.object({ email: z.string().email().max(200).transform(s => s.toLowerCase()), password: z.string().min(8).max(72) });
authRouter.post('/login', asyncRoute(async (req, res) => {
  const input = credentials.parse(req.body);
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !await bcrypt.compare(input.password, user.passwordHash)) throw new HttpError(401, 'That email and password don’t match.');
  if (user.banned) throw new HttpError(403, 'This account has been suspended.');
  res.json({ token: issueToken(user), user: sessionUser(user) });
}));
authRouter.post('/register', asyncRoute(async (req, res) => {
  const input = credentials.extend({ name: z.string().trim().min(2).max(100), role: z.enum(['donor', 'ngo']) }).parse(req.body);
  const user = await User.create({ ...input, passwordHash: await bcrypt.hash(input.password, 12), verificationStatus: 'pending' });
  res.status(201).json({ token: issueToken(user), user: sessionUser(user) });
}));
authRouter.post('/demo', asyncRoute(async (req, res) => {
  if (!config.demo) throw new HttpError(403, 'Demo login is disabled.');
  const { role } = z.object({ role: z.enum(['donor', 'ngo', 'admin']) }).parse(req.body);
  const user = await User.findOne({ email: `${role}@demo.com`, isDemo: true, banned: false });
  if (!user) throw new HttpError(404, 'Demo accounts are not available. Seed the database first.');
  res.json({ token: issueToken(user), user: sessionUser(user) });
}));
authRouter.get('/me', requireAuth, (req, res) => res.json(sessionUser(req.user)));
