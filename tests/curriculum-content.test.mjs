import test from 'node:test';
import assert from 'node:assert/strict';
import { publicCurricula } from '../src/curriculum.js';

test('public curriculum catalogue contains only the approved overview schema', () => {
  const fields = ['id', 'title', 'category', 'scope', 'summary', 'focus'].sort();
  const ids = new Set();
  assert.ok(publicCurricula.length > 0);
  for (const item of publicCurricula) {
    assert.deepEqual(Object.keys(item).sort(), fields, 'No source-file or hidden lesson-content fields may be added');
    assert.match(item.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(!ids.has(item.id));
    ids.add(item.id);
    for (const key of ['title', 'category', 'scope', 'summary']) {
      assert.equal(typeof item[key], 'string');
      assert.ok(item[key].trim().length > 0);
    }
    assert.ok(item.summary.length <= 400, 'Overviews must remain concise');
    assert.ok(Array.isArray(item.focus) && item.focus.length > 0 && item.focus.length <= 4);
    for (const focus of item.focus) assert.ok(typeof focus === 'string' && focus.length <= 60);
    const serialized = JSON.stringify(item);
    assert.doesNotMatch(serialized, /(?:https?:\/\/|sediment:\/\/|data:|base64|file_\w+|\/workspace\/|\.pdf\b|\.xlsx\b|\.xlsm\b|%PDF-)/i, 'Public overviews must not contain original-file references or embedded documents');
  }
});
