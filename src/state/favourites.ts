import { useCallback, useEffect, useState } from 'react';

/**
 * Favourites / shortlist, persisted in localStorage so it survives reloads
 * without an account. Kept as a self-contained module so it can later be
 * swapped for a per-user server-backed store when auth arrives, without
 * changing the components that use it.
 */

const STORAGE_KEY = 'android-advisor:favourites';

// A simple event target so all hook instances stay in sync within a tab.
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable (private mode / quota) — fail quietly.
  }
  listeners.forEach((fn) => fn());
}

export function useFavourites() {
  const [ids, setIds] = useState<string[]>(() => read());

  useEffect(() => {
    const sync = () => setIds(read());
    listeners.add(sync);
    // Also sync across tabs/windows.
    window.addEventListener('storage', sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    write(next);
  }, []);

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  return { favourites: ids, toggle, isFavourite, count: ids.length };
}
