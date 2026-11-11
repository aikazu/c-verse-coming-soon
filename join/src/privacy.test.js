import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import joinConfig from '../../vite.join.config.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('both entry pages link to the common notice emitted by the join build', () => {
  const source = read('../../public/privacy.html');
  for (const entry of ['../../index.html', '../index.html']) {
    assert.match(read(entry), /href="\/privacy\.html"/);
  }
  const plugin = joinConfig.plugins.find((entry) => entry.name === 'shared-privacy-notice');
  let emitted;
  plugin.generateBundle.call({ emitFile(asset) { emitted = asset; } });
  assert.deepEqual(emitted, { type: 'asset', fileName: 'privacy.html', source });
  assert.match(source, /Iqbal Atila/);
  assert.match(source, /2026-11-11/);
  assert.match(source, /Google Fonts/);
  assert.match(source, /cverse_sound/);
  assert.match(source, /cverse_music/);
  assert.match(source, /mailto:privacy@c-verse\.co/);
  assert.doesNotMatch(source, /<script|fonts\.googleapis|staging\.c-verse/);
});
