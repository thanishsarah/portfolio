/** A modern, explicit Royal Game of Ur ruleset. Pure state, seeded casting, no services. */
export const UR_ROSETTES = Object.freeze([3, 7, 13]);
export const UR_ROLL_WEIGHTS = Object.freeze([1, 4, 6, 4, 1]);
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
/** Transparent heuristic: progress, capture, exact exit, extra turns, and weighted capture risk. */
export function chooseUrMove(state) {
  const legal = getUrMoves(state);
  const rival = state.positions[opponent(state.turn)];
  function value(move) {
    let score = move.exit
      ? 35
      : (move.to - (move.from < 0 ? -1 : move.from)) * 2;
    if (move.capture >= 0) score += 18 + (move.to + 1) * 1.15;
    if (move.rosette) score += 12;
    if (move.from < 0) score += 3;
    if (move.to >= 4 && move.to <= 11 && move.to !== 7) {
      let risk = 0;
      for (const position of rival) {
        const distance = move.to - position;
        if (position >= 0 && position < 14 && distance >= 1 && distance <= 4)
          risk += UR_ROLL_WEIGHTS[distance] / 16;
      }
      score -= Math.min(1, risk) * (move.to + 1) * 1.8;
    }
    return score;
  }
  return (
    legal
      .map((move) => ({ ...move, value: value(move) }))
      .sort((a, b) => b.value - a.value || a.piece - b.piece)[0] || null
  );
}
