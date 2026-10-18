import React from 'react';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const K = {
  paper: '#f2ede4', // warm white
  ink: '#141210',
  accent: '#c8321e', // brick red, the only accent
  muted: '#7d766c',
  rule: 'rgba(20,18,16,0.14)',
  // the "before" flyer palette, deliberately loud
  yellow: '#ffe600',
  red: '#e10600',
  blue: '#1a3cff',
  green: '#00a651',
  purple: '#7a00c8',
};

// Hebrew and Latin subsets load as two families; the stack picks digits/latin from the second.
const fam = (name: string, file: string, weight: string, style = 'normal') => {
  loadFont({family: name, url: staticFile(`fonts/${file}-hebrew-${weight}-${style}.woff2`), weight, style});
  loadFont({family: `${name}L`, url: staticFile(`fonts/${file}-latin-${weight}-${style}.woff2`), weight, style});
};
fam('BRubik', 'rubik', '400');
fam('BRubik', 'rubik', '500');
fam('BRubik', 'rubik', '700');
fam('BRubik', 'rubik', '800');
fam('BRubik', 'rubik', '900');
fam('BRubik', 'rubik', '900', 'italic');
fam('BSecular', 'secular-one', '400');
fam('BFrank', 'frank-ruhl-libre', '700');
fam('BFrank', 'frank-ruhl-libre', '900');

export const UI = 'BRubik, BRubikL';
export const SERIF = 'BFrank, BFrankL';
export const LOUD = 'BSecular, BSecularL';

export const ez = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  lin: (x: number) => x,
};

export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ez.out) =>
  interpolate(f, [a, b], [from, to], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const pop = (f: number, start: number, stiffness = 260, damping = 14) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const beatKick = (f: number, from: number, beat = 15, decay = 3.5) =>
  f < from ? 0 : Math.exp(-((f - from) % beat) / decay);

// Text block centred on (x, y), right-to-left
export const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  transform?: string;
  opacity?: number;
}> = ({x, y, children, style, transform = '', opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) ${transform}`,
      direction: 'rtl',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      lineHeight: 1,
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

// Line-drawn scissors; `open` 0..1 is the blade angle
export const Scissors: React.FC<{size: number; open: number; color?: string; stroke?: number}> = ({size, open, color = K.ink, stroke = 10}) => {
  const a = 4 + open * 22;
  const blade = (sign: number) => (
    <g transform={`rotate(${sign * a} 100 100)`}>
      <path d={`M100 100 L196 ${100 - sign * 6}`} stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <circle cx={46} cy={100 + sign * 26} r={22} fill="none" stroke={color} strokeWidth={stroke} />
      <path d={`M100 100 L64 ${100 + sign * 16}`} stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
      {blade(1)}
      {blade(-1)}
      <circle cx={100} cy={100} r={stroke * 0.6} fill={color} />
    </svg>
  );
};

// Flat barber-pole stripes, scrolling with `shift` px
let stripeId = 0;
export const Stripes: React.FC<{shift: number; w?: number; style?: React.CSSProperties}> = ({shift, w = 64, style}) => {
  const id = React.useMemo(() => `stripes${stripeId++}`, []);
  const p = w * 2.4;
  return (
    <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', ...style}}>
      <defs>
        <pattern id={id} width={p} height={10} patternUnits="userSpaceOnUse" patternTransform={`rotate(45) translate(${shift % p} 0)`}>
          <rect width={p} height={10} fill={K.paper} />
          <rect width={w} height={10} fill={K.accent} />
          <rect x={w * 1.6} width={w * 0.2} height={10} fill={K.ink} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

// Generic paper plane (not a platform logo)
export const Plane: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M42 6 L4 22 L18 27 L22 42 L29 31 L38 38 Z" fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />
    <path d="M18 27 L42 6" stroke={color} strokeWidth={4} strokeLinecap="round" />
  </svg>
);
