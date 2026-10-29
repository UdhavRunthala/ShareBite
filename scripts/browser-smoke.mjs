import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
const executablePath = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
mkdirSync('.cache/screenshots', { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 960 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'ShareBite', exact: true }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) errors.push(`Horizontal overflow at ${width}px`);
    await page.screenshot({ path: `.cache/screenshots/setup-${width}.png`, fullPage: true });
    await page.close();
  }
  const response = await fetch('http://localhost:4000/api/health');
  if (!response.ok) errors.push('API health check failed');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Desktop/mobile browser smoke and API health checks passed.');
} finally { await browser.close(); }
