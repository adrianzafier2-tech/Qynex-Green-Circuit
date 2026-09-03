// Track path math utilities for the QYNEX racing engine.
// All car angles are "northClockwise": 0 = up, positive = clockwise.

// Catmull-Rom spline through control points, closed loop.
export function catmullRomClosed(points, segmentsPerPoint = 16) {
  const n = points.length;
  const result = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    for (let t = 0; t < segmentsPerPoint; t++) {
      const s = t / segmentsPerPoint;
      const s2 = s * s;
      const s3 = s2 * s;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * s +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * s +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3);
      result.push({ x, y });
    }
  }
  return result;
}

export function buildPath(points) {
  const segLengths = [];
  const cumLengths = [0];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segLengths.push(len);
    total += len;
    cumLengths.push(total);
  }
  return { points, segLengths, cumLengths, total };
}

// Get point + tangent (canvas angle, 0=east clockwise) at a distance along the path.
export function pointAtDistance(path, dist) {
  const total = path.total;
  const d = ((dist % total) + total) % total;
  let i = 0;
  while (i < path.segLengths.length && d > path.cumLengths[i + 1]) i++;
  if (i >= path.segLengths.length) i = path.segLengths.length - 1;
  const segLen = path.segLengths[i] || 1;
  const t = (d - path.cumLengths[i]) / segLen;
  const a = path.points[i];
  const b = path.points[(i + 1) % path.points.length];
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const canvasAngle = Math.atan2(b.y - a.y, b.x - a.x);
  return { x, y, canvasAngle, segmentIndex: i };
}

// Convert canvas tangent angle (0=east) to northClockwise (0=up).
export function toNorthClockwise(canvasAngle) {
  return canvasAngle + Math.PI / 2;
}

// Nearest point on the path to (x,y). Returns distance, progress, segment.
export function nearestOnPath(path, x, y) {
  let bestDist = Infinity;
  let bestProgress = 0;
  let bestSeg = 0;
  for (let i = 0; i < path.points.length; i++) {
    const a = path.points[i];
    const b = path.points[(i + 1) % path.points.length];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = x - a.x;
    const apy = y - a.y;
    const segLen2 = abx * abx + aby * aby || 1;
    let t = (apx * abx + apy * aby) / segLen2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + abx * t;
    const py = a.y + aby * t;
    const dist = Math.hypot(x - px, y - py);
    if (dist < bestDist) {
      bestDist = dist;
      bestProgress = path.cumLengths[i] + path.segLengths[i] * t;
      bestSeg = i;
    }
  }
  return { distance: bestDist, progress: bestProgress, segmentIndex: bestSeg };
}

export function forwardVector(angle) {
  return { x: Math.sin(angle), y: -Math.cos(angle) };
}