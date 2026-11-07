/**
 * Bounded read-only discovery of candidate log cabins from RentCast.
 * One sale-search request and at most three individual property record lookups.
 * Candidate data is for review ONLY; it never goes into the public feed.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { classifyCabin } from './lib/classify-cabin.mjs';

const key = process.env.RENTCAST_API_KEY;
if (!key) {
  console.error('Missing RENTCAST_API_KEY environment variable.');
  process.exit(1);
}
const allowedStates = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
const state = process.env.RENTCAST_STATE || 'VA';
if (!allowedStates.has(state)) throw new Error('Use a two-letter state abbreviation.');

async function request(path, params) {
  const url = new URL('https://api.rentcast.io' + path);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  const response = await fetch(url, {
    headers: { 'X-Api-Key': key, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`RentCast HTTP ${response.status} (${path})`);
  const result = await response.json();
  if (!Array.isArray(result)) throw new Error('Unexpected RentCast response shape');
  return result;
}

try {
  const listings = await request('/v1/listings/sale', {
    state, propertyType: 'Single Family', status: 'Active', daysOld: 7, limit: 100,
  });
  const candidates = [];
  let checked = 0;
  // Small proof of concept. Matching against only the first three records
  // will usually NOT find a log cabin; don't confuse that with no cabins for sale.
  for (const listing of listings.slice(0, 3)) {
    if (typeof listing.formattedAddress !== 'string') continue;
    const records = await request('/v1/properties', {
      address: listing.formattedAddress, limit: 1,
    });
    checked++;
    const record = records[0];
    if (!record) continue;
    const result = classifyCabin(record);
    if (result.classification === 'not-confirmed') continue;
    candidates.push({
      id: String(listing.id ?? listing.formattedAddress),
      source: 'RentCast',
      address: listing.formattedAddress,
      city: listing.city ?? null,
      state: listing.state ?? state,
      price: listing.price ?? null,
      listedDate: listing.listedDate ?? null,
      classification: result.classification,
      evidence: result.evidence,
      status: 'needs-review',
      verified: false,
      // RentCast does not supply a direct listing page URL or licensed photos.
    });
  }

  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/candidates.json', import.meta.url),
    JSON.stringify({ retrievedAt: new Date().toISOString(), state, candidates }, null, 2) + '\n');

  console.log(JSON.stringify({
    state,
    saleListingsSampled: listings.length,
    propertyRecordsChecked: checked,
    candidatesForReview: candidates.length,
    apiRequestsMade: 1 + checked,
    published: 0,
    note: 'Sample only; not a nationwide survey. No direct source URLs or photos supplied.',
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unexpected RentCast error');
  process.exitCode = 1;
}
