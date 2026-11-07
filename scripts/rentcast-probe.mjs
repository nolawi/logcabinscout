/**
 * Safe, read-only RentCast diagnostic.
 * It makes at most ONE API request, does not persist listings, and never logs credentials.
 * RentCast sale listings do not provide enough information to identify genuine log cabins.
 */
const state = process.env.RENTCAST_STATE ?? 'VA';
const key = process.env.RENTCAST_API_KEY;
const allowedStates = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));

if (!key) {
  console.error('RENTCAST_API_KEY is not configured.');
  process.exit(1);
}
if (!allowedStates.has(state)) {
  console.error('RENTCAST_STATE must be a two-letter US state abbreviation.');
  process.exit(1);
}

const params = new URLSearchParams({
  state,
  status: 'Active',
  propertyType: 'Single Family',
  limit: '500',
  daysOld: '7',
});
const url = `https://api.rentcast.io/v1/listings/sale?${params}`;

try {
  const response = await fetch(url, {
    headers: { 'X-Api-Key': key, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    console.error(`RentCast request failed with HTTP ${response.status}. Check subscription status, quota and query parameters in RentCast.`);
    process.exit(1);
  }
  const listings = await response.json();
  if (!Array.isArray(listings)) throw new Error('Expected a listing array.');
  console.log(JSON.stringify({
    state,
    recordsReturned: listings.length,
    hasMorePossibly: listings.length === 500,
    caveat: 'RentCast sale listings do not provide photos, listing descriptions or definitive log-cabin identification. No listings have been published.',
  }, null, 2));
} catch (error) {
  console.error(`RentCast request could not complete: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exitCode = 1;
}
