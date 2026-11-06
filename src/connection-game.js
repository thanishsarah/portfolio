/**
 * The Connection Game: a deterministic, turn-based path puzzle.
 *
 * Ports are bit masks in clockwise order: north 1, east 2, south 4,
 * west 8. A link carries a signal only when both neighbouring tiles
 * expose a matching port. The source and three destinations stay fixed.
 * Boards come from seeded spanning trees, pruned to the three source-to-
 * destination paths, so every scrambled puzzle has a constructed solution.
 * All commands return new plain state; no clock, storage, or randomness
 * outside the seeded generator participates in a game.
 */

export const CONNECTION_SIZE = 5;
export const CONNECTION_PORTS = Object.freeze({ north: 1, east: 2, south: 4, west: 8 });
export const CONNECTION_PUZZLES = Object.freeze([
  Object.freeze({ seed: 0, title: 'Shared ground' }),
  Object.freeze({ seed: 1, title: 'A different perspective' }),
  Object.freeze({ seed: 2, title: 'The wider connection' }),
]);

const SOURCE_ID = 10;
const TERMINALS = Object.freeze([
  Object.freeze({ id: 4, key: 'learning', label: 'Learning' }),
  Object.freeze({ id: 14, key: 'communication', label: 'Communication' }),
  Object.freeze({ id: 24, key: 'ai', label: 'AI' }),
]);
const DIRECTIONS = Object.freeze([
  Object.freeze({ row: -1, col: 0, port: 1, opposite: 4 }),
  Object.freeze({ row: 0, col: 1, port: 2, opposite: 8 }),
  Object.freeze({ row: 1, col: 0, port: 4, opposite: 1 }),
  Object.freeze({ row: 0, col: -1, port: 8, opposite: 2 }),
]);

function normaliseSeed(seed) {
  return Number.isInteger(seed) ? ((seed % CONNECTION_PUZZLES.length) + CONNECTION_PUZZLES.length) % CONNECTION_PUZZLES.length : 0;
}

function seededRandom(seed) {
  let value = (0x7f4a7c15 ^ Math.imul(seed + 1, 0x9e3779b1)) >>> 0;
  return () => {
    value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
    return (value >>> 0) / 0x100000000;
  };
}

function neighbours(id) {
  const row = Math.floor(id / CONNECTION_SIZE), col = id % CONNECTION_SIZE;
  return DIRECTIONS.flatMap(direction => {
    const nextRow = row + direction.row, nextCol = col + direction.col;
    return nextRow < 0 || nextRow >= CONNECTION_SIZE || nextCol < 0 || nextCol >= CONNECTION_SIZE
      ? [] : [{ id: nextRow * CONNECTION_SIZE + nextCol, ...direction }];
  });
}

/** Rotate a port mask clockwise; negative turns rotate anticlockwise. */
export function rotateMask(mask, turns = 1) {
  let result = Number.isInteger(mask) ? mask & 15 : 0;
  const count = Number.isInteger(turns) ? ((turns % 4) + 4) % 4 : 0;
  for (let i = 0; i < count; i += 1) result = ((result << 1) & 15) | (result >>> 3);
  return result;
}

function buildSolution(seed, random) {
  const fixed = new Set([SOURCE_ID, ...TERMINALS.map(terminal => terminal.id)]);
  // Keep each fixed tile a leaf with a horizontal connection. Growing the
  // tree across the remaining cells guarantees those fixed ports are valid.
  const parents = new Map([[11, SOURCE_ID]]);
  const stack = [11];
  while (stack.length) {
    const current = stack.at(-1);
    const choices = neighbours(current).filter(next => !fixed.has(next.id) && !parents.has(next.id));
    if (!choices.length) { stack.pop(); continue; }
    const next = choices[Math.floor(random() * choices.length)].id;
    parents.set(next, current); stack.push(next);
  }
  for (const terminal of TERMINALS) parents.set(terminal.id, terminal.id - 1);

  const masks = Array(CONNECTION_SIZE * CONNECTION_SIZE).fill(0);
  for (const terminal of TERMINALS) {
    let current = terminal.id;
    while (current !== SOURCE_ID) {
      const parent = parents.get(current);
      if (parent === undefined) throw new Error(`Unreachable puzzle destination in board ${seed}`);
      const direction = neighbours(current).find(next => next.id === parent);
      masks[current] |= direction.port; masks[parent] |= direction.opposite;
      current = parent;
    }
  }
  return masks;
}

