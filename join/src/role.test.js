import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roleFromLocation } from './role.js';

test('role URLs choose a path and retain existing creator slide links', () => {
  assert.equal(roleFromLocation({ search: '', hash: '' }), null);
  assert.equal(roleFromLocation({ search: '?role=creator', hash: '' }), 'creator');
  assert.equal(roleFromLocation({ search: '?role=illustrator', hash: '' }), 'illustrator');
  assert.equal(roleFromLocation({ search: '', hash: '#s10' }), 'creator');
  assert.equal(roleFromLocation({ search: '', hash: '#s11' }), null);
  assert.equal(roleFromLocation({ search: '?role=other', hash: '' }), null);
});
