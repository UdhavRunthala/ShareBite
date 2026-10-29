import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs) => twMerge(clsx(inputs));
export const number = value => new Intl.NumberFormat('en-IN').format(value || 0);
export const dateTime = value => new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const tierFor = meals => meals >= 5000 ? 'Platinum' : meals >= 2000 ? 'Gold' : meals >= 500 ? 'Silver' : 'Bronze';
export function celebrate() { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) import('canvas-confetti').then(({ default: confetti }) => confetti({ particleCount: 70, spread: 65, origin: { y: .7 }, colors: ['#244d3e', '#e8ad49', '#bc694e', '#b9d9b7'] })); }
