import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {AlbumArt, Art, DISP, H, P, W, bounce, eighth, ez, lerp, mix, onBeat, outline as outlineFx} from './kit';

// 10-13 s: the bass world rushes to the centre; a straight sound wave bends
// into a ring, the ring splits into three, each ring squares off into an album
// frame, and the type locks: YOUR WORLD. rolls over into YOUR SOUND.

const c = T.converge;
const CX = W / 2;
const CY = 640;

// wave line -> ring, point by point
const morphPath = (f: number, t: number, r: number, amp: number) => {
  const n = 160;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const v = Math.sin(u * 40 + f * 0.5) * 0.6 + Math.sin(u * 91 - f * 0.7) * 0.4;
    const lx = mix(-40, W + 40, u);
    const ly = CY + v * amp;
    const a = u * Math.PI * 2 - Math.PI / 2;
    const rr = r + v * amp * 0.5;
    const cx = CX + Math.cos(a) * rr;
    const cy = CY + Math.sin(a) * rr;
    d += `${i ? 'L' : 'M'}${mix(lx, cx, t).toFixed(1)} ${mix(ly, cy, t).toFixed(1)}`;
  }
  return d;
};

const FRAMES: {art: Art; x: number; color: string}[] = [
  {art: 'sun', x: CX - 330, color: P.pink},
  {art: 'moon', x: CX, color: P.purple},
  {art: 'bass', x: CX + 330, color: P.green},
];

// Word roll: the outgoing and incoming words are laid out independently (real
// advance widths); each letter of one rolls up as the matching letter of the
// other rolls in, staggered.
const WordRoll: React.FC<{f: number; start: number; a: string; b: string; colorA: string; colorB: string; size: number}> = ({f, start, a, b, colorA, colorB, size}) => {
  const k = (i: number) => lerp(f, start + i * 1.5, start + i * 1.5 + 8, 0, 1, ez.inOut);
  const row = (word: string, color: string, dir: number) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', display: 'flex', justifyContent: 'center'}}>
      {word.split('').map((ch, i) => (
        <div key={i} style={{fontFamily: DISP, fontWeight: 900, fontSize: size, lineHeight: 1.1, color, transform: `translateY(${dir < 0 ? -k(i) * 110 : (1 - k(i)) * 110}%)`}}>
          {ch}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{position: 'relative', overflow: 'hidden', height: size * 1.1, width: '100%'}}>
      {row(a, colorA, -1)}
      {row(b, colorB, 1)}
    </div>
  );
};

export const Converge: React.FC<{f: number}> = ({f}) => {
  const rush = lerp(f, c.rush, c.rings, 0, 1, ez.in);
  const toRing = lerp(f, c.rush + 2, c.rings, 0, 1, ez.inOut);
  const split = lerp(f, c.rings, c.frames, 0, 1, ez.inOut);
  const square = lerp(f, c.frames - 4, c.frames + 6, 0, 1, ez.inOut);
  const reveal = lerp(f, c.frames + 2, c.frames + 10, 0, 1, ez.out);
  const k8 = eighth(f, c.rush);
  const out = lerp(f, 380, T.s5, 0, 1, ez.in);
  const kb = onBeat(f, c.world);
  return (
    <AbsoluteFill style={{backgroundColor: P.black, overflow: 'hidden'}}>
      {/* rushing bars from the bass world, collapsing into the centre */}
      {rush < 1
        ? new Array(7).fill(0).map((_, i) => {
            const x = mix(90 + i * 135 + 50, CX, rush);
            const y = mix(1100, CY, rush);
            const h = mix(400, 20, rush);
            return <div key={i} style={{position: 'absolute', left: x - 50 * (1 - rush), top: y - h / 2, width: 100 * (1 - rush) + 6, height: h, backgroundColor: i % 3 === 1 ? P.white : P.green}} />;
          })
        : null}
      {/* wave -> ring -> three rings */}
      {f < c.frames + 2 ? (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          {split <= 0 ? (
            <path d={morphPath(f, toRing, 150, mix(220, 40, toRing) * (1 + k8 * 0.3))} stroke={P.green} strokeWidth={12} fill="none" strokeLinejoin="round" />
          ) : (
            FRAMES.map((fr, i) => (
              <g key={i} transform={`translate(${(fr.x - CX) * split} 0)`}>
                <path d={morphPath(f + i * 7, 1, 150, 40 * (1 - split) + 10)} stroke={fr.color} strokeWidth={12} fill="none" opacity={1 - square} />
              </g>
            ))
          )}
        </svg>
      ) : null}
      {/* rings square off into album frames */}
      {f >= c.frames - 4
        ? FRAMES.map((fr, i) => {
            const size = mix(300, 300, square);
            const shuffle = lerp(f, c.sound, c.sound + 10, 0, 1, ez.inOut);
            const x = mix(fr.x, FRAMES[(i + 1) % 3].x, shuffle) - Math.sin(shuffle * Math.PI) * 0;
            const y = CY - Math.sin(shuffle * Math.PI) * (i === 2 ? -140 : 140);
            const pop = 1 + kb * 0.05;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - size / 2 + (CX - x) * out,
                  top: y - size / 2 + (960 - y) * out,
                  width: size,
                  height: size,
                  borderRadius: mix(size / 2, 26, square),
                  border: `10px solid ${fr.color}`,
                  overflow: 'hidden',
                  transform: `scale(${pop * (1 - out * 0.9)}) rotate(${(i - 1) * 6 * square}deg)`,
                  opacity: square,
                }}
              >
                <div style={{position: 'absolute', inset: 0, clipPath: `circle(${reveal * 75}% at 50% 50%)`}}>
                  <AlbumArt art={fr.art} f={f} size={size - 20} />
                </div>
              </div>
            );
          })
        : null}
      {/* YOUR WORLD. -> YOUR SOUND. with motion-trail entries */}
      {f >= c.world - 6 ? (
        <div style={{position: 'absolute', top: 1000, width: W, transform: `scale(${1 - out * 0.9})`, transformOrigin: '50% 0%', opacity: 1 - out}}>
          {[2, 1, 0].map((g) => {
            const k = bounce(f - g * 1.5, c.world - 6, 360, 15);
            return (
              <div key={g} style={{position: 'absolute', left: 0, width: W, textAlign: 'center', fontFamily: DISP, fontWeight: 900, fontSize: 190, lineHeight: 1, color: g ? P.black : P.white, textShadow: g ? outlineFx(g === 1 ? P.pink : P.purple, 3) : undefined, transform: `translateX(${(1 - k) * -1100}px)`, opacity: g ? (1 - k) * 0.9 : 1}}>
                YOUR
              </div>
            );
          })}
          <div style={{position: 'absolute', top: 230, width: W, transform: `translateX(${(1 - bounce(f, c.world, 360, 15)) * 1100}px)`}}>
            <WordRoll f={f} start={c.sound} a="WORLD." b="SOUND." colorA={P.green} colorB={P.pink} size={150} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
