import { useCallback, useEffect, useMemo, useState } from 'react';
import { newsItems as staticNewsItems } from '../data/news.js';

const READ_STORAGE_KEY = 'u-festival-read';

function readIdsFromStorage() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function persistReadIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Loads festival news (static for now; replace the async body with fetch() later).
 * @returns {{
 *   items: import('../data/news.js').NewsItem[];
 *   loading: boolean;
 *   error: Error | null;
 *   markRead: (id: string) => void;
 *   isUnread: (id: string) => boolean;
 * }}
 */
export function useNews() {
  const [items, setItems] = useState(
    /** @type {import('../data/news.js').NewsItem[]} */ ([]),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));
  const [readIds, setReadIds] = useState(() => readIdsFromStorage());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.resolve();
        if (cancelled) return;
        const sorted = [...staticNewsItems].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setItems(sorted);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  const isUnread = useCallback((id) => !readIds.has(id), [readIds]);

  return useMemo(
    () => ({ items, loading, error, markRead, isUnread }),
    [items, loading, error, markRead, isUnread],
  );
}
