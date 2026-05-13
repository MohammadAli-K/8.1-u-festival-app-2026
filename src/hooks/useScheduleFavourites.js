import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LangContext.jsx';
import { readNotificationOptIn, NOTIFICATION_PREFERENCE_CHANGED, NOTIFICATION_STORAGE_KEY } from '../utils/notificationPreference.js';

const FAVOURITES_STORAGE_KEY = 'u-festival-favourites';

/** @typedef {{ id: string; start: Date; displayTitle: string; youtubeUrl: string | null }} BlockLike */

const REMINDER_OFFSETS_MIN = [15, 10, 5];

/**
 * @param {string} str
 * @param {Record<string, string | number>} values
 */
function fillTemplate(str, values) {
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    k in values ? String(values[k]) : `{${k}}`,
  );
}

/**
 * Background timers are throttled when the tab is inactive; reminders are best-effort.
 * Notifications use `ServiceWorkerRegistration.showNotification` (requires permission).
 */

function readFavouriteIds() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function persistFavouriteIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

/**
 * @param {BlockLike | undefined} block
 * @param {import('react').MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>} timersRef
 * @param {(key: string) => string} t
 */
async function scheduleRemindersForBlock(block, timersRef, t) {
  if (!block || !('start' in block)) return;
  const startMs = block.start.getTime();

  let reg = null;
  try {
    if ('serviceWorker' in navigator) {
      reg = await navigator.serviceWorker.ready;
    }
  } catch {
    return;
  }
  if (!reg || Notification.permission !== 'granted' || !readNotificationOptIn()) return;

  for (const offset of REMINDER_OFFSETS_MIN) {
    const key = `${block.id}-${offset}`;
    const fireAt = startMs - offset * 60 * 1000;
    const delay = fireAt - Date.now();
    if (delay <= 0) continue;

    const handle = setTimeout(() => {
      timersRef.current.delete(key);
      const title = fillTemplate(t('schedule.reminder.title'), {
        title: block.displayTitle,
        minutes: offset,
      });
      const body = fillTemplate(t('schedule.reminder.body'), {
        title: block.displayTitle,
        minutes: offset,
      });
      reg
        .showNotification(title, {
          body,
          tag: key,
          data: { slotId: block.id, youtubeUrl: block.youtubeUrl ?? '' },
        })
        .catch(() => {});
    }, delay);
    timersRef.current.set(key, handle);
  }
}

/**
 * @param {import('react').MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>} timersRef
 * @param {string} slotId
 */
function clearRemindersForSlot(timersRef, slotId) {
  for (const offset of REMINDER_OFFSETS_MIN) {
    const key = `${slotId}-${offset}`;
    const h = timersRef.current.get(key);
    if (h) clearTimeout(h);
    timersRef.current.delete(key);
  }
}

function clearAllReminders(timersRef) {
  for (const h of timersRef.current.values()) {
    clearTimeout(h);
  }
  timersRef.current.clear();
}

/**
 * @param {Record<string, BlockLike & { start: Date }>} blocksById
 */
export function useScheduleFavourites(blocksById) {
  const { t } = useLanguage();
  const [favouriteIds, setFavouriteIds] = useState(() => readFavouriteIds());
  const [notifPrefTick, setNotifPrefTick] = useState(0);
  const timersRef = useRef(new Map());
  const blocksByIdRef = useRef(blocksById);
  blocksByIdRef.current = blocksById;

  const favouriteKey = useMemo(() => [...favouriteIds].sort().join(','), [favouriteIds]);

  const reconcileReminders = useCallback(async () => {
    clearAllReminders(timersRef);
    if (Notification.permission !== 'granted' || !readNotificationOptIn()) return;
    for (const id of favouriteIds) {
      const block = blocksByIdRef.current[id];
      await scheduleRemindersForBlock(block, timersRef, t);
    }
  }, [favouriteIds, t]);

  useEffect(() => {
    void reconcileReminders();
    return () => {
      clearAllReminders(timersRef);
    };
  }, [favouriteKey, reconcileReminders, notifPrefTick]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === FAVOURITES_STORAGE_KEY || e.key === null) setFavouriteIds(readFavouriteIds());
      if (e.key === NOTIFICATION_STORAGE_KEY || e.key === null) setNotifPrefTick((n) => n + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const bump = () => setNotifPrefTick((n) => n + 1);
    window.addEventListener(NOTIFICATION_PREFERENCE_CHANGED, bump);
    return () => window.removeEventListener(NOTIFICATION_PREFERENCE_CHANGED, bump);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void reconcileReminders();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, [reconcileReminders]);

  const isFavourite = useCallback((id) => favouriteIds.has(id), [favouriteIds]);

  const toggleFavourite = useCallback(
    (slotId) => {
      const isOn = favouriteIds.has(slotId);
      if (isOn) {
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(slotId);
          persistFavouriteIds(next);
          return next;
        });
        clearRemindersForSlot(timersRef, slotId);
        return;
      }

      setFavouriteIds((prev) => {
        const next = new Set(prev);
        next.add(slotId);
        persistFavouriteIds(next);
        return next;
      });
    },
    [favouriteIds],
  );

  return useMemo(
    () => ({
      favouriteIds,
      isFavourite,
      toggleFavourite,
    }),
    [favouriteIds, isFavourite, toggleFavourite],
  );
}
