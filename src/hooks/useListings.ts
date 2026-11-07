import { useEffect, useState } from 'react';
import type { Cabin } from '../types/cabin';
import { parseListings } from '../lib/listings';

type ListingFeed = { listings: Cabin[]; isLoading: boolean; error: boolean };

/**
 * Read a public, pre-generated feed. Secrets and provider API calls stay
 * server-side; the browser never communicates directly with RentCast.
 */
export function useListings(): ListingFeed {
  const [listings, setListings] = useState<Cabin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

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
        if (!controller.signal.aborted) setListings(parseListings(data));
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
