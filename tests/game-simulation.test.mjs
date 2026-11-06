import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, STATIONS, createGame, stepGame, gameCommand, planRoute, predictTrajectory, getGameTelemetry, serializeProgress, restoreProgress } from '../src/game/simulation.js';

const DT = 1 / 120;
const start = () => gameCommand(createGame(), { type: 'START' });
const run = (state, seconds, input = {}) => {
  for (let index = 0; index < Math.round(seconds / DT); index += 1) state = stepGame(state, input, DT);
  return state;
};
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(deepFreeze); }
  return value;
}
function clearance(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(a.x + t * dx, a.y + t * dy);
}

test('ready, paused, captured, and complete states do not advance physics or time', () => {
  const ready = createGame();
  assert.equal(stepGame(ready, { thrustX: 1 }, DT), ready);
  let paused = gameCommand(start(), { type: 'PAUSE' });
  assert.equal(stepGame(paused, { thrustX: 1 }, DT), paused);
  paused = gameCommand(paused, { type: 'RESUME' });
  assert.equal(paused.phase, 'playing');
  for (const phase of ['captured', 'complete']) {
    const state = { ...paused, phase };
    assert.equal(stepGame(state, {}, DT), state);
  }
});

test('fixed input sequences replay deterministically without mutating frozen state', () => {
  let first = deepFreeze(start()); let second = start();
  const original = JSON.stringify(first);
  for (let index = 0; index < 1800; index += 1) {
    const input = { thrustX: index % 240 < 120 ? 1 : -1, thrustY: index % 360 < 180 ? -.5 : .5, brake: index % 200 > 170 };
    first = stepGame(first, input, DT); second = stepGame(second, input, DT);
    assert.deepEqual(first, second);
  }
  assert.equal(JSON.stringify(deepFreeze(start())), original);
  assert.ok(Object.values(first.ship).every(Number.isFinite));
});

test('diagonal thrust has the same magnitude as axial thrust after gravity is removed', () => {
  const state = start();
  const coast = stepGame(state, {}, DT).ship;
  const axial = stepGame(state, { thrustX: 1 }, DT).ship;
  const diagonal = stepGame(state, { thrustX: 1, thrustY: 1 }, DT).ship;
  const acceleration = ship => Math.hypot(ship.vx - coast.vx, ship.vy - coast.vy);
  assert.ok(Math.abs(acceleration(axial) - acceleration(diagonal)) < 1e-10);
});

test('braking counters drift, speed stays bounded, and boundary reflection remains finite', () => {
  let state = { ...start(), ship: { x: -1000, y: 600, vx: 180, vy: 50, angle: 0 } };
  state = run(state, 1.5, { brake: true });
  assert.ok(getGameTelemetry(state).speed < 5);
  state = run(start(), 20, { thrustX: -1 });
  assert.ok(getGameTelemetry(state).speed <= WORLD.maxSpeed + 1e-8);
  assert.ok(state.ship.x >= WORLD.minX && state.ship.x <= WORLD.maxX);
  const edge = { ...start(), ship: { x: WORLD.maxX - .1, y: 900, vx: 250, vy: 0, angle: 0 } };
  const reflected = stepGame(edge, { thrustX: 1 }, 1 / 30);
  assert.equal(reflected.ship.x, WORLD.maxX);
  assert.ok(reflected.ship.vx < 0);
});

test('large frame gaps are capped and invalid time steps cannot jump the simulation', () => {
  const state = start();
  assert.deepEqual(stepGame(state, {}, 10), stepGame(state, {}, 1 / 30));
  for (const dt of [NaN, Infinity, -1, 0]) assert.equal(stepGame(state, {}, dt), state);
  assert.doesNotThrow(() => stepGame(state, null, DT));
});

test('scanning requires proximity, stable speed, and a continuous hold', () => {
  const station = STATIONS[0];
  let state = { ...start(), ship: { ...start().ship, x: station.x, y: station.y } };
  state = run(state, 1, { scan: true, brake: true });
  assert.ok(state.scanProgress > .6 && state.scanProgress < 1);
  assert.deepEqual(state.recovered, []);
  state = stepGame(state, { brake: true }, DT);
  assert.equal(state.scanProgress, 0);
  state = run(state, 1.6, { scan: true, brake: true });
  assert.deepEqual(state.recovered, ['learning']);
  assert.equal(state.lastCheckpoint.id, 'learning');
  assert.equal(state.score, 100);
  assert.equal(state.events.filter(event => event.type === 'signal').length, 1);
  const fast = { ...start(), ship: { x: station.x, y: station.y, vx: 100, vy: 0, angle: 0 } };
  assert.equal(stepGame(fast, { scan: true }, DT).scanProgress, 0);
  assert.equal(run(start(), 2, { scan: true, brake: true }).recovered.length, 0);
});

test('capture is recoverable and retains discovered signals without reusing dangerous velocity', () => {
  let state = { ...start(), recovered: ['learning'], score: 100, lastCheckpoint: { id: 'learning', x: STATIONS[0].x, y: STATIONS[0].y }, ship: { x: 97, y: 0, vx: -200, vy: 0, angle: 0 } };
  state = stepGame(state, {}, 1 / 30);
  assert.equal(state.phase, 'captured');
  assert.equal(state.lastEvent.type, 'captured');
  const rescued = gameCommand(state, { type: 'RESPAWN' });
  assert.equal(rescued.phase, 'playing');
  assert.deepEqual(rescued.recovered, ['learning']);
  assert.equal(rescued.ship.x, STATIONS[0].x);
  assert.equal(rescued.ship.vx, 0);
  assert.equal(rescued.ship.vy, 0);
  assert.equal(rescued.recoveries, 1);
  assert.equal(rescued.score, 90);
});

