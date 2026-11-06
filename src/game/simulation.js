export const WORLD = Object.freeze({
  minX: -1400, maxX: 1400, minY: -1000, maxY: 1000,
  width: 2800, height: 2000,
  blackHole: Object.freeze({ x: 0, y: 0, radius: 96, mu: 4.2e6, softening: 70 }),
  dock: Object.freeze({ id: 'observatory', name: 'Observatory', x: -920, y: 510, radius: 100 }),
  maxSpeed: 260, thrust: 170, scanSpeed: 55, scanTime: 1.5,
  navigationRadius: 300,
});

export const STATIONS = Object.freeze([
  Object.freeze({ id: 'learning', name: 'Learning Array', x: -820, y: 130, radius: 95, color: '#63f5d4', caseIds: Object.freeze(['media-shala']) }),
  Object.freeze({ id: 'communication', name: 'Communication Beacon', x: 620, y: -420, radius: 95, color: '#ffad8f', caseIds: Object.freeze(['kedman-global', 'paryavaran-baal-sansad']) }),
  Object.freeze({ id: 'ai', name: 'Intelligence Relay', x: 740, y: 440, radius: 95, color: '#ae93ff', caseIds: Object.freeze(['ai-literacy']) }),
]);

const ALL_TARGETS = [...STATIONS, WORLD.dock];
const EVENT_LIMIT = 40;
const ROUTE_CLEARANCE = 320;
const WAYPOINT_RADIUS = 390;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const finite = value => Number.isFinite(value);
const targetFor = id => ALL_TARGETS.find(target => target.id === id) || STATIONS[0];

function gravityAt(ship) {
  const dx = ship.x - WORLD.blackHole.x;
  const dy = ship.y - WORLD.blackHole.y;
  const denominator = (dx * dx + dy * dy + WORLD.blackHole.softening ** 2) ** 1.5;
  return { x: -WORLD.blackHole.mu * dx / denominator, y: -WORLD.blackHole.mu * dy / denominator };
}

function segmentClearance(from, to) {
  const dx = to.x - from.x; const dy = to.y - from.y;
  const denominator = dx * dx + dy * dy;
  const t = denominator ? clamp(-(from.x * dx + from.y * dy) / denominator, 0, 1) : 0;
  return Math.hypot(from.x + t * dx, from.y + t * dy);
}

/** Visibility graph + Dijkstra around a conservative navigation exclusion circle.
 * Returns future waypoints and the destination, excluding the starting point.
 * The central exclusion is gameplay guidance, not a relativistic calculation.
 */
export function planRoute(from, target) {
  if (!from || !target || ![from.x, from.y, target.x, target.y].every(finite)) return [];
  const start = { x: from.x, y: from.y };
  const goal = { x: target.x, y: target.y };
  if (Math.hypot(goal.x, goal.y) < ROUTE_CLEARANCE) return [];
  if (distance(start, goal) < 1) return [goal];
  // A pilot already inside the exclusion zone first burns radially outward.
  if (Math.hypot(start.x, start.y) < ROUTE_CLEARANCE + 1) {
    const angle = Math.atan2(start.y || 0, start.x || 1);
    const escape = { x: Math.cos(angle) * (WAYPOINT_RADIUS + 35), y: Math.sin(angle) * (WAYPOINT_RADIUS + 35) };
    return [escape, ...planRoute(escape, goal)];
  }
  if (Math.hypot(goal.x, goal.y) < ROUTE_CLEARANCE) return [];
  if (segmentClearance(start, goal) >= ROUTE_CLEARANCE) return [goal];
  const nodes = [start, goal];
  for (let index = 0; index < 24; index += 1) {
    const angle = index * Math.PI * 2 / 24;
    nodes.push({ x: Math.cos(angle) * WAYPOINT_RADIUS, y: Math.sin(angle) * WAYPOINT_RADIUS });
  }
  const costs = Array(nodes.length).fill(Infinity);
  const previous = Array(nodes.length).fill(-1);
  const visited = Array(nodes.length).fill(false);
  costs[0] = 0;
  for (let step = 0; step < nodes.length; step += 1) {
    let current = -1;
    for (let index = 0; index < nodes.length; index += 1) if (!visited[index] && (current === -1 || costs[index] < costs[current])) current = index;
    if (current === -1 || !finite(costs[current])) break;
    if (current === 1) break;
    visited[current] = true;
    for (let next = 0; next < nodes.length; next += 1) {
      if (visited[next] || next === current || segmentClearance(nodes[current], nodes[next]) < ROUTE_CLEARANCE - 1e-6) continue;
      const cost = costs[current] + distance(nodes[current], nodes[next]);
      if (cost < costs[next]) { costs[next] = cost; previous[next] = current; }
    }
  }
  if (!finite(costs[1])) return [];
  const path = [];
  for (let cursor = 1; cursor > 0; cursor = previous[cursor]) {
    if (cursor < 0) return [];
    path.push({ ...nodes[cursor] });
  }
  return path.reverse();
}

