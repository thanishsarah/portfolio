/** A modern, explicit Royal Game of Ur ruleset. Pure state, seeded casting, no services. */
export const UR_ROSETTES = Object.freeze([3, 7, 13]);
export const UR_ROLL_WEIGHTS = Object.freeze([1, 4, 6, 4, 1]);
export const UR_ROLL_PROBABILITIES = Object.freeze(
  UR_ROLL_WEIGHTS.map((weight) => weight / 16),
);
export const UR_PATHS = Object.freeze({
  human: Object.freeze(
    [
      [2, 3],
      [2, 2],
      [2, 1],
      [2, 0],
      ...Array.from({ length: 8 }, (_, i) => [1, i]),
      [2, 7],
      [2, 6],
    ].map(Object.freeze),
  ),
  archivist: Object.freeze(
    [
      [0, 3],
      [0, 2],
      [0, 1],
      [0, 0],
      ...Array.from({ length: 8 }, (_, i) => [1, i]),
      [0, 7],
      [0, 6],
    ].map(Object.freeze),
  ),
});
const opponent = (player) => (player === "human" ? "archivist" : "human");
const name = (player) => (player === "human" ? "You" : "The Archivist");
function record(state, text, type) {
  const event = { id: state.revision + 1, text, type };
  return {
    ...state,
    revision: state.revision + 1,
    events: [...state.events.slice(-39), event],
    message: text,
  };
}
export function createUrGame({ pieces = 3, seed = 1597334677 } = {}) {
  const count = pieces === 7 ? 7 : 3;
  return {
    version: 1,
    pieces: count,
    rng: (Number.isInteger(seed) ? seed >>> 0 : 1597334677) || 1597334677,
    turn: "human",
    phase: "roll",
    roll: null,
    dice: [],
    positions: {
      human: Array(count).fill(-1),
      archivist: Array(count).fill(-1),
    },
    winner: null,
    moves: 0,
    casts: 0,
    revision: 0,
    events: [],
    message:
      "Your turn. Cast four stones, then choose a highlighted destination.",
  };
}
export function getUrMoves(state) {
  if (
    state.winner ||
    state.phase !== "move" ||
    !Number.isInteger(state.roll) ||
    state.roll < 1 ||
    state.roll > 4
  )
    return [];
  const own = state.positions[state.turn],
    rival = state.positions[opponent(state.turn)];
  return own.flatMap((from, piece) => {
    if (from === 14) return [];
    const to = from < 0 ? state.roll - 1 : from + state.roll;
    if (to > 14 || (to < 14 && own.includes(to))) return [];
    const shared = to >= 4 && to <= 11;
    const capture = shared ? rival.indexOf(to) : -1;
    if (to === 7 && capture >= 0) return [];
    return [
      {
        piece,
        from,
        to,
        capture,
        rosette: UR_ROSETTES.includes(to),
        exit: to === 14,
      },
    ];
  });
}
export function rollUr(state) {
  if (state.phase !== "roll" || state.winner) return state;
  let rng = state.rng;
  const dice = Array.from({ length: 4 }, () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return rng & 1;
  });
  const total = dice.reduce((a, b) => a + b, 0);
  let next = {
    ...state,
    rng,
    dice,
    roll: total,
    casts: state.casts + 1,
    phase: "move",
  };
  const moves = getUrMoves(next);
  if (!moves.length) {
    next = { ...next, turn: opponent(state.turn), phase: "roll" };
    return record(
      next,
      `${name(state.turn)} cast ${total}. ${total === 0 ? "No movement." : "No legal destination."} ${state.turn === "human" ? "The Archivist goes next." : "Your turn."}`,
      "pass",
    );
  }
  return record(
    next,
    `${name(state.turn)} cast ${total}. ${state.turn === "human" ? "Choose a highlighted destination." : "The Archivist is considering a move."}`,
    "cast",
  );
}
export function moveUr(state, piece) {
  const move = getUrMoves(state).find((item) => item.piece === piece);
  if (!move) return state;
  const player = state.turn,
    other = opponent(player);
  const positions = {
    human: [...state.positions.human],
    archivist: [...state.positions.archivist],
  };
  positions[player][piece] = move.to;
  if (move.capture >= 0) positions[other][move.capture] = -1;
  const winner = positions[player].every((position) => position === 14)
    ? player
    : null;
  let text = move.exit
    ? `${name(player)} brought piece ${piece + 1} home.`
    : move.from < 0
      ? `${name(player)} entered piece ${piece + 1}.`
      : `${name(player)} advanced piece ${piece + 1} by ${state.roll}.`;
  if (move.capture >= 0)
    text += ` ${player === "human" ? "An Archivist piece" : "Your piece"} returned to the start.`;
  if (winner)
    text += ` ${player === "human" ? "You win the race." : "The Archivist wins this race."}`;
  else if (move.rosette) text += " Rosette: cast again.";
  else text += player === "human" ? " The Archivist goes next." : " Your turn.";
  return record(
    {
      ...state,
      positions,
      moves: state.moves + 1,
      phase: winner ? "finished" : "roll",
      winner,
      turn: winner || move.rosette ? player : other,
    },
    text,
    winner
      ? "win"
      : move.capture >= 0
        ? "capture"
        : move.rosette
          ? "rosette"
          : "move",
  );
}
/** Project a legal move without advancing dice, logs, or live state. */
function projectMove(state, move) {
  const player = state.turn;
  const other = opponent(player);
  const positions = {
    human: [...state.positions.human],
    archivist: [...state.positions.archivist],
  };
  positions[player][move.piece] = move.to;
  if (move.capture >= 0) positions[other][move.capture] = -1;
  const winner = positions[player].every((position) => position === 14)
    ? player
    : null;
  return {
    ...state,
    positions,
    phase: winner ? "finished" : "roll",
    winner,
    turn: winner || move.rosette ? player : other,
  };
}

