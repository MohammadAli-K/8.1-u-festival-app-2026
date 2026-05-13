import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'src/assets/logos/logo_black.svg');
const outCanonical = join(root, 'src/assets/logos/logoBlack.webp');
const out192 = join(root, 'public/icons/logo-black-192.webp');
const out512 = join(root, 'public/icons/logo-black-512.webp');
const mask192 = join(root, 'public/icons/logo-maskable-192.webp');
const mask512 = join(root, 'public/icons/logo-maskable-512.webp');

/** @type {import('sharp').RGB} */
const MASK_BG = { r: 240, g: 50, b: 40 }; // --color-accent #F03228

/**
 * Maskable icon: logo fits inside ~62% box (safe zone for Android maskable).
 * @param {number} size
 * @param {string} outPath
 */
async function writeMaskable(size, outPath) {
  const inner = Math.round(size * 0.62);
  const logoBuf = await sharp(svgPath, { density: 300 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: MASK_BG },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .webp({ quality: 90 })
    .toFile(outPath);
}

await mkdir(join(root, 'public/icons'), { recursive: true });

const base = sharp(svgPath, { density: 300 });

await base.clone().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile(outCanonical);

await sharp(outCanonical).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile(out192);

await copyFile(outCanonical, out512);

await writeMaskable(192, mask192);
await writeMaskable(512, mask512);

console.log('Wrote', outCanonical, out192, out512, mask192, mask512);
