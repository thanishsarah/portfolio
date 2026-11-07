/**
 * Stylised presentation physics in CSS pixels and seconds.
 * The rule model decides casts and moves; these curves only show their result.
 * Analytic trajectories are sampled at 120 Hz, so browser frame rate does not
 * change their duration, landing point, or energy decay.
 */
const FRAME = 1 / 120;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}
function rounded(value) {
  return Math.abs(value) < 0.00001 ? 0 : Number(value.toFixed(5));
}
function timesUntil(duration, landmarks = []) {
  const times = [0, duration, ...landmarks];
  for (let time = FRAME; time < duration; time += FRAME) times.push(time);
  return [
    ...new Set(times.filter((time) => time >= 0 && time <= duration)),
  ].sort((a, b) => a - b);
}

/** Displacement for m*x'' + c*x' + k*x = 0, x(0)=0, x'(0)=velocity. */
export function dampedDisplacement(
  time,
  { mass = 1.6, stiffness = 2500, damping = 90, velocity = 0 } = {},
) {
  for (const [name, value] of Object.entries({
    time,
    mass,
    stiffness,
    damping,
    velocity,
  }))
    finite(value, name);
  if (time < 0 || mass <= 0 || stiffness <= 0 || damping <= 0)
    throw new RangeError("Invalid spring parameters");
  const discriminant = damping * damping - 4 * mass * stiffness;
  const decay = -damping / (2 * mass);
  if (!Number.isFinite(discriminant) || !Number.isFinite(decay))
    throw new RangeError("Spring parameters exceed numerical range");
  let displacement;
  if (Math.abs(discriminant) < 1e-8) {
    displacement = velocity * time * Math.exp(decay * time);
  } else if (discriminant < 0) {
    const frequency = Math.sqrt(-discriminant) / (2 * mass);
    displacement =
      (velocity / frequency) *
      Math.exp(decay * time) *
      Math.sin(frequency * time);
  } else {
    const difference = Math.sqrt(discriminant) / (2 * mass);
    displacement =
      (velocity / (2 * difference)) *
      (Math.exp((decay + difference) * time) -
        Math.exp((decay - difference) * time));
  }
  if (!Number.isFinite(displacement))
    throw new RangeError("Spring parameters exceed numerical range");
  return displacement;
}

export function createPieceMotion({ dx, dy, fromScale = 1 } = {}) {
  finite(dx, "dx");
  finite(dy, "dy");
  finite(fromScale, "fromScale");
  if (
    Math.abs(dx) > 32768 ||
    Math.abs(dy) > 32768 ||
    fromScale <= 0 ||
    fromScale > 32
  )
    throw new RangeError("Unsupported piece geometry");
  const distance = Math.hypot(dx, dy);
  const gravity = 1800;
  const flight = clamp(0.19 + Math.sqrt(distance) / 110, 0.22, 0.4);
  const settle = 0.14;
  const duration = flight + settle;
  const impulse = (gravity * flight) / 2;
  const height = (gravity * flight * flight) / 8;
  const keyframes = timesUntil(duration, [flight / 2, flight]).map((time) => {
    const progress = Math.min(1, time / flight);
    const lift =
      time < flight ? impulse * time - (gravity * time * time) / 2 : 0;
    const contact =
      time > flight
        ? dampedDisplacement(time - flight, { velocity: impulse * 0.35 })
        : 0;
    const x = dx * (1 - progress);
    const y = dy * (1 - progress) - lift + contact;
    const scale = fromScale + (1 - fromScale) * progress;
    const angle = Math.sign(dx || 1) * 3 * Math.sin(Math.PI * progress);
    return {
      offset: time / duration,
      transform: `translate(${rounded(x)}px, ${rounded(y)}px) scale(${rounded(scale)}) rotate(${rounded(angle)}deg)`,
    };
  });
  // Exact endpoints prevent a sub-pixel jump when the presentation clone leaves.
  keyframes[0] = {
    offset: 0,
    transform: `translate(${dx}px, ${dy}px) scale(${fromScale}) rotate(0deg)`,
  };
  keyframes[keyframes.length - 1] = {
    offset: 1,
    transform: "translate(0px, 0px) scale(1) rotate(0deg)",
  };
  return {
    duration: duration * 1000,
    keyframes,
    gravity,
    flight: flight * 1000,
    height,
    model: "projectile-and-damped-contact",
  };
}

export function createCastMotion(index = 0) {
  if (!Number.isInteger(index) || index < 0 || index > 3)
    throw new RangeError("A cast has four stones");
  const gravity = 2100;
  const impulse = 235 + index * 17;
  const restitution = 0.24;
  const impacts = [];
  let speed = impulse,
    elapsed = 0;
  for (let bounce = 0; bounce < 4 && speed >= 5; bounce += 1) {
    elapsed += (2 * speed) / gravity;
    impacts.push(elapsed);
    speed *= restitution;
  }
  const duration = Math.max(0.4, elapsed + 0.08);
  function displacement(time) {
    let remaining = time,
      speed = impulse;
    for (let bounce = 0; bounce < 4 && speed >= 5; bounce += 1) {
      const flight = (2 * speed) / gravity;
      if (remaining < flight)
        return -speed * remaining + (gravity * remaining * remaining) / 2;
      remaining -= flight;
      speed *= restitution;
    }
    return 0;
  }
  const keyframes = timesUntil(duration, impacts).map((time) => {
    const rotation = dampedDisplacement(time, {
      mass: 0.7,
      stiffness: 1300,
      damping: 23,
      velocity: (index % 2 ? 1 : -1) * 760,
    });
    return {
      offset: time / duration,
      transform: `translateY(${rounded(displacement(time))}px) rotate(${rounded(rotation)}deg)`,
    };
  });
  keyframes[0] = { offset: 0, transform: "translateY(0px) rotate(0deg)" };
  keyframes[keyframes.length - 1] = {
    offset: 1,
    transform: "translateY(0px) rotate(0deg)",
  };
  return {
    duration: duration * 1000,
    keyframes,
    gravity,
    restitution,
    impacts: impacts.map((time) => time * 1000),
    energyRetention: restitution ** 2,
    model: "gravity-and-inelastic-bounce",
  };
}