function pieceValue(position) {
  if (position < 0) return 0;
  if (position === 14) return 46;
  // The private return court and protected central rosette preserve progress.
  return (position + 1) * 2 + (position >= 12 ? 3 : position === 7 ? 5 : 0);
}

function positionValue(state, player) {
  if (state.winner) return state.winner === player ? 10000 : -10000;
  const total = (owner) =>
    state.positions[owner].reduce(
      (sum, position) => sum + pieceValue(position),
      0,
    );
  return total(player) - total(opponent(player));
}

/**
 * The exact probability that the rival's next cast OFFERS a legal capture.
 * Each cast outcome is counted once, even if several rival pieces could move.
 * This describes exposure, not a prediction that the rival will choose it.
 */
function captureExposure(state, player, piece) {
  const position = state.positions[player][piece];
  if (state.winner || position < 4 || position > 11 || position === 7) {
    return { captureRisk: 0, captureWeight: 0, captureRolls: [] };
  }
  const captureRolls = [];
  let captureWeight = 0;
  for (let roll = 1; roll <= 4; roll += 1) {
    const response = {
      ...state,
      turn: opponent(player),
      phase: "move",
      roll,
    };
    if (getUrMoves(response).some((move) => move.capture === piece)) {
      captureRolls.push(roll);
      captureWeight += UR_ROLL_WEIGHTS[roll];
    }
  }
  return { captureRisk: captureWeight / 16, captureWeight, captureRolls };
}

/** One chance layer and one best legal reply; no live random value is inspected. */
function expectedReplyValue(state, player) {
  if (state.winner) return positionValue(state, player);
  let expected = 0;
  const maximizing = state.turn === player;
  for (let roll = 0; roll <= 4; roll += 1) {
    const response = { ...state, phase: "move", roll };
    const legal = getUrMoves(response);
    let best;
    if (!legal.length) {
      const nextTurn = opponent(state.turn);
      best = positionValue(state, player) + (nextTurn === player ? 1.5 : -1.5);
    } else {
      const values = legal.map((move) => {
        const after = projectMove(response, move);
        return (
          positionValue(after, player) +
          (after.winner ? 0 : after.turn === player ? 1.5 : -1.5)
        );
      });
      best = maximizing ? Math.max(...values) : Math.min(...values);
    }
    expected += UR_ROLL_PROBABILITIES[roll] * best;
  }
  return expected;
}

function moveDescription(state, move, exposure) {
  const effects = [];
  let reason;
  if (move.exit) {
    effects.push("Exact exit");
    const remaining = state.positions[state.turn].filter(
      (position) => position !== 14,
    ).length;
    reason =
      remaining === 1
        ? "Brings the final piece home and wins the race."
        : "Brings one piece safely home with an exact cast.";
  } else if (move.to === 7) {
    effects.push("Protected rosette", "Another cast");
    reason = "Claims the protected central rosette and earns another cast.";
  } else if (move.capture >= 0) {
    effects.push("Capture");
    reason = "Sends a rival piece back to its start.";
  } else if (move.rosette) {
    effects.push("Another cast");
    reason = "Lands on a rosette and earns another cast.";
  } else if (move.from < 0) {
    effects.push("Enter the race");
    reason = "Brings a new piece into play.";
  } else if (move.to >= 12) {
    effects.push("Private return court");
    reason =
      "Leaves the shared road for the safety of the private return court.";
  } else {
    effects.push(`Advance ${state.roll}`);
    reason = "Advances a piece toward home.";
  }
  if (exposure.captureWeight) {
    effects.push("Exposed on the road");
    reason += ` A rival's next cast offers a capture on ${exposure.captureWeight} of 16 equally likely stone patterns.`;
  }
  return { effects, reason };
}

/**
 * Rank legal choices with deterministic, inspectable reasoning.
 * Guide evaluates the immediate position; Strategist also weighs one best reply
 * for every possible next cast. Both use the same rules and casting sequence.
 */
export function analyseUrMoves(state, { difficulty = "strategist" } = {}) {
  const player = state.turn;
  const ranked = getUrMoves(state)
    .map((move) => {
      const after = projectMove(state, move);
      const exposure = captureExposure(after, player, move.piece);
      const immediate =
        positionValue(after, player) +
        (after.winner ? 0 : move.rosette ? 4 : 0) -
        exposure.captureRisk * (move.to + 1) * 1.5;
      const expected =
        difficulty === "guide" ? immediate : expectedReplyValue(after, player);
      const value = after.winner
        ? immediate
        : difficulty === "guide"
          ? immediate
          : immediate * 0.25 + expected * 0.75;
      return {
        ...move,
        ...exposure,
        ...moveDescription(state, move, exposure),
        value,
        expectedReplyValue: expected,
        difficulty: difficulty === "guide" ? "guide" : "strategist",
      };
    })
    .sort((a, b) => b.value - a.value || a.piece - b.piece);
  return ranked.map((move, index) => ({ ...move, recommended: index === 0 }));
}

export function explainUrMove(state, piece, options) {
  return (
    analyseUrMoves(state, options).find((move) => move.piece === piece) || null
  );
}

export function chooseUrMove(state, options) {
  return analyseUrMoves(state, options)[0] || null;
}
