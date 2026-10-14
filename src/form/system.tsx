import React from 'react';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const K = {
  orange: '#ff4d00',
  black: '#0c0c0c',
  white: '#f3efe6', // warm white
  gray: '#8d8a84',
  line: 'rgba(12,12,12,0.12)',
  lineDark: 'rgba(243,239,230,0.12)',
};

export const DISPLAY = 'FormDisplay'; // Anton: condensed, oversized
export const UI = 'FormUI'; // Space Grotesk
export const MONO = 'FormMono'; // Space Mono
loadFont({family: DISPLAY, url: staticFile('fonts/anton-latin-400-normal.woff2'), weight: '400'});
loadFont({family: UI, url: staticFile('fonts/space-grotesk-latin-500-normal.woff2'), weight: '500'});
loadFont({family: UI, url: staticFile('fonts/space-grotesk-latin-700-normal.woff2'), weight: '700'});
loadFont({family: MONO, url: staticFile('fonts/space-mono-latin-400-normal.woff2'), weight: '400'});

export const ez = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  lin: (x: number) => x,
};

export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ez.out) =>
  interpolate(f, [a, b], [from, to], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// elastic spring with deliberate overshoot
export const pop = (f: number, start: number, stiffness = 260, damping = 13) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// decaying kick on each beat after `from`
export const beatKick = (f: number, from: number, beat = 15, decay = 3.5) =>
  f < from ? 0 : Math.exp(-((f - from) % beat) / decay);

// ---------- website UI kit (one consistent style) ----------

export const BrowserChrome: React.FC<{url?: string; dark?: boolean; h?: number}> = ({url = 'form.studio', dark, h = 64}) => (
  <div
    style={{
      height: h,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 24px',
      backgroundColor: dark ? K.black : K.white,
      borderBottom: `3px solid ${dark ? K.white : K.black}`,
      flexShrink: 0,
    }}
  >
    {[0, 1, 2].map((i) => (
      <div key={i} style={{width: 16, height: 16, borderRadius: 8, border: `3px solid ${dark ? K.white : K.black}`, backgroundColor: i === 0 ? K.orange : 'transparent'}} />
    ))}
    <div
      style={{
        marginLeft: 18,
        flex: 1,
        height: 34,
        borderRadius: 17,
        border: `2px solid ${dark ? 'rgba(243,239,230,0.35)' : 'rgba(12,12,12,0.25)'}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontFamily: MONO,
        fontSize: 18,
        color: dark ? K.white : K.black,
      }}
    >
      {url}
    </div>
  </div>
);

export const Nav: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 28px'}}>
    <div style={{fontFamily: DISPLAY, fontSize: 40, color: dark ? K.white : K.black, letterSpacing: '0.02em'}}>
      FORM<span style={{color: K.orange}}>.</span>
    </div>
    <div style={{display: 'flex', gap: 22}}>
      {['WORK', 'STUDIO', 'CONTACT'].map((t) => (
        <div key={t} style={{fontFamily: MONO, fontSize: 18, color: dark ? K.white : K.black}}>
          {t}
        </div>
      ))}
    </div>
  </div>
);

// An abstract art-directed "hero image": flat geometric composition
export const HeroArt: React.FC<{f: number; spin?: number; scale?: number}> = ({f, spin = 0, scale = 1}) => (
  <div style={{position: 'absolute', inset: 0, backgroundColor: K.orange, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 520 * scale,
        height: 520 * scale,
        marginLeft: -260 * scale,
        marginTop: -260 * scale,
        borderRadius: '50%',
        backgroundColor: K.black,
        transform: `translate(${Math.sin(f / 20) * 20}px, ${Math.cos(f / 24) * 14}px)`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 520 * scale,
        height: 260 * scale,
        marginLeft: -260 * scale,
        marginTop: 0,
        backgroundColor: K.white,
        borderRadius: `0 0 ${260 * scale}px ${260 * scale}px`,
        transformOrigin: '50% 0%',
        transform: `rotate(${spin + f * 0.6}deg)`,
      }}
    />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        style={{position: 'absolute', left: 0, right: 0, top: `${12 + i * 15}%`, height: 3, backgroundColor: K.black, opacity: 0.18}}
      />
    ))}
  </div>
);

export const TextLines: React.FC<{n: number; color?: string; widths?: number[]}> = ({n, color = K.black, widths = [100, 92, 96, 70, 84]}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
    {new Array(n).fill(0).map((_, i) => (
      <div key={i} style={{height: 12, width: `${widths[i % widths.length]}%`, backgroundColor: color, opacity: 0.85, borderRadius: 2}} />
    ))}
  </div>
);

export const Pill: React.FC<{label: string; fill?: string; color?: string; style?: React.CSSProperties}> = ({label, fill = K.orange, color = K.black, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      height: 78,
      padding: '0 34px',
      borderRadius: 39,
      backgroundColor: fill,
      fontFamily: UI,
      fontWeight: 700,
      fontSize: 28,
      color,
      ...style,
    }}
  >
    {label}
    <span style={{fontFamily: MONO, fontSize: 30}}>→</span>
  </div>
);

export const Card: React.FC<{n: string; title: string; tone: 'black' | 'white' | 'orange'}> = ({n, title, tone}) => {
  const bg = tone === 'black' ? K.black : tone === 'orange' ? K.orange : K.white;
  const fg = tone === 'black' ? K.white : K.black;
  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: bg, border: `3px solid ${K.black}`, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{fontFamily: MONO, fontSize: 18, color: fg}}>{n}</div>
      <div style={{fontFamily: DISPLAY, fontSize: 46, lineHeight: 0.95, color: fg}}>{title}</div>
    </div>
  );
};
