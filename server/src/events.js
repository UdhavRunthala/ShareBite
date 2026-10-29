import { Notification } from './models/index.js';
let socketServer;
export function setSocketServer(io) { socketServer = io; }
export function disconnectUser(user) { socketServer?.in(`user:${user}`).disconnectSockets(true); }
export function emitToUser(user, event, payload) { socketServer?.to(`user:${user}`).emit(event, payload); }
export function emitPublic(event, payload = {}) { socketServer?.emit(event, payload); }
export async function notify(user, title, body, link, kind = 'status') { const notification = await Notification.create({ user, title, body, link, kind }); emitToUser(user, 'notification', notification); return notification; }
export function emitToOrder(order, event, payload) { socketServer?.to(`order:${order}`).emit(event, payload); }
