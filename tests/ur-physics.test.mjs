import test from "node:test";
import assert from "node:assert/strict";
import {
  createPieceMotion,
  createCastMotion,
  dampedDisplacement,
} from "../src/ur-physics.js";

test("piece flights have exact endpoints, bounded lift, and ordered finite samples for varied geometry", () => {
  for (const [dx, dy, fromScale] of [
    [0, 0, 1],
    [80, 0, 1],
    [-450, 330, 0.6],
    [290, -600, 1.7],
  ]) {
    const curve = createPieceMotion({ dx, dy, fromScale });
    assert.ok(curve.duration >= 360 && curve.duration <= 540.01);
    assert.ok(curve.height > 0 && curve.height <= 36.01);
    assert.equal(
      curve.keyframes[0].transform,
      `translate(${dx}px, ${dy}px) scale(${fromScale}) rotate(0deg)`,
    );
    assert.equal(
      curve.keyframes.at(-1).transform,
      "translate(0px, 0px) scale(1) rotate(0deg)",
    );
    assert.equal(curve.keyframes[0].offset, 0);
    assert.equal(curve.keyframes.at(-1).offset, 1);
    assert.ok(
      curve.keyframes.every(
        (frame, i, all) =>
          !/NaN|Infinity/.test(frame.transform) &&
          (i === 0 || frame.offset > all[i - 1].offset),
      ),
    );
    const apex = (curve.gravity * (curve.flight / 1000) ** 2) / 8;
    assert.ok(Math.abs(apex - curve.height) < 1e-9);
    let peakLift = 0;
    for (const frame of curve.keyframes) {
      const [, x, y] = frame.transform
        .match(/translate\(([-.\d]+)px, ([-.\d]+)px\)/)
        .map(Number);
      const time = frame.offset * curve.duration;
      if (time <= curve.flight + 1e-8) {
        const progress = time / curve.flight;
        const lift = dy * (1 - progress) - y;
        assert.ok(Math.abs(x - dx * (1 - progress)) < 0.0001);
        assert.ok(lift >= -0.0001 && lift <= curve.height + 0.0001);
        peakLift = Math.max(peakLift, lift);
      } else {
        assert.equal(x, 0);
        assert.ok(Math.abs(y) < 3, `contact displacement ${y}`);
      }
    }
    assert.ok(Math.abs(peakLift - curve.height) < 0.0001);
  }
});
test("damped contact starts at rest displacement and decays for under, critical, and over damping", () => {
  for (const damping of [20, 2 * Math.sqrt(2500 * 1.6), 180]) {
    assert.equal(dampedDisplacement(0, { damping, velocity: 130 }), 0);
    assert.ok(
      Number.isFinite(dampedDisplacement(0.02, { damping, velocity: 130 })),
    );
    assert.ok(
      Math.abs(dampedDisplacement(2, { damping, velocity: 130 })) < 0.001,
    );
  }
});
test("casting follows a floor-bounded inelastic bounce and settles without a result dependency", () => {
  for (let index = 0; index < 4; index += 1) {
    const curve = createCastMotion(index);
    assert.ok(curve.duration >= 400 && curve.duration < 500);
    assert.equal(curve.energyRetention, curve.restitution ** 2);
    assert.ok(curve.impacts.length >= 2);
    const first = curve.impacts[1] - curve.impacts[0];
    const second = curve.impacts[2] - curve.impacts[1];
    assert.ok(Math.abs(second / first - curve.restitution) < 1e-9);
    for (const frame of curve.keyframes) {
      const y = Number(frame.transform.match(/translateY\(([-.\d]+)px\)/)[1]);
      assert.ok(y <= 0.00001 && y >= -25, `${index}: ${y}`);
    }
    assert.equal(
      curve.keyframes.at(-1).transform,
      "translateY(0px) rotate(0deg)",
    );
    assert.deepEqual(createCastMotion(index), curve);
  }
});
test("invalid physics inputs fail explicitly instead of producing broken transforms", () => {
  assert.throws(() => createPieceMotion({ dx: Infinity, dy: 0 }), TypeError);
  assert.throws(
    () => createPieceMotion({ dx: 0, dy: 0, fromScale: 0 }),
    RangeError,
  );
  assert.throws(() => createCastMotion(4), RangeError);
  assert.throws(() => dampedDisplacement(-1), RangeError);
  assert.throws(
    () => dampedDisplacement(1, { mass: Number.MIN_VALUE }),
    RangeError,
  );
  assert.throws(
    () => dampedDisplacement(1, { damping: Number.MAX_VALUE }),
    RangeError,
  );
});
