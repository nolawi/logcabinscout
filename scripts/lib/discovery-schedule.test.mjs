import assert from 'node:assert/strict';
import test from 'node:test';
import { STATES, stateForWeek } from './discovery-schedule.mjs';

test('rotation stays stable during the same UTC week', () => {
  assert.equal(stateForWeek('2026-11-02T00:00:00Z'), stateForWeek('2026-11-07T23:59:59Z'));
});
test('rotation cycles through all states across consecutive weeks', () => {
  const start = Date.UTC(2026, 10, 2);
  const states = Array.from({ length: STATES.length }, (_, i) => stateForWeek(new Date(start + i * 7 * 86400000)));
  assert.equal(new Set(states).size, STATES.length);
});
test('rejects malformed dates', () => {
  assert.throws(() => stateForWeek('not-a-date'), /Invalid date/);
});
