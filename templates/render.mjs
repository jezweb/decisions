#!/usr/bin/env node
// Render a grounded decision aid (HTML) to a PNG. Deterministic: the screenshot
// is exactly the HTML you wrote, so a matrix/flow can't contain an invented cell.
//
//   node templates/render.mjs <input.html> [output.png] [--width 960]
//
// Default output: <input>.png next to the html. Default viewport width 960
// (the matrix.html card is 880 + 40px padding each side). Height auto-fits.
//
// Requires playwright (npm i playwright + npx playwright install chromium), OR
// point PW at an existing Chrome via CHROME_PATH. No API key, no network.

import { chromium } from 'playwright';
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
