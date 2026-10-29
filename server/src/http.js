import { ZodError } from 'zod';
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) return res.status(400).json({ message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
  if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Please use a valid record ID.' });
  const status = error.status || (error.name === 'MulterError' ? 400 : 500);
  if (status === 500) console.error('[ShareBite]', error);
  res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : error.message });
}
