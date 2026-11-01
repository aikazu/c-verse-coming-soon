// Run: npm run test:join. Expected values match the asserts in the PDF deck build.
import assert from 'node:assert/strict';
import test from 'node:test';

import { primaryShare, royalty, rp, seedFee } from './economy.js';

test('first-sale share floors to whole C.Gems', () => {
  assert.deepEqual([30, 50].map((p) => primaryShare(p)), [9, 15]);
  assert.equal(primaryShare(30, true), 4);
});

test('resale royalty ceils to whole C.Gems', () => {
  assert.deepEqual([50, 80, 150].map((p) => royalty(p)), [4, 6, 12]);
  assert.equal(royalty(50, true), 3);
});

test('Seed sale fee is 15% ceiled, or two ceiled 7,5% parts with a collaborator', () => {
  assert.equal(seedFee(100), 15);
  assert.equal(seedFee(55), 9);
  assert.equal(seedFee(100, true), 16);
  assert.equal(seedFee(30, true), 6);
});

test('rupiah uses Indonesian grouping', () => {
  assert.equal(rp(9), 'Rp90.000');
  assert.equal(rp(150), 'Rp1.500.000');
});