/** Create one of three repeatable, solvable boards. Seeds wrap around. */
export function createConnectionGame(seed = 0) {
  const puzzleSeed = normaliseSeed(seed), random = seededRandom(puzzleSeed);
  const solution = buildSolution(puzzleSeed, random);
  const terminals = TERMINALS.map(terminal => ({ ...terminal }));
  const tiles = solution.map((solutionMask, id) => {
    const terminal = terminals.find(item => item.id === id);
    const kind = id === SOURCE_ID ? 'source' : terminal ? 'terminal' : solutionMask ? 'path' : 'empty';
    const rotatable = kind === 'path' && solutionMask !== 15;
    const differentTurns = [1, 2, 3].filter(turns => rotateMask(solutionMask, turns) !== solutionMask);
    const mask = rotatable ? rotateMask(solutionMask, differentTurns[Math.floor(random() * differentTurns.length)]) : solutionMask;
    return { id, row: Math.floor(id / CONNECTION_SIZE), col: id % CONNECTION_SIZE, mask, solutionMask, kind, rotatable };
  });
  return { version: 1, seed: puzzleSeed, size: CONNECTION_SIZE, sourceId: SOURCE_ID, terminals, tiles, moves: 0, hintsUsed: 0, lastRotated: null, lastHint: null };
}

/** Breadth-first traversal powers only mutual, connected ports. */
export function getConnectionStatus(state) {
  const powered = new Set([state.sourceId]), queue = [state.sourceId];
  const links = [];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor], tile = state.tiles[id];
    for (const neighbour of neighbours(id)) {
      if (!(tile.mask & neighbour.port) || !(state.tiles[neighbour.id].mask & neighbour.opposite)) continue;
      if (id < neighbour.id) links.push({ from: id, to: neighbour.id });
      if (!powered.has(neighbour.id)) { powered.add(neighbour.id); queue.push(neighbour.id); }
    }
  }
  const connectedTerminals = state.terminals.filter(terminal => powered.has(terminal.id)).map(terminal => terminal.key);
  return {
    poweredIds: [...powered].sort((a, b) => a - b), links,
    connectedTerminals, connectedCount: connectedTerminals.length,
    complete: connectedTerminals.length === state.terminals.length,
  };
}

/** Make one clockwise turn. Fixed tiles and completed games do not change. */
export function rotateConnectionTile(state, tileId) {
  if (!Number.isInteger(tileId) || !state.tiles[tileId]?.rotatable || getConnectionStatus(state).complete) return state;
  return {
    ...state, tiles: state.tiles.map(tile => tile.id === tileId ? { ...tile, mask: rotateMask(tile.mask) } : tile),
    moves: state.moves + 1, lastRotated: tileId, lastHint: null,
  };
}

/**
 * Find the first displaced tile along the constructed source paths.
 * A hint is transparent, deterministic guidance, rather than an AI claim.
 * Repeated hints converge to a solved board in at most three turns per tile.
 */
export function getConnectionHint(state) {
  if (getConnectionStatus(state).complete) return null;
  const visited = new Set([state.sourceId]), queue = [state.sourceId];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const tile = state.tiles[queue[cursor]];
    if (tile.rotatable && tile.mask !== tile.solutionMask) {
      const clockwiseTurns = [1, 2, 3].find(turns => rotateMask(tile.mask, turns) === tile.solutionMask);
      return { tileId: tile.id, clockwiseTurns, direction: 'clockwise' };
    }
    for (const neighbour of neighbours(tile.id)) {
      if (!(tile.solutionMask & neighbour.port) || !(state.tiles[neighbour.id].solutionMask & neighbour.opposite) || visited.has(neighbour.id)) continue;
      visited.add(neighbour.id); queue.push(neighbour.id);
    }
  }
  return null;
}

/** Apply one guided quarter-turn; it counts as both a move and a hint. */
export function hintConnectionGame(state) {
  const hint = getConnectionHint(state);
  if (!hint) return state;
  const next = rotateConnectionTile(state, hint.tileId);
  return { ...next, hintsUsed: state.hintsUsed + 1, lastHint: hint.tileId };
}
