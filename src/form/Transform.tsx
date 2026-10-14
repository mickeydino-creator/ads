import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {Backdrop} from './Backdrop';
import {Build, CARDS, R, WIN, SiteContent} from './Build';
import {BrowserChrome, Card, DISPLAY, H, K, MONO, Nav, Pill, UI, W, ez, lerp, mix, pop} from './system';

// 6-10 s: the site keeps transforming. The hero image takes the screen with
// type weaving behind and in front of it, cards trade places, a scroll reveals
// the work section, a circle morphs into a button, a diagonal wipe lands on a
// desktop layout that reflows into a phone.

const t = T.transform;

// ---------- responsive layout (phase D/E), also used by the signature ----------
export const reflowRects = (r: number) => {
  const w = mix(940, 560, r);
  const x = (W - w) / 2;
  const y = 380;
  const h = mix(1120, 1160, r);
  const cards = [0, 1, 2].map((i) => ({
    x: mix(40 + i * 293, 40, r),
    y: mix(330, 300 + i * 200, r),
    w: mix(274, w - 80, r),
    h: mix(300, 176, r),
  }));
  return {
    win: {x, y, w, h, radius: mix(0, 56, r)},
    title: {x: 40, y: 120, size: mix(110, 74, r)},
    cards,
    pill: {x: 40, y: mix(700, 930, r)},
    label: {x: 40, y: mix(1020, 1060, r)},
  };
};

export const ResponsiveSite: React.FC<{f: number; r: number}> = ({f, r}) => {
  const L = reflowRects(r);
  return (
    <div style={{position: 'absolute', left: L.win.x, top: L.win.y, width: L.win.w, height: L.win.h, border: `4px solid ${K.black}`, borderRadius: L.win.radius, backgroundColor: K.white, overflow: 'hidden'}}>
      <div style={{height: 64}}>
        <BrowserChrome url={r > 0.5 ? 'form.studio · mobile' : 'form.studio'} h={60} />
      </div>
      <div style={{position: 'absolute', left: L.title.x, top: L.title.y, fontFamily: DISPLAY, fontSize: L.title.size, lineHeight: 0.92, color: K.black, whiteSpace: 'nowrap'}}>
        EVERY SCREEN<span style={{color: K.orange}}>.</span>
      </div>
      {CARDS.map((c, i) => (
        <div
          key={c.n}
          style={{
            position: 'absolute',
            left: L.cards[i].x,
            top: L.cards[i].y,
            width: L.cards[i].w,
            height: L.cards[i].h,
            transform: `translateX(${[282, 289, 296].reduce((acc, b0) => acc + (f >= b0 + i * 2 ? Math.exp(-(f - b0 - i * 2) / 3.5) : 0), 0) * (i % 2 ? -34 : 34)}px)`,
          }}
        >
          <Card n={c.n} title={c.title} tone={c.tone} />
        </div>
      ))}
      <div style={{position: 'absolute', left: L.pill.x, top: L.pill.y}}>
        <Pill label="SEE THE WORK" />
      </div>
      <div style={{position: 'absolute', left: L.label.x, top: L.label.y, fontFamily: MONO, fontSize: 20, color: K.gray}}>{`${Math.round(L.win.w * 1.5)}px`}</div>
    </div>
  );
};

// ---------- the expanded hero section ----------
const IMG = {x: WIN.x + R.image.x, y: WIN.y + R.image.y, w: R.image.w, h: R.image.h};

