const TAU = Math.PI * 2;
const lensParameters = Object.freeze({
  adoption: { twist: .5, phase: -.4, tilt: -.66, turn: .33, roll: -.38, radius: 138, width: 61 },
  learning: { twist: 1, phase: .16, tilt: -.85, turn: -.24, roll: -.48, radius: 134, width: 57 },
  communication: { twist: 1.5, phase: .62, tilt: -.6, turn: .43, roll: -.18, radius: 136, width: 52 },
});

function rotate([x, y, z], { tilt, turn, roll }) {
  const ya = y * Math.cos(tilt) - z * Math.sin(tilt);
  const za = y * Math.sin(tilt) + z * Math.cos(tilt);
  const xb = x * Math.cos(turn) + za * Math.sin(turn);
  const zb = -x * Math.sin(turn) + za * Math.cos(turn);
  return [xb * Math.cos(roll) - ya * Math.sin(roll), xb * Math.sin(roll) + ya * Math.cos(roll), zb];
}

function surface(u, v, parameters) {
  const fold = u * parameters.twist + parameters.phase;
  const radius = parameters.radius + v * Math.cos(fold);
  return rotate([
    radius * Math.cos(u),
    radius * Math.sin(u) * .96,
    v * Math.sin(fold) + Math.sin(u * 2 + parameters.phase) * 15,
  ], parameters);
}

function project(point) {
  const perspective = 680 / (680 - point[2]);
  return { x: point[0] * perspective, y: point[1] * perspective, z: point[2] };
}

function lightAt(u, parameters) {
  const a = surface(u, -parameters.width, parameters);
  const b = surface(u, parameters.width, parameters);
  const c = surface(u + .01, 0, parameters);
  const d = surface(u - .01, 0, parameters);
  const across = b.map((value, index) => value - a[index]);
  const along = c.map((value, index) => value - d[index]);
  const normal = [across[1] * along[2] - across[2] * along[1], across[2] * along[0] - across[0] * along[2], across[0] * along[1] - across[1] * along[0]];
  const length = Math.hypot(...normal) || 1;
  const illumination = Math.abs((normal[0] * -.36 + normal[1] * -.57 + normal[2] * .74) / length);
  return .14 + illumination * .86;
}

function metalColor(illumination) {
  const dark = [42, 62, 51];
  const light = [222, 194, 143];
  return `rgb(${dark.map((channel, index) => Math.round(channel + (light[index] - channel) * illumination)).join(',')})`;
}

const number = value => Number(value.toFixed(2));
const linePath = points => points.map((point, index) => `${index ? 'L' : 'M'}${number(point.x)} ${number(point.y)}`).join('');

/** An open ruled surface. All lenses share the same bounded projection and sampling rules. */
export function createSignalGeometry(lensId = 'adoption') {
  const parameters = lensParameters[lensId] || lensParameters.adoption;
  const count = 112;
  const start = -Math.PI + .13;
  const span = TAU - .38;
  const panels = Array.from({ length: count }, (_, index) => {
    const u = start + index * span / count;
    const next = start + (index + 1) * span / count;
    const edges = [project(surface(u, -parameters.width, parameters)), project(surface(u, parameters.width, parameters)), project(surface(next, parameters.width, parameters)), project(surface(next, -parameters.width, parameters))];
    const rib = Array.from({ length: 9 }, (_, step) => project(surface(u, -parameters.width + step * parameters.width / 4, parameters)));
    return { index, edges, rib, depth: edges.reduce((sum, point) => sum + point.z, 0) / edges.length, illumination: lightAt(u, parameters) };
  });
  const samples = panels.flatMap(panel => [...panel.edges, ...panel.rib]);
  const raw = { minX: Math.min(...samples.map(point => point.x)), maxX: Math.max(...samples.map(point => point.x)), minY: Math.min(...samples.map(point => point.y)), maxY: Math.max(...samples.map(point => point.y)) };
  const scale = Math.min(418 / (raw.maxX - raw.minX), 355 / (raw.maxY - raw.minY));
  const center = [(raw.minX + raw.maxX) / 2, (raw.minY + raw.maxY) / 2];
  const fit = point => ({ x: 260 + (point.x - center[0]) * scale, y: 241 + (point.y - center[1]) * scale, z: point.z });
  const minDepth = Math.min(...panels.map(panel => panel.depth));
  const maxDepth = Math.max(...panels.map(panel => panel.depth));
  const surfaces = panels.sort((a, b) => a.depth - b.depth).map(panel => {
    const depth = (panel.depth - minDepth) / (maxDepth - minDepth || 1);
    return {
      id: panel.index,
      depth: panel.depth,
      path: `${linePath(panel.edges.map(fit))}Z`,
      rib: linePath(panel.rib.map(fit)),
      fill: metalColor(panel.illumination),
      ribOpacity: number(.23 + depth * .37),
    };
  });
  const fitted = samples.map(fit);
  return {
    surfaces,
    bounds: { minX: number(Math.min(...fitted.map(point => point.x))), maxX: number(Math.max(...fitted.map(point => point.x))), minY: number(Math.min(...fitted.map(point => point.y))), maxY: number(Math.max(...fitted.map(point => point.y))) },
    terminals: [fit(project(surface(start, 0, parameters))), fit(project(surface(start + span, 0, parameters)))].map(point => ({ x: number(point.x), y: number(point.y) })),
  };
}
