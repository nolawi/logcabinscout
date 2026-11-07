/**
 * Limited real-data discovery: one sale-listings query and up to 3 property
 * record lookups. Prints summary only; no publication or database writes.
 * To run: RENTCAST_API_KEY=... node scripts/rentcast-discover.mjs
 */
import { classifyCabin } from './lib/classify-cabin.mjs';

const key = process.env.RENTCAST_API_KEY;
if (!key) {
  console.error('Missing RENTCAST_API_KEY environment variable.');
  process.exit(1);
}
const allowedStates = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
const state = process.env.RENTCAST_STATE || 'VA';
if (!allowedStates.has(state)) throw new Error('Use a two-letter state abbreviation.');
const maxLookups = 3; // 1 + 3 = 4 billable requests maximum per run

async function request(path, params) {
  const url = new URL('https://api.rentcast.io' + path);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
  const response = await fetch(url, {
    headers: {'X-Api-Key': key, Accept: 'application/json'},
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
  const summary = {state, activeListingsSampled: listings.length, checkedPropertyRecords: 0, confirmedLogCabins: 0, possibleCabins: 0, maxRequests: 4, sampleOnly: true};
  // API does not support architecture-style filtering: sample a small group
  // rather than spending the entire free monthly quota on enrichment.
  for (const listing of listings.slice(0, maxLookups)) {
    if (!listing.formattedAddress) continue;
    const records = await request('/v1/properties', {address: listing.formattedAddress, limit: 1});
    summary.checkedPropertyRecords++;
    const result = records.length ? classifyCabin(records[0]) : {classification: 'not-confirmed', verified: false};
    if (result.verified) summary.confirmedLogCabins++;
    if (result.classification === 'possible-cabin') summary.possibleCabins++;
  }
  console.log(JSON.stringify(summary, null, 2));
  console.log('No listings are published. A small sample is not representative of a full state.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unexpected RentCast error');
  process.exitCode = 1;
}