function addEvent(state, type, stationId) {
  const event = { seq: state.eventSeq + 1, type, ...(stationId ? { stationId } : {}) };
  return { ...state, eventSeq: event.seq, events: [...state.events, event].slice(-EVENT_LIMIT), lastEvent: event };
}

function scoreFor(state) { return Math.max(0, state.recovered.length * 100 - state.recoveries * 10); }

export function createGame() {
  const ship = { x: WORLD.dock.x, y: WORLD.dock.y, vx: 0, vy: 0, angle: -Math.PI / 2 };
  return {
    phase: 'ready', ship, time: 0, recovered: [], scanProgress: 0, scanTarget: null,
    targetId: STATIONS[0].id, guidance: false, route: planRoute(ship, STATIONS[0]),
    recoveries: 0, score: 0, events: [], eventSeq: 0, lastEvent: null,
    lastCheckpoint: { id: WORLD.dock.id, x: WORLD.dock.x, y: WORLD.dock.y },
  };
}

export function gameCommand(state, command) {
  if (!state || !command) return state;
  switch (command.type) {
    case 'START':
      return state.phase === 'ready' ? addEvent({ ...state, phase: 'playing', route: planRoute(state.ship, targetFor(state.targetId)) }, 'start') : state;
    case 'PAUSE': return state.phase === 'playing' ? { ...state, phase: 'paused' } : state;
    case 'RESUME': return state.phase === 'paused' ? { ...state, phase: 'playing' } : state;
    case 'RESTART': return createGame();
    case 'RESPAWN': {
      if (state.phase !== 'captured') return state;
      const safe = state.lastCheckpoint || WORLD.dock;
      const ship = { x: safe.x, y: safe.y, vx: 0, vy: 0, angle: -Math.PI / 2 };
      const next = { ...state, phase: 'playing', ship, guidance: false, recoveries: state.recoveries + 1, scanProgress: 0, scanTarget: null, route: planRoute(ship, targetFor(state.targetId)) };
      next.score = scoreFor(next);
      return addEvent(next, 'respawn');
    }
    case 'SELECT_TARGET': {
      const target = ALL_TARGETS.find(item => item.id === command.id);
      if (!target || state.phase === 'captured' || state.phase === 'complete') return state;
      return { ...state, targetId: target.id, scanProgress: 0, scanTarget: null, route: planRoute(state.ship, target) };
    }
    case 'TOGGLE_GUIDANCE':
      if (state.phase === 'captured' || state.phase === 'complete') return state;
      return addEvent({ ...state, guidance: !state.guidance, route: planRoute(state.ship, targetFor(state.targetId)), scanProgress: 0, scanTarget: null }, state.guidance ? 'manual' : 'guidance');
    default: return state;
  }
}

function integrate(ship, acceleration, dt) {
  let vx = (ship.vx + acceleration.x * dt) * Math.exp(-.012 * dt);
  let vy = (ship.vy + acceleration.y * dt) * Math.exp(-.012 * dt);
  const speed = Math.hypot(vx, vy);
  if (speed > WORLD.maxSpeed) { vx *= WORLD.maxSpeed / speed; vy *= WORLD.maxSpeed / speed; }
  let x = ship.x + vx * dt; let y = ship.y + vy * dt;
  if (x < WORLD.minX || x > WORLD.maxX) { x = clamp(x, WORLD.minX, WORLD.maxX); vx *= -.35; }
  if (y < WORLD.minY || y > WORLD.maxY) { y = clamp(y, WORLD.minY, WORLD.maxY); vy *= -.35; }
  return { x, y, vx, vy, angle: Math.hypot(vx, vy) > 2 ? Math.atan2(vy, vx) : ship.angle };
}

function limitVector(x, y, maximum) {
  const magnitude = Math.hypot(x, y);
  const scale = magnitude > maximum ? maximum / magnitude : 1;
  return { x: x * scale, y: y * scale };
}

function scanCandidate(state, ship) {
  const candidates = STATIONS.filter(station => !state.recovered.includes(station.id) && distance(ship, station) <= station.radius);
  if (state.guidance) return candidates.find(station => station.id === state.targetId) || null;
  return candidates.sort((a, b) => distance(ship, a) - distance(ship, b))[0] || null;
}

