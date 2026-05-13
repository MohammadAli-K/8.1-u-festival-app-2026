export const AI_LOGBOEK_STORAGE_KEY = 'u-festival-ai-logboek';

/** @typedef {{ id: string; at: string; model: string; tool: string; prompt: string }} AiLogboekEntry */

/** @param {unknown} x */
function isEntry(x) {
  if (!x || typeof x !== 'object') return false;
  const o = /** @type {Record<string, unknown>} */ (x);
  return (
    typeof o.id === 'string' &&
    typeof o.at === 'string' &&
    typeof o.model === 'string' &&
    typeof o.tool === 'string' &&
    typeof o.prompt === 'string'
  );
}

/** @returns {AiLogboekEntry[]} */
export function loadAiLogboekEntries() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AI_LOGBOEK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

/** @param {AiLogboekEntry[]} entries */
export function saveAiLogboekEntries(entries) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(AI_LOGBOEK_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota / private mode */
  }
}
