/**
 * Aggregates Cursor agent transcript JSONL files into a single Markdown logbook
 * of user (prompt) messages. Requires --input or CURSOR_AGENT_TRANSCRIPTS_DIR.
 *
 * Limitations: only on-disk chats in that folder; per-line timestamps are usually
 * absent (see note in generated Markdown); non-text content parts become short placeholders.
 */
import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';

const DEFAULT_OUTPUT = 'docs/prompt-logbook.md';

function parseArgs(argv) {
  let input = process.env.CURSOR_AGENT_TRANSCRIPTS_DIR?.trim() || '';
  let output = DEFAULT_OUTPUT;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' && argv[i + 1]) {
      input = argv[++i];
    } else if (a === '--output' && argv[i + 1]) {
      output = argv[++i];
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return { input, output };
}

function printHelp() {
  console.log(`Usage: node scripts/build-prompt-logbook.mjs [--input <dir>] [--output <file>]

  --input   Directory containing Cursor agent-transcripts (recursive .jsonl scan).
            If omitted, uses env CURSOR_AGENT_TRANSCRIPTS_DIR.

  --output  Markdown file to write (default: ${DEFAULT_OUTPUT})

Example (macOS):
  npm run prompt-logbook -- --input "\$HOME/.cursor/projects/Users-mohammedkassem-Documents-8-1-u-festival-app-2026/agent-transcripts"
`);
}

/** @param {string} dir */
async function* walkJsonlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkJsonlFiles(full);
    } else if (e.isFile() && e.name.endsWith('.jsonl')) {
      yield full;
    }
  }
}

/** @param {string} text */
function stripUserQueryWrapper(text) {
  let t = text.trim();
  const open = '<user_query>';
  const close = '</user_query>';
  if (t.startsWith(open) && t.endsWith(close)) {
    t = t.slice(open.length, t.length - close.length).trim();
  }
  return t;
}

/** @param {unknown} record */
function extractUserPrompt(record) {
  if (!record || typeof record !== 'object') return null;
  const r = /** @type {{ role?: string; message?: { content?: unknown } }} */ (record);
  if (r.role !== 'user') return null;
  const content = r.message?.content;
  if (!Array.isArray(content)) return null;
  const chunks = [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    const b = /** @type {{ type?: string; text?: string }} */ (block);
    if (b.type === 'text' && typeof b.text === 'string') {
      chunks.push(b.text);
    } else if (typeof b.type === 'string') {
      chunks.push(`[${b.type}]`);
    }
  }
  const combined = chunks.join('\n').trim();
  const stripped = stripUserQueryWrapper(combined);
  return stripped.length > 0 ? stripped : null;
}

/** @param {string} body */
function fenceMarkdown(body) {
  let fence = '```';
  while (body.includes(fence)) {
    fence += '`';
  }
  return `${fence}\n${body}\n${fence}`;
}

/** @param {string} filePath */
async function extractPromptsFromJsonl(filePath) {
  /** @type {string[]} */
  const prompts = [];
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const row = JSON.parse(trimmed);
      const p = extractUserPrompt(row);
      if (p) prompts.push(p);
    } catch {
      /* skip malformed line */
    }
  }
  return prompts;
}

const { input, output } = parseArgs(process.argv);

if (!input) {
  console.error(`Missing --input or CURSOR_AGENT_TRANSCRIPTS_DIR.

Example (macOS):
  npm run prompt-logbook -- --input "$HOME/.cursor/projects/Users-mohammedkassem-Documents-8-1-u-festival-app-2026/agent-transcripts"
`);
  process.exit(1);
}

function fileBasename(full) {
  const parts = full.split(/[/\\]/);
  return parts[parts.length - 1] || full;
}

/** @param {string} p */
function expandHome(p) {
  if (p.startsWith('~/')) return join(process.env.HOME ?? '', p.slice(2));
  if (p === '~') return process.env.HOME ?? p;
  return p;
}

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(rootDir, '..');
const resolvedInput = resolve(expandHome(input));

/** @type {{ path: string; mtime: number; sessionId: string }[]} */
const fileMeta = [];
try {
  for await (const p of walkJsonlFiles(resolvedInput)) {
    const st = await stat(p);
    const base = p.split(/[/\\]/).slice(-2, -1)[0] || fileBasename(p);
    fileMeta.push({ path: p, mtime: st.mtimeMs, sessionId: base });
  }
} catch (e) {
  console.error('Cannot read transcript directory:', resolvedInput, e);
  process.exit(1);
}

fileMeta.sort((a, b) => b.mtime - a.mtime);

const outAbs = resolve(projectRoot, output);

const lines = [];
lines.push('# Prompt logbook');
lines.push('');
lines.push(
  '> **Note:** Generated by `scripts/build-prompt-logbook.mjs`. Only chats still present under the transcript directory are included. Individual prompts usually have no timestamps in the source data; ordering is the line order within each session file. Session sections are sorted by file modification time (newest first).',
);
lines.push('');
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push(`**Source:** \`${resolvedInput}\``);
lines.push('');

let totalPrompts = 0;
let filesWithPrompts = 0;
for (const { path: filePath, mtime, sessionId } of fileMeta) {
  const prompts = await extractPromptsFromJsonl(filePath);
  if (prompts.length === 0) continue;
  filesWithPrompts++;
  const rel = relative(resolvedInput, filePath) || fileBasename(filePath);
  const mtimeIso = new Date(mtime).toISOString();
  lines.push(`## Session \`${sessionId}\``);
  lines.push('');
  lines.push(`- **File:** \`${rel}\``);
  lines.push(`- **File mtime (hint):** ${mtimeIso}`);
  lines.push('');
  prompts.forEach((text, i) => {
    lines.push(`### Prompt ${i + 1}`);
    lines.push('');
    lines.push(fenceMarkdown(text));
    lines.push('');
    totalPrompts++;
  });
}

if (totalPrompts === 0) {
  console.warn('No user prompts found in', resolvedInput);
}

await mkdir(dirname(outAbs), { recursive: true });
await writeFile(outAbs, lines.join('\n'), 'utf8');
console.log(
  `Wrote ${totalPrompts} prompt(s) from ${filesWithPrompts} session file(s) (${fileMeta.length} .jsonl scanned) → ${outAbs}`,
);