export function stepGame(state, input = {}, dt = 1 / 120) {
  if (!state || state.phase !== 'playing' || !finite(dt) || dt <= 0) return state;
  input = input && typeof input === 'object' ? input : {};
  dt = Math.min(dt, 1 / 30);
  const rawX = finite(input.thrustX) ? clamp(input.thrustX, -1, 1) : 0;
  const rawY = finite(input.thrustY) ? clamp(input.thrustY, -1, 1) : 0;
  const manual = Math.hypot(rawX, rawY) > .03 || input.brake === true;
  let next = state;
  if (manual && state.guidance) next = addEvent({ ...state, guidance: false, route: [] }, 'manual');
  const gravity = gravityAt(next.ship);
  let route = next.route;
  let thrust;
  if (next.guidance) {
    if (!route.length) route = planRoute(next.ship, targetFor(next.targetId));
    while (route.length > 1 && distance(next.ship, route[0]) < 60) route = route.slice(1);
    const destination = route[0] || targetFor(next.targetId);
    const dx = destination.x - next.ship.x; const dy = destination.y - next.ship.y;
    const remaining = Math.hypot(dx, dy);
    const cruise = Math.hypot(next.ship.x, next.ship.y) < 650 ? 135 : 200;
    const desiredSpeed = Math.min(cruise, remaining * 1.1);
    const desiredX = remaining > .1 ? dx / remaining * desiredSpeed : 0;
    const desiredY = remaining > .1 ? dy / remaining * desiredSpeed : 0;
    thrust = limitVector((desiredX - next.ship.vx) * 2.8 - gravity.x, (desiredY - next.ship.vy) * 2.8 - gravity.y, WORLD.thrust);
  } else if (input.brake === true) {
    thrust = limitVector(-next.ship.vx * 5 - gravity.x, -next.ship.vy * 5 - gravity.y, WORLD.thrust);
  } else {
    thrust = limitVector(rawX, rawY, 1);
    thrust.x *= WORLD.thrust; thrust.y *= WORLD.thrust;
  }
  const ship = integrate(next.ship, { x: gravity.x + thrust.x, y: gravity.y + thrust.y }, dt);
  next = { ...next, ship, route, time: next.time + dt };
  if (Math.hypot(ship.x - WORLD.blackHole.x, ship.y - WORLD.blackHole.y) <= WORLD.blackHole.radius) {
    return addEvent({ ...next, phase: 'captured', guidance: false, scanProgress: 0, scanTarget: null, route: [] }, 'captured');
  }
  const speed = Math.hypot(ship.vx, ship.vy);
  const candidate = scanCandidate(next, ship);
  if (candidate && speed < WORLD.scanSpeed && (input.scan === true || next.guidance)) {
    const scanProgress = (next.scanTarget === candidate.id ? next.scanProgress : 0) + dt / WORLD.scanTime;
    next = { ...next, scanTarget: candidate.id, scanProgress: Math.min(1, scanProgress) };
    if (scanProgress >= 1 - 1e-9) {
      const recovered = [...next.recovered, candidate.id];
      const target = STATIONS.find(station => !recovered.includes(station.id)) || WORLD.dock;
      next = { ...next, recovered, targetId: target.id, scanProgress: 0, scanTarget: null, lastCheckpoint: { id: candidate.id, x: candidate.x, y: candidate.y }, route: planRoute(ship, target) };
      next.score = scoreFor(next);
      next = addEvent(next, 'signal', candidate.id);
    }
  } else if (next.scanProgress || next.scanTarget) next = { ...next, scanProgress: 0, scanTarget: null };
  if (next.recovered.length === STATIONS.length && distance(ship, WORLD.dock) <= WORLD.dock.radius && speed < WORLD.scanSpeed) {
    return addEvent({ ...next, phase: 'complete', ship: { ...ship, vx: 0, vy: 0 }, guidance: false, route: [], scanProgress: 0, scanTarget: null, lastCheckpoint: { id: WORLD.dock.id, x: WORLD.dock.x, y: WORLD.dock.y } }, 'complete');
  }
  // A deliberate return to an already recovered station holds there rather than looping.
  const selected = targetFor(next.targetId);
  if (next.guidance && next.recovered.includes(selected.id) && distance(ship, selected) < selected.radius && speed < WORLD.scanSpeed) next = { ...next, guidance: false };
  return next;
}

