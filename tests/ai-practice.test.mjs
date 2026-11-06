import test from 'node:test';
import assert from 'node:assert/strict';
import { aiPractice } from '../src/ai-practice.js';

test('AI practice data remains a public overview without hidden implementation files', () => {
  assert.deepEqual(Object.keys(aiPractice).sort(), ['intro', 'context', 'workstreams'].sort());
  assert.ok(aiPractice.intro.length > 0 && aiPractice.intro.length < 600);
  for (const context of aiPractice.context) {
    assert.ok(Object.keys(context).every(key => ['name', 'url'].includes(key)));
    assert.equal(typeof context.name, 'string');
    if (context.url) {
      const url = new URL(context.url);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.search, '');
      assert.ok(['www.instagram.com', 'kedmanglobal.com'].includes(url.hostname));
    }
  }
  const ids = new Set();
  for (const item of aiPractice.workstreams) {
    assert.deepEqual(Object.keys(item).sort(), ['id', 'title', 'summary', 'focus', 'review'].sort());
    assert.match(item.id, /^[a-z]+$/);
    assert.ok(!ids.has(item.id));
    ids.add(item.id);
    assert.ok(item.summary.length <= 400 && item.review.length <= 300);
    assert.ok(item.focus.every(label => typeof label === 'string' && label.length <= 80));
  }
  assert.doesNotMatch(JSON.stringify(aiPractice), /(?:sediment:\/\/|data:|base64|file_\w+|\/workspace\/|\.pdf\b|\.xlsx\b|%PDF-)/i);
});
