import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCabin } from './classify-cabin.mjs';

test('accepts explicit Log Cabin architecture', () => {
  assert.equal(classifyCabin({features: {architectureType: 'Log Cabin'}}).verified, true);
});
test('accepts exact Log exterior', () => {
  assert.equal(classifyCabin({features: {exteriorType: 'Wood / Log'}}).verified, true);
});
test('does not mistake Gas Log fireplace for log home', () => {
  assert.equal(classifyCabin({features: {fireplaceType: 'Gas Log', exteriorType: 'Wood'}}).verified, false);
});
test('Cabin is a candidate, not confirmed log construction', () => {
  assert.deepEqual(classifyCabin({features: {architectureType: 'Cabin'}}).classification, 'possible-cabin');
});
test('Chalet alone is not proof of logs', () => {
  assert.equal(classifyCabin({features: {architectureType: 'Chalet'}}).verified, false);
});
test('handles missing details and multiple architecture values', () => {
  assert.equal(classifyCabin({}).verified, false);
  assert.equal(classifyCabin({features: {architectureType: 'Custom / Log Cabin'}}).verified, true);
});
