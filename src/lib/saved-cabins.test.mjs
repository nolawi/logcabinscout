import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSavedCabins,toggleSavedCabin} from './saved-cabins.mjs';
test('invalid or unavailable saved data is safe and does not fabricate favorites',()=>{
  for(const raw of [null,'bad json','null','{}','123']) assert.deepEqual(parseSavedCabins(raw),[]);
});
test('saved IDs round-trip without duplicates and discard malformed values',()=>{
  const ids=['mls:123','zillow:456'];
  assert.deepEqual(parseSavedCabins(JSON.stringify([...ids,ids[0],null,4,'','   '])),ids);
});
test('toggling is reversible and never mutates the previous selection',()=>{
  const original=['mls:123'];
  const added=toggleSavedCabin(original,'zillow:456');
  assert.deepEqual(added,['mls:123','zillow:456']);
  assert.deepEqual(toggleSavedCabin(added,'mls:123'),['zillow:456']);
  assert.deepEqual(original,['mls:123']);
});
