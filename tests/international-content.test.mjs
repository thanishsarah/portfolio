import test from 'node:test';
import assert from 'node:assert/strict';
import { internationalPractice } from '../src/international.js';
import { profile } from '../src/content.js';

test('international practice publishes only reviewed overviews and skill labels', () => {
  assert.deepEqual(Object.keys(internationalPractice).sort(), ['title', 'introduction', 'areas', 'skills'].sort());
  assert.ok(internationalPractice.areas.length > 0);
  for (const area of internationalPractice.areas) {
    assert.deepEqual(Object.keys(area).sort(), ['summary', 'title']);
    assert.equal(typeof area.title, 'string');
    assert.ok(area.summary.length > 0 && area.summary.length <= 400);
  }
  assert.ok(internationalPractice.skills.every(skill => typeof skill === 'string' && skill.length <= 90));
  assert.doesNotMatch(JSON.stringify(internationalPractice), /(?:https?:\/\/|sediment:\/\/|data:|base64|file_\w+|\/workspace\/|\.pdf\b|\.xlsx\b|%PDF-)/i);
  assert.ok(profile.interests.includes('IB-aligned curriculum communication'));
  assert.ok(profile.interests.includes('International education frameworks'));
});