test('visibility-graph routes keep all normal flight segments outside the exclusion circle', () => {
  for (const from of [WORLD.dock, ...STATIONS]) for (const target of [WORLD.dock, ...STATIONS]) {
    const path = planRoute(from, target);
    assert.ok(path.length >= 1);
    assert.deepEqual(path.at(-1), { x: target.x, y: target.y });
    let previous = from;
    for (const waypoint of path) {
      assert.ok(clearance(previous, waypoint) >= WORLD.navigationRadius - 1e-6);
      assert.ok(Number.isFinite(waypoint.x) && Number.isFinite(waypoint.y));
      previous = waypoint;
    }
  }
  assert.deepEqual(planRoute(WORLD.dock, { x: 0, y: 0 }), []);
  assert.deepEqual(planRoute({ x: NaN, y: 0 }, WORLD.dock), []);
  assert.ok(planRoute({ x: 150, y: 0 }, WORLD.dock)[0].x > 300);
});

test('guided steering recovers all signals and returns safely within the mission budget', () => {
  let state = gameCommand(start(), { type: 'TOGGLE_GUIDANCE' });
  let nearest = Infinity;
  for (let index = 0; index < 180 / DT && state.phase === 'playing'; index += 1) {
    state = stepGame(state, {}, DT);
    nearest = Math.min(nearest, Math.hypot(state.ship.x, state.ship.y));
  }
  assert.equal(state.phase, 'complete');
  assert.deepEqual(state.recovered, ['learning', 'communication', 'ai']);
  assert.ok(state.time < 180);
  assert.ok(nearest > WORLD.blackHole.radius + 150);
  assert.equal(state.events.filter(event => event.type === 'signal').length, 3);
  assert.equal(state.lastEvent.type, 'complete');
  assert.equal(getGameTelemetry(state).speed, 0);
  assert.equal(state.score, 300);
});

test('manual thrust or brake takes control immediately without producing repeated override events', () => {
  const guided = gameCommand(start(), { type: 'TOGGLE_GUIDANCE' });
  for (const input of [{ thrustX: 1 }, { brake: true }]) {
    let state = stepGame(guided, input, DT);
    assert.equal(state.guidance, false);
    assert.equal(state.lastEvent.type, 'manual');
    const count = state.events.length;
    state = run(state, .5, input);
    assert.equal(state.events.length, count);
  }
});

test('the observatory cannot complete a mission with missing signals', () => {
  const state = stepGame(start(), { brake: true }, DT);
  assert.equal(state.phase, 'playing');
  const selected = gameCommand(state, { type: 'SELECT_TARGET', id: 'observatory' });
  assert.equal(stepGame(selected, { brake: true }, DT).phase, 'playing');
  assert.equal(gameCommand(state, { type: 'SELECT_TARGET', id: 'missing' }), state);
});

test('coast prediction is bounded, finite, and leaves live state unchanged', () => {
  const state = deepFreeze({ ...start(), ship: { x: 600, y: 300, vx: -50, vy: 80, angle: 1 } });
  const before = JSON.stringify(state);
  const path = predictTrajectory(state, 6);
  assert.ok(path.length > 2 && path.length <= 62);
  assert.deepEqual(path[0], { x: state.ship.x, y: state.ship.y });
  assert.ok(path.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(path, predictTrajectory(state, 6));
});

test('save data contains progress only and restores at a safe checkpoint', () => {
  const station = STATIONS[0];
  const state = { ...start(), recovered: ['learning'], targetId: 'communication', time: 37.5, recoveries: 2, lastCheckpoint: { id: 'learning', x: station.x, y: station.y }, personal: 'must not enter save', ship: { x: 200, y: 200, vx: 250, vy: -99, angle: 0 } };
  const encoded = serializeProgress(state);
  assert.equal(encoded.includes('personal'), false);
  assert.equal(encoded.includes('ship'), false);
  const restored = restoreProgress(encoded);
  assert.equal(restored.phase, 'ready');
  assert.deepEqual(restored.recovered, ['learning']);
  assert.equal(restored.ship.x, station.x);
  assert.equal(restored.ship.vx, 0);
  assert.equal(restored.ship.vy, 0);
  assert.equal(restored.time, 37.5);
  assert.equal(restored.score, 80);
  assert.equal(restored.targetId, 'communication');
});

test('malformed and inconsistent saves fail safely, and event history remains bounded', () => {
  const valid = JSON.parse(serializeProgress(createGame()));
  for (const patch of [{ version: 2 }, { recovered: ['private'] }, { recovered: ['ai', 'ai'] }, { recoveries: -1 }, { time: Infinity }, { targetId: 'missing' }, { lastCheckpoint: 'ai' }]) assert.equal(restoreProgress({ ...valid, ...patch }), null);
  for (const value of [null, '', '{broken', 42]) assert.equal(restoreProgress(value), null);
  let state = start();
  for (let index = 0; index < 120; index += 1) state = gameCommand(state, { type: 'TOGGLE_GUIDANCE' });
  assert.ok(state.events.length <= 40);
  assert.ok(state.eventSeq > state.events.length);
  assert.equal(state.events.at(-1).seq, state.eventSeq);
});
