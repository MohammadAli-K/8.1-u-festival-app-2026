const STORAGE_KEY = 'u-festival-interactie-wall-reactions';

/**
 * @returns {Record<string, { clap: number; heart: number; fire: number }>}
 */
export function loadWallReactions() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return /** @type {Record<string, { clap: number; heart: number; fire: number }>} */ (parsed);
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, { clap: number; heart: number; fire: number }>} data
 */
export function saveWallReactions(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
