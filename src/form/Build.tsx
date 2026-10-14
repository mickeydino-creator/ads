import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {Backdrop} from './Backdrop';
import {BrowserChrome, Card, DISPLAY, HeroArt, K, MONO, Nav, Pill, TextLines, W, ez, lerp, mix, pop} from './system';

// 3-6 s: a website is assembled by motion. Each component flies in on its own
// path, stretches, rotates, and snaps into the grid with an elastic overshoot.

const b = T.build;
export const WIN = {x: 70, y: 360, w: 940, h: 1200};
// component rects in window coordinates
export const R = {
  nav: {x: 0, y: 64, w: 940, h: 90},
  hero: {x: 40, y: 186, w: 860, h: 260},
  image: {x: 40, y: 470, w: 860, h: 340},
  button: {x: 40, y: 836, w: 420, h: 78},
  cols: {x: 500, y: 836, w: 400, h: 80},
  cards: [0, 1, 2].map((i) => ({x: 40 + i * 293, y: 944, w: 274, h: 210})),
};
export const CARDS = [
  {n: '01', title: 'BRAND', tone: 'black' as const},
  {n: '02', title: 'WEB', tone: 'orange' as const},
  {n: '03', title: 'MOTION', tone: 'white' as const},
];

// helper: a component on a path, with elastic land and a clip reveal
const Fly: React.FC<{
  f: number;
  start: number;
  rect: {x: number; y: number; w: number; h: number};
  from: {dx: number; dy: number; rot: number; sx?: number; sy?: number};
  reveal?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({f, start, rect, from, reveal, children, style}) => {
  if (f < start) return null;
  const p = pop(f, start, 300, 15);
  const travel = lerp(f, start, start + 9, 0, 1, ez.out);
  const sx = mix(from.sx ?? 1, 1, p);
  const sy = mix(from.sy ?? 1, 1, p);
  const clip = lerp(f, start, start + 8, 1, 0, ez.out);
  const clipPath =
    reveal === 'left'
      ? `inset(0 ${clip * 100}% 0 0)`
      : reveal === 'right'
        ? `inset(0 0 0 ${clip * 100}%)`
        : reveal === 'top'
          ? `inset(0 0 ${clip * 100}% 0)`
          : reveal === 'bottom'
            ? `inset(${clip * 100}% 0 0 0)`
            : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        transform: `translate(${from.dx * (1 - travel)}px, ${from.dy * (1 - travel)}px) rotate(${from.rot * (1 - p)}deg) scale(${sx}, ${sy})`,
        clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SiteContent: React.FC<{f: number; build?: boolean}> = ({f, build = true}) => {
  const st = (v: number) => (build ? v : -999);
  const click = f >= b.click ? Math.exp(-(f - b.click) / 4) : 0;
  return (
    <>
      <Fly f={f} start={st(b.nav)} rect={R.nav} from={{dx: 0, dy: -260, rot: 0, sy: 0.2}} reveal="top">
        <div style={{position: 'absolute', inset: 0, borderBottom: `3px solid ${K.black}`, backgroundColor: K.white}}>
          <Nav />
        </div>
      </Fly>
      <Fly f={f} start={st(b.hero)} rect={R.hero} from={{dx: -900, dy: 0, rot: -6, sx: 1.6}} reveal="left">
        <div style={{fontFamily: DISPLAY, fontSize: 118, lineHeight: 0.92, color: K.black, whiteSpace: 'nowrap'}}>
          MAKE IT
          <br />
          UNFORGETTABLE<span style={{color: K.orange}}>.</span>
        </div>
      </Fly>
      <Fly f={f} start={st(b.image)} rect={R.image} from={{dx: 1000, dy: 160, rot: 14, sx: 1.5, sy: 0.6}} reveal="right">
        <div style={{position: 'absolute', inset: 0, border: `3px solid ${K.black}`, overflow: 'hidden'}}>
          <HeroArt f={f} scale={0.62} />
        </div>
      </Fly>
      <Fly f={f} start={st(b.button)} rect={R.button} from={{dx: 0, dy: 120, rot: -10, sx: 0.2, sy: 0.2}}>
        <div style={{transform: `scale(${1 - click * 0.12})`, transformOrigin: 'left center'}}>
          <Pill label="START A PROJECT" />
        </div>
      </Fly>
      <Fly f={f} start={st(b.footer)} rect={R.cols} from={{dx: 700, dy: 0, rot: 0}} reveal="right">
        <TextLines n={4} />
      </Fly>
      {CARDS.map((c, i) => (
        <Fly key={c.n} f={f} start={st(b.cards[i])} rect={R.cards[i]} from={{dx: (i - 1) * 200, dy: 900, rot: (i - 1) * 22 + 8, sy: 1.4}}>
          <Card n={c.n} title={c.title} tone={c.tone} />
        </Fly>
      ))}
    </>
  );
};

export const Build: React.FC<{f: number}> = ({f}) => {
  const lineDraw = lerp(f, b.frame, b.frame + 10, 0, 1, ez.out);
  const open = lerp(f, b.frame + 6, b.frame + 16, 0, 1, ez.out);
  const settle = f >= 165 ? Math.exp(-(f - 165) / 5) : 0;
  // cursor path: in from the lower right, lands on the button for the click
  const cur = lerp(f, 148, b.click, 0, 1, ez.inOut);
  const cx = mix(W + 80, WIN.x + R.button.x + 330, cur);
  const cy = mix(1760, WIN.y + R.button.y + 44, cur) - Math.sin(cur * Math.PI) * 160;
  const ripple = lerp(f, b.click, b.click + 12, 0, 1, ez.out);
  return (
    <AbsoluteFill>
      <Backdrop f={f} start={T.s2} base={K.white} ring={{x: 930, y: 270, r: 130}} hatch={{x: 0, y: 1600, w: 600, h: 240}} />
      <div style={{position: 'absolute', left: 64, top: 250, fontFamily: MONO, fontSize: 26, color: K.black, opacity: 0.7}}>03 / BUILD</div>
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, transform: `scale(${1 + settle * 0.02})`}}>
        {/* frame: chrome draws as a line, then the body opens downward */}
        <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: 64, transform: `scaleX(${lineDraw})`, transformOrigin: 'left', overflow: 'hidden', border: `4px solid ${K.black}`, boxSizing: 'border-box'}}>
          <BrowserChrome url="form.studio/new-site" h={56} />
        </div>
        <div style={{position: 'absolute', left: 0, top: 60, width: WIN.w, height: (WIN.h - 60) * open, border: `4px solid ${K.black}`, borderTop: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(243,239,230,0.92)'}} />
        <SiteContent f={f} />
      </div>
      {/* cursor + click ripple */}
      {f >= 148 ? (
        <>
          {f >= b.click ? (
            <div style={{position: 'absolute', left: cx - 70 * ripple, top: cy - 70 * ripple, width: 140 * ripple, height: 140 * ripple, borderRadius: '50%', border: `4px solid ${K.orange}`, opacity: 1 - ripple}} />
          ) : null}
          <svg width={60} height={70} style={{position: 'absolute', left: cx - 6, top: cy - 4}} viewBox="0 0 30 35">
            <path d="M2 2 L2 28 L9 21 L14 32 L19 30 L14 19 L24 19 Z" fill={K.black} stroke={K.white} strokeWidth={2} strokeLinejoin="round" />
          </svg>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
