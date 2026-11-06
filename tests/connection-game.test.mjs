import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONNECTION_PUZZLES, createConnectionGame, rotateMask,
  getConnectionStatus, rotateConnectionTile, getConnectionHint, hintConnectionGame,
} from '../src/connection-game.js';

function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

function solve(state) {
  return { ...state, tiles: state.tiles.map(tile => ({ ...tile, mask: tile.solutionMask })) };
}

test('three repeatable boards begin unsolved, keep destinations fixed, and contain a connected constructed solution', () => {
  const signatures = new Set();
  for (const { seed } of CONNECTION_PUZZLES) {
    const state = createConnectionGame(seed);
    assert.deepEqual(state, createConnectionGame(seed));
    assert.equal(state.tiles.length, 25);
    assert.equal(getConnectionStatus(state).connectedCount, 0);
    assert.equal(state.moves, 0);
    assert.equal(state.hintsUsed, 0);
    signatures.add(state.tiles.map(tile => tile.solutionMask).join(','));
    assert.ok(state.tiles.filter(tile => tile.rotatable && tile.mask !== tile.solutionMask).length >= 6);
    for (const id of [state.sourceId, ...state.terminals.map(terminal => terminal.id)]) {
      assert.equal(state.tiles[id].rotatable, false);
      assert.equal(state.tiles[id].mask, state.tiles[id].solutionMask);
    }
    const solution = solve(state), status = getConnectionStatus(solution);
    assert.equal(status.complete, true);
    assert.deepEqual(status.connectedTerminals, ['learning', 'communication', 'ai']);
    assert.equal(status.poweredIds.length, state.tiles.filter(tile => tile.solutionMask).length);
    // The pruned tree has one fewer edge than nodes: no ornamental loops or
    // disconnected branches masquerade as paths to a destination.
    assert.equal(status.links.length, status.poweredIds.length - 1);
  }
  assert.equal(signatures.size, CONNECTION_PUZZLES.length);
  assert.deepEqual(createConnectionGame(3), createConnectionGame(0));
  assert.deepEqual(createConnectionGame(-1), createConnectionGame(2));
  assert.deepEqual(createConnectionGame(NaN), createConnectionGame(0));
});

test('rotations follow cardinal ports, preserve path degree, and return to the same tile after four turns', () => {
  assert.equal(rotateMask(1), 2);
  assert.equal(rotateMask(2), 4);
  assert.equal(rotateMask(4), 8);
  assert.equal(rotateMask(8), 1);
  assert.equal(rotateMask(1, -1), 8);
  assert.equal(rotateMask(5, 2), 5);
  for (let mask = 0; mask <= 15; mask += 1) {
    assert.equal(rotateMask(mask, 4), mask);
    assert.equal(rotateMask(mask).toString(2).replaceAll('0', '').length, mask.toString(2).replaceAll('0', '').length);
  }
});

test('signal traversal requires reciprocal ports and cannot wrap across a board edge', () => {
  const state = createConnectionGame();
  state.tiles = state.tiles.map(tile => ({ ...tile, mask: 0 }));
  state.tiles[10].mask = 2;
  state.tiles[11].mask = 2;
  state.tiles[12].mask = 8;
  assert.deepEqual(getConnectionStatus(state).poweredIds, [10]);
  state.tiles[11].mask = 10;
  assert.deepEqual(getConnectionStatus(state).poweredIds, [10, 11, 12]);
  assert.equal(getConnectionStatus(state).links.length, 2);
  state.sourceId = 14;
  state.tiles[14].mask = 2;
  state.tiles[15].mask = 8;
  assert.deepEqual(getConnectionStatus(state).poweredIds, [14]);
  state.sourceId = 0;
  state.tiles[0].mask = 1;
  state.tiles[24].mask = 4;
  assert.deepEqual(getConnectionStatus(state).poweredIds, [0]);
});

test('turns and hint requests preserve frozen input and accurately account for assistance', () => {
  const state = freeze(createConnectionGame(1));
  const before = JSON.stringify(state), hint = getConnectionHint(state);
  const next = rotateConnectionTile(state, hint.tileId);
  assert.notStrictEqual(next, state);
  assert.equal(next.moves, 1);
  assert.equal(next.hintsUsed, 0);
  assert.equal(next.lastRotated, hint.tileId);
  assert.equal(next.lastHint, null);
  assert.equal(next.tiles[hint.tileId].mask, rotateMask(state.tiles[hint.tileId].mask));
  assert.equal(next.tiles.filter((tile, index) => tile !== state.tiles[index]).length, 1);
  const assisted = hintConnectionGame(state);
  assert.equal(assisted.moves, 1);
  assert.equal(assisted.hintsUsed, 1);
  assert.equal(assisted.lastHint, hint.tileId);
  assert.equal(JSON.stringify(state), before);
  for (const id of [-1, 25, 1.5, null, '11', state.sourceId, ...state.terminals.map(terminal => terminal.id)]) {
    assert.strictEqual(rotateConnectionTile(state, id), state);
  }
});

test('guided turns converge within the finite board budget even after arbitrary manual changes', () => {
  for (const { seed } of CONNECTION_PUZZLES) {
    let state = createConnectionGame(seed);
    // A fixed manual sequence models a visitor changing course mid-puzzle.
    for (let i = 0; i < 53; i += 1) state = rotateConnectionTile(state, (i * 7 + seed) % 25);
    const manualMoves = state.moves;
    let hints = 0;
    while (!getConnectionStatus(state).complete && hints < 75) {
      const hint = getConnectionHint(state);
      assert.ok(hint && state.tiles[hint.tileId].rotatable);
      assert.ok(hint.clockwiseTurns >= 1 && hint.clockwiseTurns <= 3);
      state = hintConnectionGame(freeze(state));
      hints += 1;
    }
    assert.equal(getConnectionStatus(state).complete, true);
    assert.ok(hints <= 3 * state.tiles.filter(tile => tile.rotatable).length);
    assert.equal(state.hintsUsed, hints);
    assert.equal(state.moves, manualMoves + hints);
  }
});

test('victory freezes the board and fresh creation resets progress without changing the puzzle', () => {
  const initial = createConnectionGame(2);
  const complete = freeze({ ...solve(initial), moves: 41, hintsUsed: 2 });
  const rotatable = complete.tiles.find(tile => tile.rotatable);
  assert.strictEqual(rotateConnectionTile(complete, rotatable.id), complete);
  assert.strictEqual(hintConnectionGame(complete), complete);
  assert.equal(getConnectionHint(complete), null);
  assert.deepEqual(createConnectionGame(complete.seed), initial);
  assert.equal(createConnectionGame(complete.seed + 1).seed, 0);
});
