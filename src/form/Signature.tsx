import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {Backdrop} from './Backdrop';
import {CARDS, } from './Build';
import {reflowRects} from './Transform';
import {BrowserChrome, Card, DISPLAY, K, MONO, Pill, W, ez, lerp, mix, pop} from './system';
import {} from './system';

// 10-13 s: every component of the phone layout accelerates to the centre and
// collapses into four shapes. A beat of calm, then each shape opens into a
// letter of FORM through its own geometry, and an orange block writes STUDIO.

const s = T.signature;
export const WORD_Y = 520; // shared with the finale for the match cut
export const LETTER_BOX = 220;
export const letterCx = (i: number) => W / 2 + (i - 1.5) * LETTER_BOX;
const SHAPE_Y = WORD_Y + 165;
const SHAPES: {kind: 'square' | 'circle' | 'triangle' | 'diamond'; color: string}[] = [
  {kind: 'square', color: K.black},
  {kind: 'circle', color: K.orange},
  {kind: 'triangle', color: K.black},
  {kind: 'diamond', color: K.orange},
];

const clipFor = (kind: string, p: number) => {
  const k = p * 100;
  switch (kind) {
    case 'circle':
      return `circle(${k * 0.75}% at 50% 50%)`;
    case 'triangle':
      return `polygon(50% ${50 - k}%, ${50 + k}% ${50 + k}%, ${50 - k}% ${50 + k}%)`;
    case 'diamond':
      return `polygon(50% ${50 - k}%, ${50 + k}% 50%, 50% ${50 + k}%, ${50 - k}% 50%)`;
    default:
      return `inset(${50 - k / 2}% ${50 - k / 2}% ${50 - k / 2}% ${50 - k / 2}%)`;
  }
};

const Shape: React.FC<{kind: string; color: string; size: number}> = ({kind, color, size}) => {
  if (kind === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
        <polygon points="50,4 96,94 4,94" fill={color} />
      </svg>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: kind === 'circle' ? '50%' : 0,
        transform: kind === 'diamond' ? 'rotate(45deg) scale(0.78)' : undefined,
      }}
    />
  );
};

