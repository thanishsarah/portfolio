import test from 'node:test';
import assert from 'node:assert/strict';
import { portfolioSearchIndex, normalizeSearchText, searchPortfolio } from '../src/portfolio-search.js';
import { caseStudies } from '../src/case-studies.js';
import { publicCurricula } from '../src/curriculum.js';

test('portfolio search ranks exact public titles and retains all query terms', () => {
  assert.equal(searchPortfolio('Digital citizenship')[0].id, 'curriculum-digital-citizenship');
  assert.equal(searchPortfolio('AI integration')[0].id, 'case-ai-literacy');
  assert.equal(searchPortfolio('FILMMAKING cinematography')[0].id, 'curriculum-filmmaking-cinematography');
  assert.ok(searchPortfolio('train trainer').some(item => item.id === 'case-media-shala'));
  assert.deepEqual(searchPortfolio('filmmaking zeppelin'), []);
  assert.deepEqual(searchPortfolio('unfindable xyzzy'), []);
  assert.equal(normalizeSearchText('  CREATÍVE—Communication!  '), 'creative communication');
});

test('search entries only navigate reviewed public content and deterministic suggestions', () => {
  assert.equal(new Set(portfolioSearchIndex.map(item => item.id)).size, portfolioSearchIndex.length);
  for (const item of portfolioSearchIndex) {
    assert.deepEqual(Object.keys(item).sort(), ['id', 'type', 'target', 'label', 'detail', 'keywords'].sort());
    assert.ok(item.label.length && item.detail.length);
    if (item.type === 'case') assert.ok(caseStudies.some(entry => entry.id === item.target));
    else if (item.type === 'curriculum') assert.ok(publicCurricula.some(entry => entry.title === item.label));
    else assert.ok(['section', 'international', 'lens'].includes(item.type));
  }
  assert.equal(searchPortfolio('')[0].id, 'case-ai-literacy');
  assert.deepEqual(searchPortfolio('   '), searchPortfolio(''));
  assert.equal(searchPortfolio('AI', { limit: 2 }).length, 2);
  assert.deepEqual(searchPortfolio('AI', { limit: 0 }), []);
  assert.doesNotMatch(JSON.stringify(portfolioSearchIndex), /(?:sediment:\/\/|data:|base64|file_\w+|\/workspace\/|\.pdf\b|\.xlsx\b|%PDF-)/i);
});
