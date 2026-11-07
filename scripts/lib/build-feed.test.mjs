import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed } from './build-feed.mjs';
const today = new Date('2026-11-07T12:00:00Z');
const good = {
  id: 'source:123', title: 'Verified log home', location: 'Example, VA',
  price: 200000, acreage: 2, listingUrl: 'https://example.org/listing/123',
  status: 'active', verified: true, lastCheckedAt: '2026-11-06T12:00:00Z',
};
test('publishes only reviewed active recent listings', () => {
  assert.equal(buildFeed([good], today).length, 1);
  assert.equal(buildFeed([{...good, verified: false}], today).length, 0);
  assert.equal(buildFeed([{...good, status: 'sold'}], today).length, 0);
});
test('rejects stale or unsourced records', () => {
  assert.equal(buildFeed([{...good, lastCheckedAt: '2026-09-01'}], today).length, 0);
  assert.equal(buildFeed([{...good, listingUrl: 'javascript:alert(1)'}], today).length, 0);
});
test('deduplicates by listing id', () => {
  assert.equal(buildFeed([good, good], today).length, 1);
});
test('rejects malformed records', () => {
  assert.equal(buildFeed([null, {}, {...good, price: -1}], today).length, 0);
});
