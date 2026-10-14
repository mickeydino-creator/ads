import React from 'react';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Unofficial portfolio concept inspired by a music-streaming experience.
// All artwork, artists and tracks below are fictional originals.

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const P = {
  green: '#c6ff1a', // acid green
  black: '#0a0a0a',
  purple: '#7a2cff',
  pink: '#ff2e93',
  white: '#fff4e8', // warm white
  orange: '#ff6a00',
  blue: '#2d5bff',
  ink2: '#1b1b1f',
  mute: '#8c8794',
};

export const DISP = 'PulseDisplay'; // Unbounded
export const BODY = 'PulseBody'; // Manrope
for (const w of ['800', '900']) loadFont({family: DISP, url: staticFile(`fonts/unbounded-latin-${w}-normal.woff2`), weight: w});
for (const w of ['600', '800']) loadFont({family: BODY, url: staticFile(`fonts/manrope-latin-${w}-normal.woff2`), weight: w});

export const ez = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  lin: (x: number) => x,
};
export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ez.out) =>
  interpolate(f, [a, b], [from, to], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const bounce = (f: number, start: number, stiffness = 300, damping = 12) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// pulse that decays after every 8th note (7.5 frames)
export const eighth = (f: number, from = 0, decay = 2.6) => (f < from ? 0 : Math.exp(-((f - from) % 7.5) / decay));
export const onBeat = (f: number, from = 0, decay = 3.5) => (f < from ? 0 : Math.exp(-((f - from) % 15) / decay));

// deterministic pseudo-random
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// A sound wave as an SVG path, centred on y, spanning x0..x1.
export const wavePath = (f: number, x0: number, x1: number, y: number, amp: number, opts: {freq?: number; speed?: number; seed?: number; env?: 'burst' | 'flat'} = {}) => {
  const {freq = 0.035, speed = 0.35, seed = 1, env = 'flat'} = opts;
  const n = 120;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = mix(x0, x1, u);
    const e = env === 'burst' ? Math.exp(-((u - 0.5) ** 2) / 0.03) : 1;
    const v = Math.sin(x * freq + f * speed + seed) * 0.6 + Math.sin(x * freq * 2.3 - f * speed * 1.7 + seed * 2) * 0.4;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(y + v * amp * e).toFixed(1)}`;
  }
  return d;
};

// Polar wave: a ring whose radius ripples (the "sound wave becomes a circle" metaphor)
export const ringPath = (f: number, cx: number, cy: number, r: number, amp: number, lobes = 12) => {
  const n = 160;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r + Math.sin(a * lobes + f * 0.4) * amp + Math.sin(a * (lobes + 5) - f * 0.3) * amp * 0.4;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
};

// ---------- original fictional album artwork ----------
export type Art = 'neon' | 'sun' | 'moon' | 'bass';
export const ALBUMS: Record<Art, {title: string; artist: string}> = {
  neon: {title: 'Neon Hours', artist: 'Lumen Vale'},
  sun: {title: 'Summer Fever', artist: 'Sol Arcade'},
  moon: {title: 'Midnight Drive', artist: 'Nova Lane'},
  bass: {title: 'Bass Theory', artist: 'Grid Kid'},
};

export const AlbumArt: React.FC<{art: Art; f: number; size: number}> = ({art, f, size}) => {
  const s = size / 400;
  if (art === 'neon') {
    return (
      <div style={{position: 'absolute', inset: 0, backgroundColor: P.purple, overflow: 'hidden'}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', left: (40 + i * 70) * s, top: 0, width: 26 * s, height: size, backgroundColor: i % 2 ? P.pink : P.green, transform: `translateY(${Math.sin(f / 8 + i) * 40 * s}px)`}} />
        ))}
        <div style={{position: 'absolute', left: 90 * s, top: 90 * s, width: 220 * s, height: 220 * s, borderRadius: '50%', border: `${18 * s}px solid ${P.black}`}} />
        <div style={{position: 'absolute', left: 20 * s, bottom: 18 * s, fontFamily: DISP, fontWeight: 900, fontSize: 44 * s, color: P.white}}>NEON</div>
      </div>
    );
  }
  if (art === 'sun') {
    return (
      <div style={{position: 'absolute', inset: 0, backgroundColor: P.pink, overflow: 'hidden'}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 200 * s - (150 - i * 35) * s, top: 230 * s - (150 - i * 35) * s, width: (300 - i * 70) * s, height: (300 - i * 70) * s, borderRadius: '50%', backgroundColor: i % 2 ? P.pink : P.orange}} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={`l${i}`} style={{position: 'absolute', left: 0, right: 0, top: (250 + i * 26) * s, height: 10 * s, backgroundColor: P.pink}} />
        ))}
        <div style={{position: 'absolute', left: 20 * s, top: 18 * s, fontFamily: DISP, fontWeight: 900, fontSize: 40 * s, color: P.white}}>SUN</div>
      </div>
    );
  }
  if (art === 'moon') {
    return (
      <div style={{position: 'absolute', inset: 0, backgroundColor: '#1b1450', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 120 * s, top: 70 * s, width: 170 * s, height: 170 * s, borderRadius: '50%', backgroundColor: P.white}} />
        <div style={{position: 'absolute', left: 160 * s, top: 50 * s, width: 170 * s, height: 170 * s, borderRadius: '50%', backgroundColor: '#1b1450'}} />
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} width={size} height={size} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={wavePath(f + i * 6, 0, size, (260 + i * 30) * s, 14 * s, {freq: 0.03 / s, seed: i})} stroke={i % 2 ? P.blue : P.purple} strokeWidth={8 * s} fill="none" />
          </svg>
        ))}
        <div style={{position: 'absolute', left: 20 * s, bottom: 16 * s, fontFamily: DISP, fontWeight: 900, fontSize: 36 * s, color: P.white}}>NIGHT</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: P.black, overflow: 'hidden'}}>
      {new Array(8).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (24 + i * 46) * s, bottom: 70 * s, width: 32 * s, height: (60 + 180 * Math.abs(Math.sin(f / 5 + i * 1.3))) * s, backgroundColor: P.green}} />
      ))}
      <div style={{position: 'absolute', left: 20 * s, top: 18 * s, fontFamily: DISP, fontWeight: 900, fontSize: 52 * s, color: P.green, lineHeight: 0.9}}>
        BASS
        <br />
        <span style={{WebkitTextStroke: `${2 * s}px ${P.green}`, color: 'transparent'}}>BASS</span>
      </div>
    </div>
  );
};

// play / pause / skip glyphs (plain geometry)
export const PlayGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <polygon points="28,16 86,50 28,84" fill={color} />
  </svg>
);
export const SkipGlyph: React.FC<{size: number; color: string; back?: boolean}> = ({size, color, back}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: back ? 'scaleX(-1)' : undefined}}>
    <polygon points="18,20 66,50 18,80" fill={color} />
    <rect x="70" y="20" width="12" height="60" fill={color} />
  </svg>
);
