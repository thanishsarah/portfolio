import { WORLD, STATIONS } from './simulation.js';

const TAU = Math.PI * 2;
const COLOURS = { ink: '#030610', cyan: '#7deaff', mint: '#63f5d4', violet: '#ae93ff', coral: '#ffad8f', white: '#e6f5ff' };
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

/** Coordinates are CSS pixels; camera.zoom is CSS pixels per world unit. */
export function worldToScreen(point, camera, width, height) {
  const zoom = Math.max(.05, finite(camera?.zoom, .5));
  return { x: (point.x - finite(camera?.x)) * zoom + width / 2, y: (point.y - finite(camera?.y)) * zoom + height / 2 };
}
export function screenToWorld(point, camera, width, height) {
  const zoom = Math.max(.05, finite(camera?.zoom, .5));
  return { x: (point.x - width / 2) / zoom + finite(camera?.x), y: (point.y - height / 2) / zoom + finite(camera?.y) };
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return (value >>> 0) / 4294967296; };
}
function surface(width, height) {
  const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(width, height) : document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}
function alpha(hex, opacity) {
  const value = hex.replace('#', '');
  return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${opacity})`;
}
function circle(ctx, x, y, radius) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, radius), 0, TAU); }
function ellipse(ctx, x, y, rx, ry, rotation = 0, start = 0, end = TAU) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rotation, start, end);
}
function glow(ctx, x, y, radius, colour, opacity) {
  if (radius < 1) return;
  const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
  fill.addColorStop(0, alpha(colour, opacity)); fill.addColorStop(.33, alpha(colour, opacity * .42)); fill.addColorStop(1, alpha(colour, 0));
  ctx.fillStyle = fill; circle(ctx, x, y, radius); ctx.fill();
}
function text(ctx, value, x, y, colour, size = 11, align = 'center') {
  ctx.fillStyle = colour; ctx.font = `500 ${size}px ui-monospace, SFMono-Regular, Consolas, monospace`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(value, x, y);
}

function makeBackdrop(width, height, dpr) {
  const pad = 90;
  const image = surface(Math.ceil((width + pad * 2) * dpr), Math.ceil((height + pad * 2) * dpr));
  const ctx = image.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  const w = width + pad * 2, h = height + pad * 2;
  ctx.fillStyle = '#030610'; ctx.fillRect(0, 0, w, h);
  const random = seededRandom(0x56545349);
  const clouds = [
    [.76, .25, .64, '#6342ae', .22], [.87, .38, .39, '#304e9b', .20],
    [.12, .78, .52, '#15586d', .18], [.28, .88, .3, '#304a92', .14],
    [.58, .59, .42, '#59275f', .11], [.33, .14, .35, '#28455b', .1],
  ];
  for (const [x, y, scale, colour, opacity] of clouds) {
    glow(ctx, x * w, y * h, Math.max(w, h) * scale, colour, opacity);
  }
  // Dust clouds and stars are generated once, not at animation-frame frequency.
  for (let i = 0; i < 42; i += 1) {
    const x = (random() * .84 + .08) * w;
    const y = (.2 + Math.sin(x / w * 5.8) * .22 + random() * .28) * h;
    glow(ctx, x, y, (random() * .12 + .04) * w, i % 3 ? '#4b3a86' : '#1b7a94', .018 + random() * .035);
  }
  const count = clamp(Math.round(w * h / 2600), 190, 820);
  for (let i = 0; i < count; i += 1) {
    const x = random() * w, y = random() * h, light = random();
    const size = light > .985 ? 1.45 : light > .88 ? .9 : .43;
    const colour = i % 11 === 0 ? '#b8a6ff' : i % 7 === 0 ? '#8bdfff' : '#d7e8ff';
    ctx.fillStyle = alpha(colour, .18 + light * .65); circle(ctx, x, y, size); ctx.fill();
    if (light > .991) {
      glow(ctx, x, y, 7, colour, .2);
      ctx.strokeStyle = alpha(colour, .36); ctx.lineWidth = .6;
      ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
    }
  }
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .7);
  vignette.addColorStop(0, '#00000000'); vignette.addColorStop(1, '#01030bbd'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
  return { image, pad, dpr };
}

function makeBlackHole() {
  const image = surface(1024, 1024);
  const ctx = image.getContext('2d');
  if (!ctx) return null;
  ctx.translate(512, 512);
  glow(ctx, 0, 0, 500, '#7f5bdb', .25);
  glow(ctx, -110, 8, 330, '#5686e6', .16);
  ctx.save(); ctx.rotate(-.2);
  // Layered accretion plane, with an original stylised lens arc behind the horizon.
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let band = 0; band < 5; band += 1) {
    ctx.strokeStyle = alpha(band % 2 ? '#7cbcff' : '#b78af7', .11 - band * .012);
    ctx.shadowColor = band % 2 ? '#78a5ff' : '#c18aff'; ctx.shadowBlur = 28; ctx.lineWidth = 7;
    ellipse(ctx, 0, 0, 255 + band * 38, 35 + band * 9); ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 32; i += 1) {
    const radius = 175 + i * 7.9;
    const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
    gradient.addColorStop(0, alpha('#66c9ff', .12 + i / 140));
    gradient.addColorStop(.43, alpha('#eef2ff', .35));
    gradient.addColorStop(.7, alpha('#bd83ff', .25));
    gradient.addColorStop(1, alpha('#f5a4c7', .12));
    ctx.strokeStyle = gradient; ctx.lineWidth = i % 3 === 0 ? 2.3 : 1;
    ellipse(ctx, 0, 0, radius, 19 + i * 2.3); ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 8; i += 1) {
    ctx.strokeStyle = alpha(i < 3 ? '#bde9ff' : '#a681ec', .3 - i * .025); ctx.lineWidth = 3;
    ellipse(ctx, 0, 0, 144 + i * 5.5, 172 + i * 3, 0, Math.PI + .1, TAU - .1); ctx.stroke();
  }
  glow(ctx, 0, 0, 165, '#b0d4ff', .2);
  const darkness = ctx.createRadialGradient(-23, -20, 2, 0, 0, 120);
  darkness.addColorStop(0, '#010209'); darkness.addColorStop(.85, '#000106'); darkness.addColorStop(1, '#01020a');
  ctx.fillStyle = darkness; circle(ctx, 0, 0, 120); ctx.fill();
  ctx.strokeStyle = '#e0e9ff'; ctx.lineWidth = 1.8; ctx.shadowColor = '#95c6ff'; ctx.shadowBlur = 18; circle(ctx, 0, 0, 122); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ad9ee780'; ctx.lineWidth = .9; circle(ctx, 0, 0, 129); ctx.stroke();
  ctx.save(); ctx.rotate(-.2);
  for (let i = 0; i < 16; i += 1) {
    const radius = 210 + i * 12;
    ctx.strokeStyle = alpha(i % 3 ? '#c5aeff' : '#e8f6ff', .35 - i * .012); ctx.lineWidth = i % 4 ? 1 : 2;
    ellipse(ctx, 0, 0, radius, 25 + i * 2.55, 0, 0, Math.PI); ctx.stroke();
  }
  ctx.restore();
  return image;
}

function drawRelay(ctx, station, point, zoom, state, time) {
  const recovered = state.recovered?.includes(station.id);
  const selected = state.targetId === station.id;
  const colour = station.color || COLOURS.cyan;
  const radius = clamp(34 * zoom, 16, 27);
  const scanRadius = Math.max(radius + 12, (station.radius || 95) * zoom);
  glow(ctx, point.x, point.y, scanRadius * (selected ? 2.8 : 1.9), colour, selected ? .17 : .085);
  ctx.save(); ctx.translate(point.x, point.y);
  ctx.strokeStyle = alpha(colour, recovered ? .65 : selected ? .42 : .2); ctx.lineWidth = 1;
  ctx.setLineDash(selected ? [3, 5] : [1, 7]); circle(ctx, 0, 0, scanRadius); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = alpha(colour, .15); circle(ctx, 0, 0, scanRadius + 7); ctx.stroke();
  ctx.save(); ctx.rotate(station.id === 'learning' ? -.42 : station.id === 'communication' ? .3 : time * .07);
  if (station.id === 'learning') {
    ctx.fillStyle = '#091c27'; circle(ctx, 0, 0, radius); ctx.fill();
    ctx.strokeStyle = alpha(colour, .9); ctx.lineWidth = 1; circle(ctx, 0, 0, radius); ctx.stroke();
    ellipse(ctx, 0, 0, radius * .43, radius); ctx.stroke(); ellipse(ctx, 0, 0, radius, radius * .35); ctx.stroke();
    ctx.strokeStyle = alpha(colour, .55); ctx.strokeRect(-radius - 17, -5, 11, 10); ctx.strokeRect(radius + 6, -5, 11, 10);
    ctx.beginPath(); ctx.moveTo(-radius - 6, 0); ctx.lineTo(radius + 6, 0); ctx.stroke();
  } else if (station.id === 'communication') {
    ctx.strokeStyle = colour; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-radius, -radius * .65); ctx.quadraticCurveTo(radius * .8, radius * 1.25, radius, -radius * .65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, radius); ctx.moveTo(-radius * .5, radius); ctx.lineTo(radius * .5, radius); ctx.stroke();
    for (let i = 1; i <= 3; i += 1) { ctx.strokeStyle = alpha(colour, .6 - i * .12); ctx.beginPath(); ctx.arc(0, -radius * .67, 5 + i * 6, -Math.PI * .8, -Math.PI * .2); ctx.stroke(); }
    ctx.fillStyle = colour; circle(ctx, 0, -radius * .67, 2.8); ctx.fill();
  } else {
    ctx.strokeStyle = colour; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i < 6; i += 1) { const a = i / 6 * TAU - Math.PI / 6; const x = Math.cos(a) * radius, y = Math.sin(a) * radius; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = alpha(colour, .6); circle(ctx, 0, 0, radius * .55); ctx.stroke();
    for (let i = 0; i < 3; i += 1) { const a = i / 3 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * radius * .6, Math.sin(a) * radius * .6); ctx.lineTo(Math.cos(a) * radius * 1.4, Math.sin(a) * radius * 1.4); ctx.stroke(); ctx.fillStyle = colour; circle(ctx, Math.cos(a) * radius * 1.4, Math.sin(a) * radius * 1.4, 2); ctx.fill(); }
    ctx.fillStyle = '#efeaff'; circle(ctx, 0, 0, 3.5); ctx.fill();
  }
  ctx.restore();
  if (state.scanTarget === station.id && state.scanProgress > 0) {
    ctx.strokeStyle = '#f0fbff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, scanRadius + 1, -Math.PI / 2, -Math.PI / 2 + clamp(state.scanProgress, 0, 1) * TAU); ctx.stroke();
  }
  if (recovered) {
    ctx.fillStyle = colour; circle(ctx, scanRadius * .75, -scanRadius * .75, 8); ctx.fill();
    ctx.strokeStyle = '#031018'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(scanRadius * .75 - 3, -scanRadius * .75); ctx.lineTo(scanRadius * .75 - .5, -scanRadius * .75 + 2.5); ctx.lineTo(scanRadius * .75 + 4, -scanRadius * .75 - 3); ctx.stroke();
  }
  text(ctx, station.name.toUpperCase(), 0, scanRadius + 24, recovered ? '#d0fff1' : selected ? '#e4f5ff' : '#98abc4', 11);
  text(ctx, recovered ? 'SIGNAL RECOVERED' : 'SIGNAL RELAY', 0, scanRadius + 40, alpha(colour, .7), 8);
  ctx.restore();
}

function drawDock(ctx, point, zoom, state, time) {
  const selected = state.targetId === 'observatory';
  const colour = state.recovered?.length === STATIONS.length ? '#f3cc93' : '#91b8d2';
  const radius = clamp(55 * zoom, 23, 40);
  glow(ctx, point.x, point.y, radius * 3.7, colour, selected ? .19 : .07);
  ctx.save(); ctx.translate(point.x, point.y);
  ctx.strokeStyle = alpha(colour, .32); ctx.lineWidth = .8;
  ellipse(ctx, 0, 0, radius * 1.8, radius * .72, -.26); ctx.stroke();
  ctx.save(); ctx.rotate(-.3);
  for (let side = -1; side <= 1; side += 2) { ctx.fillStyle = '#0b1927'; ctx.fillRect(side * (radius + 17) - 13, -8, 26, 16); ctx.strokeRect(side * (radius + 17) - 13, -8, 26, 16); ctx.beginPath(); ctx.moveTo(side * radius, 0); ctx.lineTo(side * (radius + 4), 0); ctx.stroke(); }
  ctx.strokeStyle = alpha(colour, .85); ctx.lineWidth = 1.3;
  ctx.beginPath(); for (let i = 0; i < 8; i += 1) { const a = i * Math.PI / 4; const x = Math.cos(a) * radius, y = Math.sin(a) * radius; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = alpha(colour, .3); circle(ctx, 0, 0, radius * .66); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = alpha(colour, .8); circle(ctx, 0, 0, 3); ctx.fill();
  if (selected) { ctx.strokeStyle = alpha(colour, .5); ctx.setLineDash([4, 5]); circle(ctx, 0, 0, (WORLD.dock.radius || 100) * zoom); ctx.stroke(); ctx.setLineDash([]); }
  text(ctx, 'OBSERVATORY', 0, radius + 27, '#bed2e6', 11);
  text(ctx, state.recovered?.length === STATIONS.length ? 'RETURN TO COMPLETE' : 'DEPARTURE / RETURN', 0, radius + 43, alpha(colour, .65), 8);
  ctx.restore();
}

function strokeWorldPath(ctx, points, camera, width, height, colour, dash, opacity, lineWidth = 1) {
  if (!points?.length) return;
  ctx.save(); ctx.strokeStyle = alpha(colour, opacity); ctx.lineWidth = lineWidth; ctx.setLineDash(dash); ctx.beginPath();
  points.slice(0, 180).forEach((point, index) => { const screen = worldToScreen(point, camera, width, height); index ? ctx.lineTo(screen.x, screen.y) : ctx.moveTo(screen.x, screen.y); }); ctx.stroke(); ctx.restore();
}

export function createSceneRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D rendering is unavailable.');
  let width = 1, height = 1, dpr = 1, backdrop = null, blackHole = makeBlackHole(), disposed = false;
  let trail = [], lastTime = -1;

  function resize(nextWidth, nextHeight, nextDpr = 1) {
    if (disposed) return;
    width = Math.max(1, Math.round(finite(nextWidth, 1))); height = Math.max(1, Math.round(finite(nextHeight, 1)));
    dpr = Math.min(clamp(finite(nextDpr, 1), .75, 1.6), Math.sqrt(4500000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
    backdrop = makeBackdrop(width, height, dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render(state, options = {}) {
    if (disposed || !state?.ship) return;
    if (options.width && options.height && (Math.round(options.width) !== width || Math.round(options.height) !== height)) resize(options.width, options.height, options.dpr || dpr);
    const camera = { x: finite(options.camera?.x), y: finite(options.camera?.y), zoom: clamp(finite(options.camera?.zoom, .45), .12, 2) };
    const zoom = camera.zoom;
    const moving = options.motion !== false && !options.reducedMotion;
    const time = moving ? finite(options.frameTime, finite(state.time)) : 0;
    const low = options.quality === 'low';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = COLOURS.ink; ctx.fillRect(0, 0, width, height);
    if (backdrop) ctx.drawImage(backdrop.image, -backdrop.pad - camera.x * .014, -backdrop.pad - camera.y * .014, backdrop.image.width / backdrop.dpr, backdrop.image.height / backdrop.dpr);

    const hole = WORLD.blackHole || { x: 0, y: 0, radius: 96 };
    const centre = worldToScreen(hole, camera, width, height);
    const horizon = hole.radius * zoom;
    glow(ctx, centre.x, centre.y, 690 * zoom, '#694ce0', .065);
    ctx.save(); ctx.strokeStyle = '#8a7cd91b'; ctx.lineWidth = .8; ctx.setLineDash([2, 9]); circle(ctx, centre.x, centre.y, (WORLD.navigationRadius || 280) * zoom); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    // These lines are a navigational map layer, not a claim of relativistic accuracy.
    for (const radius of [390, 560, 790]) { ctx.strokeStyle = '#8eacdf08'; ctx.lineWidth = .6; circle(ctx, centre.x, centre.y, radius * zoom); ctx.stroke(); }
    const imageSize = hole.radius / 120 * 1024 * zoom;
    if (blackHole) ctx.drawImage(blackHole, centre.x - imageSize / 2, centre.y - imageSize / 2, imageSize, imageSize);
    else { ctx.fillStyle = '#000'; circle(ctx, centre.x, centre.y, horizon); ctx.fill(); }
    const dustCount = low ? 22 : 48;
    for (let i = 0; i < dustCount; i += 1) {
      const angle = i * 2.399963 + time * (.05 + i % 3 * .012);
      const radius = (175 + (i * 47 % 230)) * zoom;
      const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius * .19;
      const x = px * .98 + py * .2, y = -px * .2 + py * .98;
      if (Math.hypot(x, y) < horizon * 1.22) continue;
      ctx.fillStyle = i % 3 ? '#b3b4ff82' : '#d9f4ffa0'; circle(ctx, centre.x + x, centre.y + y, i % 7 ? .75 : 1.2); ctx.fill();
    }
    if (centre.x > -100 && centre.x < width + 100 && centre.y > -100 && centre.y < height + 100) {
      text(ctx, 'THE SINGULARITY', centre.x, centre.y - imageSize * .38 - 15, '#b2b1df', 10);
      ctx.strokeStyle = '#bca8ff36'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(centre.x + horizon * .88, centre.y + horizon * .88); ctx.lineTo(centre.x + horizon + 25, centre.y + horizon + 22); ctx.lineTo(centre.x + horizon + 55, centre.y + horizon + 22); ctx.stroke();
    }

    const recoveredStations = STATIONS.filter(station => state.recovered?.includes(station.id));
    if (recoveredStations.length > 1) strokeWorldPath(ctx, recoveredStations, camera, width, height, COLOURS.mint, [2, 8], .22);
    if (state.recovered?.length === STATIONS.length) strokeWorldPath(ctx, [recoveredStations.at(-1), WORLD.dock], camera, width, height, '#f3cc93', [2, 8], .3);
    if (options.trajectory?.length) {
      strokeWorldPath(ctx, options.trajectory, camera, width, height, '#b6b7e8', [2, 5], .35);
      const end = options.trajectory.at(-1);
      if (Math.hypot(end.x - hole.x, end.y - hole.y) <= hole.radius * 1.1) { const point = worldToScreen(end, camera, width, height); ctx.strokeStyle = COLOURS.coral; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(point.x - 4, point.y - 4); ctx.lineTo(point.x + 4, point.y + 4); ctx.moveTo(point.x + 4, point.y - 4); ctx.lineTo(point.x - 4, point.y + 4); ctx.stroke(); }
    }
    if (state.route?.length) {
      const points = [state.ship, ...state.route];
      strokeWorldPath(ctx, points, camera, width, height, COLOURS.cyan, [5, 7], state.guidance ? .55 : .2);
      if (state.guidance) for (const waypoint of state.route.slice(0, -1)) { const point = worldToScreen(waypoint, camera, width, height); ctx.strokeStyle = '#7deaff66'; ctx.lineWidth = 1; circle(ctx, point.x, point.y, 3); ctx.stroke(); }
    }

    for (const station of STATIONS) {
      const point = worldToScreen(station, camera, width, height);
      if (point.x > -180 && point.x < width + 180 && point.y > -180 && point.y < height + 180) drawRelay(ctx, station, point, zoom, state, time);
    }
    const dock = worldToScreen(WORLD.dock, camera, width, height);
    if (dock.x > -150 && dock.x < width + 150 && dock.y > -150 && dock.y < height + 150) drawDock(ctx, dock, zoom, state, time);

    const ship = state.ship;
    const stamp = finite(state.time);
    if (!moving || stamp < lastTime || (trail.length && Math.hypot(ship.x - trail.at(-1).x, ship.y - trail.at(-1).y) > 240) || state.phase === 'ready') trail = [];
    if (moving && state.phase === 'playing' && stamp !== lastTime) { trail.push({ x: ship.x, y: ship.y }); if (trail.length > (low ? 32 : 65)) trail.shift(); }
    lastTime = stamp;
    if (moving && trail.length > 1) for (let i = 1; i < trail.length; i += 1) strokeWorldPath(ctx, [trail[i - 1], trail[i]], camera, width, height, COLOURS.cyan, [], (i / trail.length) ** 2 * .4, .7 + i / trail.length);
    const position = worldToScreen(ship, camera, width, height);
    const speed = Math.hypot(ship.vx || 0, ship.vy || 0);
    const angle = finite(ship.angle, Math.atan2(ship.vy || 0, ship.vx || 1));
    const shipSize = clamp(13 * zoom + 5, 9, 17);
    glow(ctx, position.x, position.y, shipSize * 4.3, state.phase === 'complete' ? '#f3cc93' : COLOURS.cyan, state.phase === 'captured' ? .04 : .17);
    ctx.save(); ctx.translate(position.x, position.y); ctx.rotate(angle); ctx.globalAlpha = state.phase === 'captured' ? .2 : 1;
    const thrust = typeof options.thrust === 'number' ? clamp(options.thrust, 0, 1) : 0;
    if (thrust > .03 && moving) {
      const length = shipSize * (1.1 + thrust * 1.8);
      const flame = ctx.createLinearGradient(-shipSize * .4, 0, -shipSize - length, 0); flame.addColorStop(0, '#d7faff'); flame.addColorStop(.2, '#60d6ffb3'); flame.addColorStop(1, '#7288ff00');
      ctx.fillStyle = flame; ctx.beginPath(); ctx.moveTo(-shipSize * .6, -shipSize * .32); ctx.lineTo(-shipSize - length, 0); ctx.lineTo(-shipSize * .6, shipSize * .32); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = state.phase === 'complete' ? '#f6d69f' : '#dcecff'; ctx.strokeStyle = '#dff9ff'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(shipSize, 0); ctx.lineTo(-shipSize * .74, -shipSize * .63); ctx.lineTo(-shipSize * .35, 0); ctx.lineTo(-shipSize * .74, shipSize * .63); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#092638'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(shipSize * .54, 0); ctx.lineTo(-shipSize * .27, 0); ctx.stroke();
    ctx.restore();
    if (options.braking && speed > 10) { ctx.strokeStyle = '#a9f4ff88'; ctx.lineWidth = 1; circle(ctx, position.x, position.y, shipSize * 1.55); ctx.stroke(); }

    const target = state.targetId === 'observatory' ? WORLD.dock : STATIONS.find(station => station.id === state.targetId);
    if (target) {
      const point = worldToScreen(target, camera, width, height);
      const padding = Math.min(80, width * .16);
      if (point.x < padding || point.x > width - padding || point.y < 100 || point.y > height - 110) {
        const dx = point.x - width / 2, dy = point.y - height / 2;
        const scale = Math.min((width / 2 - padding) / Math.max(Math.abs(dx), 1), (height / 2 - 110) / Math.max(Math.abs(dy), 1));
        const x = clamp(width / 2 + dx * scale, padding, width - padding), y = clamp(height / 2 + dy * scale, 100, height - 110);
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx)); ctx.fillStyle = target.color || '#f3cc93'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
  }

  function destroy() {
    disposed = true; backdrop = null; blackHole = null; trail = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  resize(canvas.clientWidth || 1, canvas.clientHeight || 1, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  return { resize, render, destroy };
}