export function predictTrajectory(state, seconds = 6) {
  if (!state?.ship || !finite(seconds) || seconds <= 0) return [];
  let ship = { ...state.ship };
  const points = [{ x: ship.x, y: ship.y }];
  const steps = Math.ceil(Math.min(seconds, 12) * 60);
  for (let index = 0; index < steps; index += 1) {
    ship = integrate(ship, gravityAt(ship), 1 / 60);
    if (index % 6 === 5 || index === steps - 1) points.push({ x: ship.x, y: ship.y });
    if (Math.hypot(ship.x, ship.y) <= WORLD.blackHole.radius) break;
  }
  return points;
}

export function getGameTelemetry(state) {
  const target = targetFor(state.targetId);
  const speed = Math.hypot(state.ship.vx, state.ship.vy);
  const targetDistance = distance(state.ship, target);
  const candidate = scanCandidate(state, state.ship);
  const scanAvailable = state.phase === 'playing' && Boolean(candidate) && speed < WORLD.scanSpeed;
  const remaining = STATIONS.filter(station => !state.recovered.includes(station.id));
  let scanReason = candidate ? speed >= WORLD.scanSpeed ? 'Brake below 55 to stabilise the signal.' : 'Hold scan to recover this signal.' : target.id === WORLD.dock.id ? remaining.length ? 'Recover the three relay signals first.' : 'Return slowly to the observatory.' : 'Enter a relay’s marked scan radius.';
  if (state.recovered.includes(target.id)) scanReason = 'Signal recovered. Choose another relay or return to the observatory.';
  if (state.guidance && scanAvailable) scanReason = 'Guidance is holding and scanning automatically.';
  if (state.phase === 'ready') scanReason = 'Launch the mission to begin scanning.';
  if (state.phase === 'paused') scanReason = 'Resume the simulation to continue.';
  if (state.phase === 'captured') scanReason = 'Recover from the last safe checkpoint.';
  if (state.phase === 'complete') scanReason = 'All signals recovered. Observatory connection complete.';
  let guidanceMessage = 'Manual flight';
  if (state.guidance) {
    if (state.scanProgress > 0) guidanceMessage = 'Holding position · recovering signal';
    else if (state.route.length > 1) guidanceMessage = 'Routing around the gravity well';
    else if (targetDistance < 220) guidanceMessage = target.id === WORLD.dock.id ? 'Braking for observatory return' : 'Braking for scan';
    else guidanceMessage = 'Coasting toward selected target';
  }
  if (state.phase === 'paused') guidanceMessage = 'Simulation paused';
  if (state.phase === 'captured') guidanceMessage = 'Captured · recovery available';
  if (state.phase === 'complete') guidanceMessage = 'Expedition complete';
  return { speed, distance: targetDistance, target, scanAvailable, scanReason, guidanceMessage, hazardDistance: Math.max(0, Math.hypot(state.ship.x, state.ship.y) - WORLD.blackHole.radius), progress: state.recovered.length / STATIONS.length, nearbyStation: candidate };
}

export function serializeProgress(state) {
  return JSON.stringify({ version: 1, recovered: [...state.recovered], recoveries: state.recoveries, time: state.time, targetId: state.targetId, lastCheckpoint: state.lastCheckpoint?.id || WORLD.dock.id });
}

export function restoreProgress(saved) {
  let data;
  try { data = typeof saved === 'string' ? JSON.parse(saved) : saved; } catch { return null; }
  if (!data || data.version !== 1 || !Array.isArray(data.recovered) || data.recovered.length > STATIONS.length || new Set(data.recovered).size !== data.recovered.length || data.recovered.some(id => !STATIONS.some(station => station.id === id)) || !Number.isSafeInteger(data.recoveries) || data.recoveries < 0 || data.recoveries > 1000 || !finite(data.time) || data.time < 0 || data.time > 86400 || !ALL_TARGETS.some(target => target.id === data.targetId)) return null;
  const checkpoint = ALL_TARGETS.find(target => target.id === data.lastCheckpoint);
  if (!checkpoint || (checkpoint.id !== WORLD.dock.id && !data.recovered.includes(checkpoint.id))) return null;
  const base = createGame();
  const ship = { x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, angle: -Math.PI / 2 };
  const targetId = data.recovered.length === STATIONS.length ? WORLD.dock.id : data.targetId;
  const restored = { ...base, ship, recovered: [...data.recovered], recoveries: data.recoveries, time: data.time, targetId, lastCheckpoint: { id: checkpoint.id, x: checkpoint.x, y: checkpoint.y }, route: planRoute(ship, targetFor(targetId)) };
  restored.score = scoreFor(restored);
  return restored;
}
