import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { root } from '../config.js';
import { Upload, Listing, Order } from '../models/index.js';
import { requireAuth } from '../auth.js';
import { asyncRoute, HttpError } from '../http.js';
const directory = path.join(root, 'server', 'uploads');
const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });
export const uploadsRouter = Router();
uploadsRouter.post('/', requireAuth, receive.single('file'), asyncRoute(async (req,res) => {
  const kind = z.enum(['food','proof','document']).parse(req.body.kind);
  if (!req.file) throw new HttpError(400, 'Choose a file to upload.');
  const bytes = req.file.buffer;
  const png = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  const pdf = kind === 'document' && bytes.subarray(0,5).toString() === '%PDF-';
  if (!png && !jpeg && !webp && !pdf) throw new HttpError(400, 'Use a JPEG, PNG or WebP image; verification documents may also be PDF.');
  const ext = png ? 'png' : jpeg ? 'jpg' : webp ? 'webp' : 'pdf';
  const mime = pdf ? 'application/pdf' : `image/${jpeg ? 'jpeg' : ext}`;
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, filename), bytes);
  const upload = await Upload.create({ owner: req.user._id, filename, mime, kind });
  res.status(201).json({ url: `/api/uploads/${upload._id}`, name: req.file.originalname });
}));
uploadsRouter.get('/:uploadId', asyncRoute(async (req,res) => {
  const upload = await Upload.findById(req.params.uploadId);
  if (!upload) throw new HttpError(404, 'File not found.');
  const url = `/api/uploads/${upload._id}`;
  let allowed = req.user && (req.user.role === 'admin' || String(upload.owner) === String(req.user._id));
  if (!allowed && upload.kind === 'food') allowed = Boolean(await Listing.exists({ photos: url, $or: [{ isPrivate: false }, ...(req.user ? [{ invitedNgo: req.user._id }, { claimedBy: req.user._id }] : [])] }));
  if (!allowed && upload.kind === 'proof' && req.user) allowed = Boolean(await Order.exists({ 'distributionProof.photo': url, $or: [{ donor: req.user._id }, { ngo: req.user._id }] }));
  if (!allowed) throw new HttpError(403, 'This file is private.');
  res.set('Content-Type', upload.mime).set('Cache-Control', 'private, max-age=300');
  res.sendFile(path.join(directory, upload.filename));
}));
export async function requireOwnedUpload(url, owner, kind) {
  const uploadId = /^\/api\/uploads\/([a-f\d]{24})$/.exec(url)?.[1];
  if (!uploadId || !await Upload.exists({ _id: uploadId, owner, kind })) throw new HttpError(400, 'Upload your own photo or document before submitting.');
}
