import { useEffect, useMemo, useState } from 'react';
import type { Cabin } from '../types/cabin';
import { parseListings } from '../lib/listings';

type ListingFeed = { listings: Cabin[]; isLoading: boolean; error: boolean };

/**
 * Read a public, pre-generated feed. Secrets and provider API calls stay
 * server-side; the browser never communicates directly with RentCast.
 */
export function useListings(): ListingFeed {
  const [records, setRecords] = useState<unknown>([]);
  const [now, setNow] = useState(Date.now);
  const listings = useMemo(() => parseListings(records, now), [records, now]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}listings.json`, {
          signal: controller.signal,
          cache: 'no-cache',
        });
        if (!response.ok) throw new Error('Listing feed unavailable');
        const data: unknown = await response.json();
        parseListings(data); // Reject malformed feed envelopes as a loading error.
        if (!controller.signal.aborted) {
          setRecords(data);
          setNow(Date.now());
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  return { listings, isLoading, error };
}
