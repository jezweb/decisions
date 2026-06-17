#!/usr/bin/env node
// Render a grounded decision aid (HTML) to a PNG. Deterministic: the screenshot
// is exactly the HTML you wrote, so a matrix/flow can't contain an invented cell.
//
//   node templates/render.mjs <input.html> [output.png] [--width 960]
//
// Default output: <input>.png next to the html. Default viewport width 960; the
// .card is tight-cropped regardless, so width only affects wrapping. Height auto-fits.
//
// Requires playwright (npm i playwright + npx playwright install chromium), OR
// point CHROME_PATH at an existing Chrome. No API key, no network.

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'render.mjs needs Playwright. Install it once with `npm i playwright`\n' +
    '(then `npx playwright install chromium`), or point CHROME_PATH at an\n' +
    'existing Chrome/Chromium binary. No API key or network needed.'
  );
  process.exit(1);
}
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const [input, maybeOut] = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!input) {
  console.error('usage: node render.mjs <input.html> [output.png] [--width N]');
  process.exit(1);
}
const widthArg = process.argv.indexOf('--width');
const width = widthArg !== -1 ? parseInt(process.argv[widthArg + 1], 10) : 960;

const htmlPath = resolve(input);
if (!existsSync(htmlPath)) { console.error(`no such file: ${htmlPath}`); process.exit(1); }
const out = resolve(maybeOut || htmlPath.replace(/\.html?$/i, '.png'));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
});
try {
  const page = await browser.newPage({
    viewport: { width, height: 600 },
    deviceScaleFactor: 2, // crisp on retina / when posted into chat
  });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  // Screenshot the single .card if present (tight crop), else full page.
  const card = await page.$('.card');
  if (card) await card.screenshot({ path: out });
  else await page.screenshot({ path: out, fullPage: true });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