export const Signature: React.FC<{f: number}> = ({f}) => {
  const L = reflowRects(1);
  const conv = lerp(f, s.converge, 318, 0, 1, ez.in);
  const center = {x: W / 2, y: SHAPE_Y};
  const calm = lerp(f, s.calm - 4, s.calm + 8, 1, 0, ez.inOut);
  // elements of the phone layout, in screen coordinates
  const items = [
    {
      x: L.win.x,
      y: L.win.y,
      w: L.win.w,
      h: L.win.h,
      node: (
        <div style={{position: 'absolute', inset: 0, border: `4px solid ${K.black}`, borderRadius: 56, overflow: 'hidden', backgroundColor: K.white}}>
          <BrowserChrome url="form.studio · mobile" h={60} />
          <div style={{position: 'absolute', left: L.label.x, top: L.label.y, fontFamily: MONO, fontSize: 20, color: K.gray}}>{`${Math.round(L.win.w * 1.5)}px`}</div>
        </div>
      ),
    },
    {
      x: L.win.x + L.title.x,
      y: L.win.y + L.title.y,
      w: 460,
      h: 80,
      node: (
        <div style={{fontFamily: DISPLAY, fontSize: 74, lineHeight: 0.92, color: K.black, whiteSpace: 'nowrap'}}>
          EVERY SCREEN<span style={{color: K.orange}}>.</span>
        </div>
      ),
    },
    ...CARDS.map((c, i) => ({x: L.win.x + L.cards[i].x, y: L.win.y + L.cards[i].y, w: L.cards[i].w, h: L.cards[i].h, node: <Card n={c.n} title={c.title} tone={c.tone} />})),
    {x: L.win.x + L.pill.x, y: L.win.y + L.pill.y, w: 360, h: 78, node: <Pill label="SEE THE WORK" />},
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: K.white}} />
      <AbsoluteFill style={{opacity: calm}}>
        <Backdrop f={f} start={T.transform.wipe} base={K.white} ring={{x: 150, y: 1650, r: 140}} zoom={lerp(f, s.converge, 318, 1, 0.82, ez.in)} />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: K.white, opacity: 1 - calm}} />

      {/* the hairline grows into the black field of the end frame */}
      {f >= 372 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: W,
            top: mix(SHAPE_Y + 150, 0, lerp(f, 372, 388, 0, 1, ez.inOut)),
            height: mix(3, 1920, lerp(f, 372, 388, 0, 1, ez.inOut)),
            backgroundColor: K.black,
          }}
        />
      ) : null}
      {/* converge */}
      {f < 320
        ? items.map((it, i) => {
            const cx = it.x + it.w / 2;
            const cy = it.y + it.h / 2;
            const d = Math.min(1, conv * (1 + i * 0.08));
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: it.x,
                  top: it.y,
                  width: it.w,
                  height: it.h,
                  transform: `translate(${(center.x - cx) * d}px, ${(center.y - cy) * d}px) rotate(${d * (i % 2 ? 90 : -90)}deg) scale(${mix(1, 0.05, d)})`,
                }}
              >
                {it.node}
              </div>
            );
          })
        : null}

      {/* shapes, then letters opening through the shapes */}
      {f >= s.shapes
        ? SHAPES.map((sh, i) => {
            const inP = pop(f, s.shapes + i * 2, 360, 12);
            const fromX = W / 2;
            const x = mix(fromX, letterCx(i), inP);
            const start = s.form + i * 3;
            const open = lerp(f, start + 3, start + 12, 0, 1, ez.out);
            const breathe = f < s.form ? 1 + Math.sin((f - s.shapes) / 4) * 0.04 : 1;
            const size = 170;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: 'absolute',
                    left: x - size / 2,
                    top: SHAPE_Y - size / 2,
                    transform: `scale(${inP * breathe * (1 - lerp(f, start, start + 5, 0, 1, ez.inOut))}) rotate(${(1 - inP) * 120 + Math.max(0, Math.min(f, s.form) - s.shapes) * 1.5}deg)`,
                  }}
                >
                  <Shape kind={sh.kind} color={sh.color} size={size} />
                </div>
                {f >= start + 3 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: letterCx(i) - LETTER_BOX / 2,
                      top: WORD_Y,
                      width: LETTER_BOX,
                      textAlign: 'center',
                      fontFamily: DISPLAY,
                      fontSize: 330,
                      lineHeight: 1,
                      color: f >= 370 ? K.white : K.black,
                      mixBlendMode: f >= 370 ? 'difference' : 'normal',
                      transform: `scale(${lerp(f, 360, 390, 1, 1.05, ez.lin)})`,
                      transformOrigin: `${W / 2 - (letterCx(i) - LETTER_BOX / 2)}px 400px`,
                      clipPath: clipFor(sh.kind, Math.min(1, open * 1.15)),
                    }}
                  >
                    {'FORM'[i]}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })
        : null}

      {/* calm hairline */}
      <div style={{position: 'absolute', left: 140, top: SHAPE_Y + 150, width: W - 280, height: 3, backgroundColor: K.black, transform: `scaleX(${lerp(f, s.calm, s.calm + 14, 0, 1, ez.inOut) * (1 - lerp(f, s.studio - 2, s.studio + 6, 0, 1))})`}} />

      {/* STUDIO written by a travelling orange block */}
      {f >= s.studio ? <StudioReveal f={f} start={s.studio} color={f >= 374 ? K.orange : K.black} /> : null}
      <div style={{position: 'absolute', left: 64, top: 250, fontFamily: MONO, fontSize: 26, color: K.black, opacity: 0.7}}>05 / FORM</div>
    </AbsoluteFill>
  );
};

export const STUDIO_Y = WORD_Y + 360;
export const StudioReveal: React.FC<{f: number; start: number; color: string; done?: boolean}> = ({f, start, color, done}) => {
  const head = done ? 1 : lerp(f, start, start + 10, 0, 1, ez.inOut);
  const tail = done ? 1 : lerp(f, start + 5, start + 15, 0, 1, ez.inOut);
  const x0 = 150;
  const x1 = W - 150;
  const bx0 = mix(x0, x1, tail);
  const bx1 = mix(x0, x1, head);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: STUDIO_Y,
          width: W,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: '0.32em',
          paddingLeft: '0.32em',
          color,
          clipPath: `inset(0 ${100 - (bx0 / W) * 100}% 0 0)`,
        }}
      >
        STUDIO
      </div>
      {head > 0 && tail < 1 ? <div style={{position: 'absolute', left: bx0, top: STUDIO_Y - 6, width: Math.max(0, bx1 - bx0), height: 162, backgroundColor: K.orange}} /> : null}
    </>
  );
};
