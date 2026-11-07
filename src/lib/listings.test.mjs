import test from 'node:test';
import assert from 'node:assert/strict';
import { parseListings, MAX_LISTING_AGE_MS } from './listings.ts';
import { buildFeed } from '../../scripts/lib/build-feed.mjs';
const now = Date.parse('2026-11-07T12:00:00Z');
const listing = {
  id: 'test:1', title: 'Log home', location: 'Mineral, Virginia', price: 250000,
  acreage: 2, listingUrl: 'https://example.com/cabin', verified: true,
  status: 'active', lastCheckedAt: '2026-11-06T12:00:00Z',
};
test('review date survives generation and parsing', () => {
  const [parsed] = parseListings(buildFeed([listing]), now);
  assert.equal(parsed.lastCheckedAt, '2026-11-06T12:00:00.000Z');
  assert.equal(parsed.isSample, false);
});
test('expires at exactly 30 days, including a previously generated static feed', () => {
  const feed = buildFeed([listing]);
  const checked = Date.parse(listing.lastCheckedAt);
  assert.equal(parseListings(feed, checked + MAX_LISTING_AGE_MS - 1).length, 1);
  assert.equal(parseListings(feed, checked + MAX_LISTING_AGE_MS).length, 0);
  assert.equal(parseListings(feed, checked + MAX_LISTING_AGE_MS + 1).length, 0);
});
test('rejects missing, invalid, normalized-invalid, and future review dates', () => {
  for (const lastCheckedAt of [undefined, null, '', 'garbage', '2026-11-06', '2026-02-30T12:00:00Z', '2026-11-08T12:00:00Z']) {
    assert.equal(parseListings([{ ...listing, lastCheckedAt }], now).length, 0);
  }
});
test('empty or invalid entries never become sample listings', () => {
  assert.deepEqual(parseListings([], now), []);
  assert.deepEqual(parseListings([null, {}, { ...listing, verified: false }, { ...listing, listingUrl: 'javascript:alert(1)' }], now), []);
  assert.throws(() => parseListings({ listings: [] }, now), /listing array/);
  assert.equal(parseListings([listing, listing], now).length, 1);
});
