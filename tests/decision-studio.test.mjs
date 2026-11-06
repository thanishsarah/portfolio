import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDecisionReview, initialReview, reviewChoices, studioBrief } from '../src/decision-studio.js';

test('the fictional review stays on hold until every editorial issue is addressed', () => {
  for (let mask = 0; mask < 8; mask += 1) {
    const review = Object.fromEntries(reviewChoices.map((choice, index) => [choice.id, Boolean(mask & (1 << index))]));
    const result = buildDecisionReview(review);
    assert.equal(result.readyForReview, mask === 7);
    assert.equal(result.appliedCount + result.remaining.length, 3);
    assert.equal(result.status, mask === 7 ? 'Ready for human review' : 'Hold for revision');
    if (result.readyForReview) {
      assert.match(result.nextDecision, /responsible owner still needs to verify/);
      assert.doesNotMatch(result.subject + result.passages.map(p => p.text).join(' '), /every learner will master|learning effortless|photographs of every learner will be shared/i);
    }
  }
});

test('audience changes preserve the permission boundary and the human decision', () => {
  const reviewed = { promise: true, audience: true, permission: true };
  const family = buildDecisionReview(reviewed, 'families');
  const leader = buildDecisionReview(reviewed, 'leadership');
  assert.match(family.passages[1].text, /^For families/);
  assert.match(leader.passages[1].text, /^For academic and communication leads/);
  assert.notEqual(family.passages[1].text, leader.passages[1].text);
  assert.equal(family.passages[2].text, leader.passages[2].text);
  assert.match(leader.passages[2].text, /separate, appropriate permission process/);
  assert.equal(leader.status, 'Ready for human review');
  assert.deepEqual(initialReview, { promise: false, audience: false, permission: false });
  assert.match(studioBrief.boundary, /invented example/);
});
