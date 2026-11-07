import assert from 'node:assert/strict';
import test from 'node:test';
import { STATES, stateForWeek } from './discovery-schedule.mjs';

test('rotation stays stable during the same UTC week', () => {
  assert.equal(stateForWeek('2026-11-02T00:00:00Z'), stateForWeek('2026-11-07T23:59:59Z'));
});
test('rotation cycles through all states across consecutive weeks', () => {
  const start = Date.UTC(2026, 10, 2);
  const states = Array.from({ length: STATES.length }, (_, i) => stateForWeek(new Date(start + i * 7 * 86400000)));
  assert.equal(STATES.length, 50);
  assert.equal(new Set(states).size, 50);
});
test('rejects malformed dates', () => {
  assert.throws(() => stateForWeek('not-a-date'), /Invalid date/);
});

test('manual state selection normalizes valid inputs and rejects unsupported states', async () => {
  const { spawnSync } = await import('node:child_process');
  const script = new URL('../select-discovery-state.mjs', import.meta.url);
  const run = value => spawnSync(process.execPath, [script.pathname], { env: { ...process.env, RENTCAST_STATE: value }, encoding: 'utf8' });
  const valid = run(' ca ');
  assert.equal(valid.status, 0);
  assert.equal(valid.stdout.trim(), 'CA');
  assert.notEqual(run('ZZ').status, 0);
});

test('manual workflow choices cover the same 50 states as scheduled discovery', async () => {
  const { readFile } = await import('node:fs/promises');
  const workflow = await readFile(new URL('../../.github/workflows/rentcast-discover.yml', import.meta.url), 'utf8');
  const choices = workflow.match(/options: \[([^\]]+)\]/)[1].split(',').map(value => value.trim());
  assert.deepEqual(choices, [...STATES]);
});
