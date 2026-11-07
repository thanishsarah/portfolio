import test from "node:test";
import assert from "node:assert/strict";
import {
  createUrGame,
  getUrMoves,
  rollUr,
  moveUr,
  chooseUrMove,
  analyseUrMoves,
  explainUrMove,
  UR_PATHS,
  UR_ROLL_WEIGHTS,
  UR_ROLL_PROBABILITIES,
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
  for (const difficulty of ["guide", "strategist"])
    for (const pieces of [3, 7])
      for (const seed of [1, 42, 1597]) {
        let state = createUrGame({ pieces, seed });
        let commands = 0;
        while (!state.winner && commands++ < 6000) {
          if (state.phase === "roll") state = rollUr(state);
          else {
            const move = chooseUrMove(state, { difficulty });
            assert.ok(move);
            state = moveUr(state, move.piece);
          }
          for (const list of Object.values(state.positions))
            assert.ok(
              list.every((position) => position >= -1 && position <= 14),
            );
          assert.ok(state.events.length <= 40);
        }
        assert.ok(state.winner, `${pieces} pieces, seed ${seed}`);
        assert.ok(
          state.positions[state.winner].every((position) => position === 14),
        );
      }
});

test("four-stone probabilities enumerate all sixteen equally likely binary patterns", () => {
  const counts = Array(5).fill(0);
  for (let pattern = 0; pattern < 16; pattern += 1) {
    let marked = 0;
    for (let stone = 0; stone < 4; stone += 1)
      marked += (pattern >>> stone) & 1;
    counts[marked] += 1;
  }
  assert.deepEqual([...UR_ROLL_WEIGHTS], counts);
  assert.deepEqual(
    [...UR_ROLL_PROBABILITIES],
    counts.map((count) => count / 16),
  );
  assert.equal(
    UR_ROLL_PROBABILITIES.reduce((sum, chance) => sum + chance, 0),
    1,
  );
});

test("zero and blocked positive casts pass the turn without moving any piece", () => {
  for (const turn of ["human", "archivist"]) {
    const fresh = { ...createUrGame({ seed: 2 }), turn };
    const zero = rollUr(freeze(fresh));
    assert.equal(zero.roll, 0);
    assert.equal(zero.phase, "roll");
    assert.notEqual(zero.turn, turn);
    assert.deepEqual(zero.positions, fresh.positions);
    assert.equal(zero.events.at(-1).type, "pass");

    const blocked = createUrGame({ seed: 16 });
    blocked.turn = turn;
    blocked.positions[turn] = [13, 14, 14];
    const next = rollUr(freeze(blocked));
    assert.equal(next.roll, 2);
    assert.equal(next.phase, "roll");
    assert.notEqual(next.turn, turn);
    assert.deepEqual(next.positions, blocked.positions);
    assert.match(next.message, /No legal destination/);
  }
});

test("move exposure is the exact union of legal capture casts, including protected and private squares", () => {
  const exposed = explainUrMove(ready([7, 12, 14], [4, 5, 6], 1), 0);
  assert.equal(exposed.captureWeight, 11);
  assert.equal(exposed.captureRisk, 11 / 16);
  assert.deepEqual(exposed.captureRolls, [2, 3, 4]);
  assert.match(exposed.reason, /offers a capture on 11 of 16/);
  assert.ok(exposed.effects.includes("Exposed on the road"));

  const protectedMove = explainUrMove(ready([6, 12, 14], [2, 4, 5], 1), 0);
  assert.equal(protectedMove.to, 7);
  assert.equal(protectedMove.captureRisk, 0);
  assert.ok(protectedMove.effects.includes("Protected rosette"));
  assert.ok(protectedMove.effects.includes("Another cast"));
  const privateMove = explainUrMove(ready([11, 14, 14], [8, 9, 10], 1), 0);
  assert.equal(privateMove.to, 12);
  assert.equal(privateMove.captureRisk, 0);
});

test("analysis is deterministic, RNG-blind, immutable, and explains only legal choices", () => {
  const state = freeze(ready([4, 12, -1], [6, 10, -1], 2));
  const original = JSON.stringify(state);
  for (const difficulty of ["guide", "strategist"]) {
    const analysis = analyseUrMoves(state, { difficulty });
    assert.equal(analysis.length, getUrMoves(state).length);
    assert.equal(analysis.filter((move) => move.recommended).length, 1);
    assert.ok(analysis.every((move) => Number.isFinite(move.value)));
    assert.ok(
      analysis.every(
        (move) => typeof move.reason === "string" && move.reason.length,
      ),
    );
    assert.ok(
      analysis.every((move) =>
        move.effects.every((effect) => typeof effect === "string"),
      ),
    );
    const otherRandomState = {
      ...state,
      rng: 987654321,
      dice: [1, 1, 1, 1],
      events: [],
      revision: 999,
    };
    assert.deepEqual(
      analyseUrMoves(otherRandomState, { difficulty }),
      analysis,
    );
    assert.deepEqual(chooseUrMove(state, { difficulty }), analysis[0]);
  }
  assert.equal(JSON.stringify(state), original);
  assert.equal(explainUrMove(state, 99), null);
  assert.deepEqual(analyseUrMoves({ ...state, winner: "human" }), []);
});

test("the strategist weighs the next cast instead of merely selecting the strongest immediate position", () => {
  const state = ready([7, 3, 1], [4, -1, -1], 2, "archivist");
  assert.equal(chooseUrMove(state, { difficulty: "guide" }).piece, 1);
  const strategic = analyseUrMoves(state);
  assert.equal(strategic[0].piece, 0);
  assert.ok(strategic[0].expectedReplyValue > strategic[1].expectedReplyValue);
  assert.equal(strategic[0].captureRisk, 4 / 16);
});

test("rosette lookahead includes same-player continuation, zero, and blocked cast outcomes", () => {
  const state = ready([12, 14, 14], [14, 14, -1], 1);
  const move = explainUrMove(state, 0);
  assert.equal(move.to, 13);
  assert.equal(move.rosette, true);
  // A marked total of one wins (4/16); all other casts pass with the board
  // unchanged (12/16). This is a chance-weighted outlook, not a forced win.
  assert.equal(move.expectedReplyValue, (4 / 16) * 10000 + (12 / 16) * 29.5);
});

test("recommendations and scores remain symmetric when the two players swap places", () => {
  const state = ready([1, 6, 12], [4, 9, -1], 1);
  const mirror = {
    ...state,
    turn: "archivist",
    positions: {
      human: state.positions.archivist,
      archivist: state.positions.human,
    },
  };
  for (const difficulty of ["guide", "strategist"]) {
    assert.deepEqual(
      analyseUrMoves(state, { difficulty }),
      analyseUrMoves(mirror, { difficulty }),
    );
  }
});

test("seeded casting frequencies follow the four-stone distribution without turn-based bias", () => {
  const samples = 32000;
  const counts = Array(5).fill(0);
  let state = createUrGame({ seed: 78314 });
  for (let cast = 0; cast < samples; cast += 1) {
    state = rollUr({ ...state, phase: "roll" });
    counts[state.roll] += 1;
  }
  for (let roll = 0; roll <= 4; roll += 1) {
    assert.ok(
      Math.abs(counts[roll] / samples - UR_ROLL_PROBABILITIES[roll]) < 0.01,
    );
  }
});
