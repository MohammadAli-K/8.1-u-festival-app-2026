const STORAGE_KEY = 'u-festival-notifications';

export const NOTIFICATION_STORAGE_KEY = STORAGE_KEY;

export const NOTIFICATION_PREFERENCE_CHANGED = 'u-festival-notifications-changed';

/**
 * @returns {boolean}
 */
export function readNotificationOptIn() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === 'object' && parsed.enabled === true);
  } catch {
    return false;
  }
}

/**
 * @param {boolean} enabled
 */
export function writeNotificationOptIn(enabled) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled }));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFERENCE_CHANGED));
  } catch {
    /* ignore */
  }
}