const ArtSection: React.FC<{f: number}> = ({f}) => {
  const grow = lerp(f, t.expand, t.expand + 14, 0, 1, ez.inOut);
  const x = mix(IMG.x, 0, grow);
  const y = mix(IMG.y, 0, grow);
  const w = mix(IMG.w, W, grow);
  const h = mix(IMG.h, H, grow);
  const s = mix(0.62, 1.7, grow);
  const wordX = lerp(f, t.typeSwap, 252, W + 40, -2300, ez.lin);
  const front = false; // the word always travels behind the black disc and the white half-disc
  const circleR = 260 * s * (1 - 0.35 * lerp(f, 206, 214, 0, 1, ez.inOut));
  const Word = (
    <div style={{position: 'absolute', left: wordX, top: 1060, fontFamily: DISPLAY, fontSize: 600, lineHeight: 1, color: front ? K.black : K.white, whiteSpace: 'nowrap'}}>DESIGN · MOTION</div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', backgroundColor: K.orange, border: grow < 1 ? `3px solid ${K.black}` : undefined}}>
      {/* stripes */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${8 + i * 12}%`, height: 4, backgroundColor: K.black, opacity: 0.16, transform: `translateX(${Math.sin(f / 9 + i) * 30}px)`}} />
      ))}
      {!front ? Word : null}
      <div style={{position: 'absolute', left: w / 2 - circleR + Math.sin(f / 20) * 20, top: h / 2 - circleR - 120 * grow, width: circleR * 2, height: circleR * 2, borderRadius: '50%', backgroundColor: K.black}} />
      <div
        style={{
          position: 'absolute',
          left: w / 2 - 260 * s,
          top: h / 2 - 120 * grow,
          width: 520 * s,
          height: 260 * s,
          backgroundColor: K.white,
          borderRadius: `0 0 ${260 * s}px ${260 * s}px`,
          transformOrigin: '50% 0%',
          transform: `rotate(${f * 0.6 + lerp(f, 206, 216, 0, 180, ez.inOut)}deg)`,
        }}
      />
      {front ? Word : null}
    </div>
  );
};

// cards that trade places over the art (on the beat)
const SHUFFLE = [
  {x: 70, y: 400},
  {x: 400, y: 360},
  {x: 730, y: 400},
];
const ShuffleCards: React.FC<{f: number}> = ({f}) => {
  if (f < 202) return null;
  const swap = lerp(f, t.shuffle, t.shuffle + 12, 0, 1, ez.inOut);
  return (
    <>
      {CARDS.map((c, i) => {
        const inP = pop(f, 202 + i * 2, 320, 14);
        const from = SHUFFLE[i];
        const to = SHUFFLE[(i + 1) % 3];
        const x = mix(from.x, to.x, swap);
        const y = mix(from.y, to.y, swap) - Math.sin(swap * Math.PI) * (i === 2 ? -120 : 120);
        return (
          <div
            key={c.n}
            style={{
              position: 'absolute',
              left: x,
              top: y + (1 - inP) * 700,
              width: 280,
              height: 360,
              transform: `rotate(${(i - 1) * 6 + Math.sin(swap * Math.PI) * 18}deg) scale(${mix(0.6, 1, inP)})`,
            }}
          >
            <Card n={c.n} title={c.title} tone={c.tone} />
          </div>
        );
      })}
    </>
  );
};

// the work section below the fold
const PROJECTS = ['NOVA', 'ARC', 'PULSE', 'ORBIT'];
const WorkSection: React.FC<{f: number; top: number}> = ({f, top}) => {
  const morph = lerp(f, t.morph, t.morph + 14, 0, 1, ez.inOut);
  // tile 3 (PULSE) holds the circle that becomes the button
  const tile = {x: 70, y: 560 + 450};
  const c0 = {x: tile.x + 205, y: tile.y + 200, w: 230, h: 230};
  const c1 = {x: W / 2, y: 1525, w: 560, h: 110};
  const bx = mix(c0.x, c1.x, morph);
  const by = mix(c0.y, c1.y, morph);
  const bw = mix(c0.w, c1.w, morph);
  const bh = mix(c0.h, c1.h, morph);
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height: H}}>
      <Backdrop f={f} start={t.scroll} base={K.black} dark ring={{x: 960, y: 260, r: 120}} chips={false} />
      <div style={{position: 'absolute', left: 70, top: 290, fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.92, color: K.white}}>
        SELECTED
        <br />
        <span style={{color: K.orange}}>WORK</span>
      </div>
      {PROJECTS.map((p, i) => {
        const x = 70 + (i % 2) * 480;
        const y = 560 + Math.floor(i / 2) * 450;
        const shift = morph * (i % 2 ? 40 : -40);
        return (
          <div key={p} style={{position: 'absolute', left: x + shift, top: y, width: 450, height: 420, border: `3px solid ${K.white}`, backgroundColor: i === 0 ? K.orange : K.black, overflow: 'hidden'}}>
            {i === 1 ? <div style={{position: 'absolute', inset: 40, backgroundImage: `repeating-linear-gradient(90deg, ${K.white} 0 6px, transparent 6px 28px)`, opacity: 0.5, transform: `translateX(${(f % 28) - 28}px)`}} /> : null}
            {i === 3 ? <div style={{position: 'absolute', left: 90, top: 70, width: 270, height: 270, border: `14px solid ${K.orange}`, transform: `rotate(${f * 2}deg)`}} /> : null}
            {i === 0 ? <div style={{position: 'absolute', left: 60, top: 60, width: 330, height: 200, backgroundColor: K.black, transform: `skewX(${Math.sin(f / 12) * 10}deg)`}} /> : null}
            <div style={{position: 'absolute', left: 24, bottom: 18, fontFamily: DISPLAY, fontSize: 64, color: i === 0 ? K.black : K.white}}>{p}</div>
            <div style={{position: 'absolute', right: 24, top: 20, fontFamily: MONO, fontSize: 18, color: i === 0 ? K.black : K.gray}}>{`0${i + 1}`}</div>
          </div>
        );
      })}
      {/* circle -> button */}
      <div
        style={{
          position: 'absolute',
          left: bx - bw / 2,
          top: by - bh / 2,
          width: bw,
          height: bh,
          borderRadius: bh / 2,
          backgroundColor: K.orange,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: UI,
          fontWeight: 700,
          fontSize: 36,
          color: K.black,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{opacity: lerp(f, t.morph + 8, t.morph + 14, 0, 1)}}>SEE THE WORK →</span>
      </div>
    </div>
  );
};

export const Transform: React.FC<{f: number}> = ({f}) => {
  const scroll = lerp(f, t.scroll, t.scroll + 14, 0, 1, ez.inOut);
  const wipe = lerp(f, t.wipe, t.wipe + 9, 0, 1, ez.inOut);
  const reflow = lerp(f, t.reflow - 2, t.reflow + 18, 0, 1, ez.inOut);
  const afterWipe = f >= t.wipe + 5;
  return (
    <AbsoluteFill style={{backgroundColor: K.black}}>
      {!afterWipe ? (
        <AbsoluteFill style={{transform: `translateY(${-scroll * H}px)`}}>
          {/* page section 1: built site under the expanding art */}
          <AbsoluteFill>
            {f < t.expand + 14 ? <Build f={f} /> : null}
            <ArtSection f={f} />
            <ShuffleCards f={f} />
          </AbsoluteFill>
          <WorkSection f={f} top={H} />
          {/* scrollbar */}
        </AbsoluteFill>
      ) : null}
      {f >= t.scroll && !afterWipe ? (
        <div style={{position: 'absolute', right: 18, top: 300 + scroll * 900, width: 10, height: 220, borderRadius: 5, backgroundColor: K.orange}} />
      ) : null}
      {/* diagonal wipe onto the responsive layout */}
      {f >= t.wipe ? (
        <AbsoluteFill style={{clipPath: `polygon(${mix(160, -80, wipe)}% -10%, 200% -10%, 200% 110%, ${mix(160, -80, wipe) - 60}% 110%)`}}>
          <Backdrop f={f} start={t.wipe} base={K.white} ring={{x: 150, y: 1650, r: 140}} hatch={{x: 480, y: 250, w: 600, h: 110}} />
          <ResponsiveSite f={f} r={reflow} />
          <div style={{position: 'absolute', left: 64, top: 250, fontFamily: MONO, fontSize: 26, color: K.black, opacity: 0.7}}>04 / ANY SCREEN</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export {Nav, SiteContent};
