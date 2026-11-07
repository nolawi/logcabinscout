import { createHash } from 'node:crypto';
import { classifyCabin } from './classify-cabin.mjs';
import { weekIndex } from './discovery-schedule.mjs';

export const MAX_REQUESTS = 4;

/** Reserve before fetch, so failed requests and concurrent calls count too. No retries. */
export function createRentCastClient(key, fetcher = fetch) {
  let attempts = 0;
  return {
    get attempts() { return attempts; },
    async request(path, params) {
      if (attempts >= MAX_REQUESTS) throw new Error('Discovery request limit reached');
      attempts++;
      const url = new URL('https://api.rentcast.io' + path);
      for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
      const response = await fetcher(url, {
        headers: { 'X-Api-Key': key, Accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`RentCast HTTP ${response.status} (${path})`);
      const result = await response.json();
      if (!Array.isArray(result)) throw new Error('Unexpected RentCast response shape');
      return result;
    },
  };
}

/** Stable weekly ordering varies the sample without another provider request. */
export function selectListings(listings, state, date = new Date()) {
  const unique = new Map();
  for (const item of listings) {
    if (!item || typeof item.formattedAddress !== 'string') continue;
    const address = item.formattedAddress.trim();
    const identity = address.replace(/\s+/g, ' ').toLowerCase();
    if (!identity || unique.has(identity)) continue;
    unique.set(identity, { ...item, formattedAddress: address });
  }
  const seed = `${state}:${weekIndex(date)}`;
  const rank = address => createHash('sha256').update(`${seed}:${address}`).digest('hex');
  return [...unique.entries()].sort(([a], [b]) => rank(a).localeCompare(rank(b)))
    .slice(0, MAX_REQUESTS - 1).map(([, item]) => item);
}

export async function discover(state, client, date = new Date()) {
  const listings = await client.request('/v1/listings/sale', {
    state, propertyType: 'Single Family', status: 'Active', daysOld: 7, limit: 100,
  });
  const candidates = [];
  const selected = selectListings(listings, state, date);
  let checked = 0;
  for (const listing of selected) {
    const records = await client.request('/v1/properties', { address: listing.formattedAddress, limit: 1 });
    checked++;
    const result = classifyCabin(records[0]);
    if (result.classification === 'not-confirmed') continue;
    candidates.push({
      id: String(listing.id ?? listing.formattedAddress), source: 'RentCast',
      address: listing.formattedAddress, city: listing.city ?? null,
      state: listing.state ?? state, price: listing.price ?? null,
      listedDate: listing.listedDate ?? null, classification: result.classification,
      evidence: result.evidence, status: 'needs-review', verified: false,
    });
  }
  return {
    candidates,
    summary: {
      state, saleListingsSampled: listings.length, propertyRecordsChecked: checked,
      candidatesForReview: candidates.length, apiRequestsAttempted: client.attempts,
      requestLimit: MAX_REQUESTS, published: 0,
      note: 'Bounded sample only; no coverage estimate. No original listing URLs or photos supplied.',
    },
  };
}
