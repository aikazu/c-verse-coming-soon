import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roleFromLocation, slideIndexForRole } from './role.js';

test('role URLs choose a path and retain existing creator slide links', () => {
  assert.equal(roleFromLocation({ search: '', hash: '' }), null);
  assert.equal(roleFromLocation({ search: '?role=creator', hash: '' }), 'creator');
  assert.equal(roleFromLocation({ search: '?role=illustrator', hash: '' }), 'illustrator');
  assert.equal(roleFromLocation({ search: '', hash: '#s10' }), 'creator');
  assert.equal(roleFromLocation({ search: '', hash: '#s11' }), null);
  assert.equal(roleFromLocation({ search: '?role=other', hash: '' }), null);
  assert.equal(roleFromLocation({ search: '', hash: '#i5' }), 'illustrator');
  assert.equal(slideIndexForRole('illustrator', '#i10'), 9);
  assert.equal(slideIndexForRole('creator', '#s5'), 4);
  assert.equal(slideIndexForRole('illustrator', '#s5'), 0);
  assert.equal(slideIndexForRole('creator', '#i11'), 0);
});
