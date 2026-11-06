import test from "node:test";
import assert from "node:assert/strict";
import {
  createUrGame,
  getUrMoves,
  rollUr,
  moveUr,
  chooseUrMove,
  UR_PATHS,
  UR_ROLL_WEIGHTS,
} from "../src/ur-game.js";
function ready(human, archivist, roll, turn = "human") {
  const state = createUrGame({ pieces: 3 });
  return {
    ...state,
    positions: { human, archivist },
    roll,
    phase: "move",
    turn,
  };
}
function freeze(value) {
  Object.freeze(value);
  for (const item of Object.values(value))
    if (item && typeof item === "object" && !Object.isFrozen(item))
      freeze(item);
  return value;
}
test("the two routes share exactly the eight road squares and use twenty physical squares", () => {
  const human = UR_PATHS.human.map((cell) => cell.join(",")),
    ai = UR_PATHS.archivist.map((cell) => cell.join(","));
  assert.equal(new Set([...human, ...ai]).size, 20);
  assert.equal(human.filter((cell) => ai.includes(cell)).length, 8);
  assert.equal(
    UR_ROLL_WEIGHTS.reduce((a, b) => a + b),
    16,
  );
});
test("casting is deterministic, has four binary stones, and respects the phase", () => {
  let a = createUrGame({ seed: 17 }),
    b = createUrGame({ seed: 17 });
  a = rollUr(a);
  b = rollUr(b);
  assert.deepEqual(a, b);
  assert.equal(a.dice.length, 4);
  assert.ok(a.dice.every((bit) => bit === 0 || bit === 1));
  assert.equal(
    a.roll,
    a.dice.reduce((x, y) => x + y),
  );
  if (a.phase === "move") assert.equal(rollUr(a), a);
});
test("entry, own blocking, exact exit and fixed finished pieces follow the explicit rules", () => {
  const state = ready([0, -1, 14], [-1, -1, -1], 1);
  assert.deepEqual(
    getUrMoves(state).map((move) => move.piece),
    [0],
  );
  assert.equal(
    getUrMoves(ready([13, -1, -1], [-1, -1, -1], 2)).some(
      (move) => move.piece === 0,
    ),
    false,
  );
  const exit = moveUr(ready([13, 14, 14], [-1, -1, -1], 1), 0);
  assert.equal(exit.winner, "human");
  assert.equal(exit.phase, "finished");
  assert.equal(moveUr(exit, 0), exit);
});
test("a shared-road capture returns the rival to start, but its central rosette is protected", () => {
  const state = ready([4, -1, -1], [6, -1, -1], 2);
  const next = moveUr(state, 0);
  assert.equal(next.positions.human[0], 6);
  assert.equal(next.positions.archivist[0], -1);
  assert.equal(next.turn, "archivist");
  assert.equal(
    getUrMoves(ready([5, -1, -1], [7, -1, -1], 2)).some(
      (move) => move.piece === 0,
    ),
    false,
  );
});
test("private positions do not capture and rosettes grant an additional cast", () => {
  const state = ready([2, -1, -1], [3, -1, -1], 1);
  const next = moveUr(state, 0);
  assert.equal(next.positions.archivist[0], 3);
  assert.equal(next.turn, "human");
  assert.equal(next.phase, "roll");
  assert.equal(next.events.at(-1).type, "rosette");
});
test("commands preserve frozen state and the opponent chooses only legal moves", () => {
  const state = freeze(ready([4, -1, -1], [6, -1, -1], 2));
  const next = moveUr(state, 0);
  assert.notEqual(next, state);
  assert.deepEqual(state.positions.human, [4, -1, -1]);
  const choice = chooseUrMove(state);
  assert.ok(getUrMoves(state).some((move) => move.piece === choice.piece));
  assert.equal(choice.piece, 0);
  assert.equal(moveUr(state, 99), state);
});
test("seeded complete races reach a winner and all positions remain bounded", () => {
  for (const pieces of [3, 7])
    for (const seed of [1, 42, 1597]) {
      let state = createUrGame({ pieces, seed });
      let commands = 0;
      while (!state.winner && commands++ < 6000) {
        if (state.phase === "roll") state = rollUr(state);
        else {
          const move = chooseUrMove(state);
          assert.ok(move);
          state = moveUr(state, move.piece);
        }
        for (const list of Object.values(state.positions))
          assert.ok(list.every((position) => position >= -1 && position <= 14));
        assert.ok(state.events.length <= 40);
      }
      assert.ok(state.winner, `${pieces} pieces, seed ${seed}`);
      assert.ok(
        state.positions[state.winner].every((position) => position === 14),
      );
    }
});
