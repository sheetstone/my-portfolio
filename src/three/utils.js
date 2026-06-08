export function shortestAngle(from, to) {
  let diff = to - from;
  diff -= Math.PI * 2 * Math.round(diff / (Math.PI * 2));
  return diff;
}

export function easeOutCubic(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutBack(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
