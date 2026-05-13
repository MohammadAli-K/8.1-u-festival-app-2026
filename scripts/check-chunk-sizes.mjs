/**
 * Fails if any built `dist/assets/*.js` file exceeds 150 KiB (raw byte size).
 * Run after `vite build`.
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const LIMIT = 153600;
const assetsDir = join(process.cwd(), 'dist', 'assets');

let fail = false;
try {
  const files = await readdir(assetsDir);
  for (const name of files) {
    if (!name.endsWith('.js')) continue;
    const { size } = await stat(join(assetsDir, name));
    if (size > LIMIT) {
      console.error(`Chunk too large: ${name} (${size} bytes, limit ${LIMIT})`);
      fail = true;
    }
  }
} catch (e) {
  console.error('check-chunk-sizes: dist/assets missing — run vite build first', e);
  process.exit(1);
}

if (fail) process.exit(1);
console.log('All dist/assets/*.js chunks are ≤ 150 KiB.');
