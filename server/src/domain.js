export const SAFETY_HOURS = { 'Cooked meals': 4, Bakery: 12, Packaged: 72, Produce: 24, Sweets: 8 };
export const safeUntil = (category, cookedAt) => new Date(new Date(cookedAt).getTime() + SAFETY_HOURS[category] * 3600000);
export const tierFor = meals => meals >= 5000 ? 'Platinum' : meals >= 2000 ? 'Gold' : meals >= 500 ? 'Silver' : 'Bronze';
export const CONTACT_HIDDEN = '[contact hidden – use platform chat]';
export function maskContact(text) {
  return text.replace(/\b[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, CONTACT_HIDDEN)
    .replace(/(?:https?:\/\/|www\.)\S+/gi, CONTACT_HIDDEN)
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, value => value.replace(/\D/g, '').length >= 7 ? CONTACT_HIDDEN : value)
    .replace(/(^|\s)@[\w.]+/g, (_match, prefix) => prefix + CONTACT_HIDDEN);
}
export function distanceKm(a, b) {
  const radians = v => v * Math.PI / 180;
  const [lon1, lat1] = a, [lon2, lat2] = b;
  const h = Math.sin(radians(lat2 - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
