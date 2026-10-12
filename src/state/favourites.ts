import { useCallback, useEffect, useState } from 'react';
import { track } from '../analytics/analytics';

/**
 * Favourites / shortlist, persisted in localStorage so it survives reloads
 * without an account. Kept as a self-contained module so it can later be
 * swapped for a per-user server-backed store when auth arrives, without
 * changing the components that use it.
 */

const STORAGE_KEY = 'android-advisor:favourites';

// A simple event target so all hook instances stay in sync within a tab.
const listeners = new Set<() => void>();

// SSR-safe: there is no localStorage/window during static generation.
const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function read(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (hasStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Storage may be unavailable (private mode / quota) — fail quietly.
    }
  }
  listeners.forEach((fn) => fn());
}

export function useFavourites() {
  // Start empty so server-rendered HTML and first client render match, then
  // hydrate from storage in an effect to avoid a hydration mismatch.
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    listeners.add(sync);
    window.addEventListener('storage', sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const added = !current.includes(id);
    const next = added ? [...current, id] : current.filter((x) => x !== id);
    write(next);
    track({ name: 'favourite_toggled', props: { phoneId: id, added } });
  }, []);

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  return { favourites: ids, toggle, isFavourite, count: ids.length };
}
