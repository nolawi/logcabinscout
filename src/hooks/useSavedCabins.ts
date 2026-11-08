import { useEffect, useRef, useState } from 'react';
import { parseSavedCabins, SAVED_CABINS_KEY, toggleSavedCabin } from '../lib/saved-cabins.mjs';

export function useSavedCabins() {
  // Match the static HTML on first render; browser storage is read after hydration.
  const [saved, setSaved] = useState<string[]>([]);
  const latest = useRef<string[]>([]);
  const [canPersist, setCanPersist] = useState(true);
  useEffect(() => {
    const apply = (raw: string | null) => {
      latest.current = parseSavedCabins(raw);
      setSaved(latest.current);
    };
    try { apply(window.localStorage.getItem(SAVED_CABINS_KEY)); }
    catch { setCanPersist(false); }
    const sync = (event: StorageEvent) => {
      if (event.key === SAVED_CABINS_KEY || event.key === null) apply(event.newValue);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggle = (id: string) => {
    latest.current = toggleSavedCabin(latest.current, id);
    setSaved(latest.current);
    try {
      window.localStorage.setItem(SAVED_CABINS_KEY, JSON.stringify(latest.current));
      setCanPersist(true);
    } catch { setCanPersist(false); }
  };
  return { saved, toggle, canPersist };
}
