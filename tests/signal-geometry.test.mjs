import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignalGeometry } from '../src/signal-geometry.js';

test('every lens produces a bounded, finite, depth-ordered sculpture without random geometry', () => {
  const signatures = new Set();
  for (const lens of ['adoption', 'learning', 'communication']) {
    const geometry = createSignalGeometry(lens);
    assert.deepEqual(geometry, createSignalGeometry(lens));
    assert.equal(geometry.surfaces.length, 112);
    assert.ok(geometry.bounds.minX >= 40 && geometry.bounds.maxX <= 480);
    assert.ok(geometry.bounds.minY >= 50 && geometry.bounds.maxY <= 430);
    for (const [index, panel] of geometry.surfaces.entries()) {
      assert.ok(!/NaN|Infinity/.test(panel.path + panel.rib));
      assert.ok(Number.isFinite(panel.depth));
      assert.ok(index === 0 || geometry.surfaces[index - 1].depth <= panel.depth);
    }
    signatures.add(geometry.surfaces.map(panel => panel.path).join(''));
  }
  assert.equal(signatures.size, 3);
  assert.deepEqual(createSignalGeometry('unknown'), createSignalGeometry('adoption'));
});
