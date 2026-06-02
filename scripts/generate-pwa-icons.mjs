import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'src/assets/logos/logo_white.svg');
const out192 = join(root, 'public/icons/logo-white-192.webp');
const out512 = join(root, 'public/icons/logo-white-512.webp');
const mask192 = join(root, 'public/icons/logo-maskable-192.webp');
const mask512 = join(root, 'public/icons/logo-maskable-512.webp');

// The white logo contains white + red shapes, so it needs a dark backdrop to
// stay visible. Matches the manifest `background_color` (#000000).
/** @type {import('sharp').RGB} */
const ICON_BG = { r: 0, g: 0, b: 0 };

/**
 * Renders the white logo centered on a solid background.
 * @param {number} size output icon size in px
 * @param {string} outPath destination file
 * @param {number} innerRatio fraction of the canvas the logo occupies
 */
async function writeIcon(size, outPath, innerRatio) {
  const inner = Math.round(size * innerRatio);
  const logoBuf = await sharp(svgPath, { density: 300 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: ICON_BG },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .webp({ quality: 90 })
    .toFile(outPath);
}

await mkdir(join(root, 'public/icons'), { recursive: true });

// Regular ("any") icons fill ~80%; maskable icons stay within the ~62% Android
// safe zone so the logo is never clipped by adaptive-icon masks.
await writeIcon(192, out192, 0.8);
await writeIcon(512, out512, 0.8);
await writeIcon(192, mask192, 0.62);
await writeIcon(512, mask512, 0.62);

console.log('Wrote', out192, out512, mask192, mask512);
