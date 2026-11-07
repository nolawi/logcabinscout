import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed } from './build-feed.mjs';
const good = {
  id: 'source:123', title: 'Verified log home', location: 'Example, VA',
  price: 200000, acreage: 2, listingUrl: 'https://example.org/listing/123',
  status: 'active', verified: true, lastCheckedAt: '2026-11-06T12:00:00Z',
};
test('publishes only reviewed active listings with review dates', () => {
  assert.equal(buildFeed([good]).length, 1);
  assert.equal(buildFeed([{...good, verified: false}]).length, 0);
  assert.equal(buildFeed([{...good, status: 'sold'}]).length, 0);
});
test('retains old review dates for browser expiry and rejects unsourced records', () => {
  assert.equal(buildFeed([{...good, lastCheckedAt: '2026-09-01T12:00:00Z'}])[0].lastCheckedAt, '2026-09-01T12:00:00.000Z');
  assert.equal(buildFeed([{...good, listingUrl: 'javascript:alert(1)'}]).length, 0);
});
test('deduplicates by listing id', () => {
  assert.equal(buildFeed([good, good]).length, 1);
});
test('rejects malformed records', () => {
  assert.equal(buildFeed([null, {}, {...good, price: -1}]).length, 0);
});

test('rejects invalid review dates without manufacturing verification dates', () => {
  for (const lastCheckedAt of [undefined, null, '', 'bad', '2026-02-30T12:00:00Z', '2026-11-07']) {
    assert.deepEqual(buildFeed([{ ...good, lastCheckedAt }]), []);
  }
});
