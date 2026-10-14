import {Easing, interpolate} from 'remotion';

export type Ease = (t: number) => number;
export type Key = {f: number; v: number; ease?: Ease};

export const smooth: Ease = Easing.bezier(0.45, 0, 0.55, 1);
export const accelerate: Ease = Easing.bezier(0.6, 0, 0.9, 0.55);
export const settle: Ease = Easing.bezier(0.12, 0.85, 0.25, 1);

// Piecewise keyframes; each key's `ease` shapes the segment that ends on it.
export const track = (frame: number, keys: Key[]): number => {
  if (frame <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.f) {
      return interpolate(frame, [a.f, b.f], [a.v, b.v], {
        easing: b.ease ?? smooth,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }
  return keys[keys.length - 1].v;
};

// Monotone cubic (Fritsch-Carlson) through [frame, value] keys: velocity stays
// continuous through in-between keys and drops to zero at turning points and
// at repeated keys, so the camera never jerks or overshoots.
export const spline = (frame: number, keys: [number, number][]): number => {
  const n = keys.length;
  if (frame <= keys[0][0]) return keys[0][1];
  if (frame >= keys[n - 1][0]) return keys[n - 1][1];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  }
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] > 0) {
      const h0 = keys[i][0] - keys[i - 1][0];
      const h1 = keys[i + 1][0] - keys[i][0];
      const w1 = 2 * h1 + h0;
      const w2 = h1 + 2 * h0;
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  let i = 0;
  while (frame > keys[i + 1][0]) i++;
  const h = keys[i + 1][0] - keys[i][0];
  const t = (frame - keys[i][0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * keys[i][1] +
    (t3 - 2 * t2 + t) * h * m[i] +
    (-2 * t3 + 3 * t2) * keys[i + 1][1] +
    (t3 - t2) * h * m[i + 1]
  );
};
