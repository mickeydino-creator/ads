import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {IRIS} from './Open';
import {ALBUMS, AlbumArt, BODY, DISP, H, P, PlayGlyph, SkipGlyph, W, bounce, eighth, ez, lerp, mix, onBeat} from './kit';

// 3-6 s: the iris settles into album art and a player assembles around it:
// card, title, progress, controls, queue. Then it breaks apart into a
// colour-block composition whose pink circle becomes the sun of world one.

const p = T.player;
export const CARD = {x: 110, y: 290, w: 860, h: 1330};
export const ART = {x: 240, y: 340, s: 600};
const QUEUE = [
  {t: 'Afterglow', a: 'Lumen Vale', c: P.pink},
  {t: 'Static Love', a: 'Mira Kode', c: P.green},
  {t: 'Low Tide', a: 'Halo Park', c: P.purple},
];
const time = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

// element offsets after the breakup (direction, rotation)
const flyAway = (f: number, k: number, dx: number, dy: number, rot: number) => {
  const b = lerp(f, p.breakup + k, p.breakup + 12 + k, 0, 1, ez.in);
  return `translate(${dx * b}px, ${dy * b}px) rotate(${rot * b}deg)`;
};

const BLOCKS = [
  {x: 0, y: 0, w: 620, h: 700, c: P.green, from: [-1, 0]},
  {x: 620, y: 0, w: 460, h: 420, c: P.purple, from: [1, 0]},
  {x: 620, y: 420, w: 460, h: 600, c: P.black, from: [0, -1]},
  {x: 0, y: 700, w: 380, h: 760, c: P.purple, from: [-1, 0]},
  {x: 380, y: 1020, w: 700, h: 440, c: P.white, from: [0, 1]},
  {x: 0, y: 1460, w: 1080, h: 460, c: P.pink, from: [0, 1]},
];
export const SUN = {cx: 640, cy: 840, r: 300};

export const Player: React.FC<{f: number}> = ({f}) => {
  // circle (iris) -> rounded square
  const m = lerp(f, p.art, p.art + 12, 0, 1, ez.inOut);
  const size = mix(IRIS.r * 2, ART.s, m);
  const ax = mix(IRIS.cx - IRIS.r, ART.x, m);
  const ay = mix(IRIS.cy - IRIS.r, ART.y, m);
  const radius = mix(size / 2, 28, m);
  const card = lerp(f, p.art + 2, p.art + 12, 0, 1, ez.out);
  const prog = f < p.scrub ? lerp(f, p.progress, p.progress + 10, 0, 0.18) : lerp(f, p.scrub, p.breakup, 0.18, 0.62, ez.inOut);
  const beat = eighth(f, p.art);
  const composeOn = f >= p.compose;
  const playerOn = f < p.compose + 3;
  return (
    <AbsoluteFill style={{backgroundColor: f >= p.breakup + 4 ? P.purple : P.black, overflow: 'hidden'}}>
      {/* concentric rings behind the player, pulsing on the 8ths */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: W / 2 - (420 + i * 170), top: 640 - (420 + i * 170), width: (420 + i * 170) * 2, height: (420 + i * 170) * 2, borderRadius: '50%', border: `3px solid ${[P.purple, P.pink, P.green][i]}`, opacity: 0.35 * card * (1 - lerp(f, p.breakup, p.breakup + 6, 0, 1)), transform: `scale(${1 + beat * 0.03 * (3 - i)})`}} />
      ))}

      {playerOn ? (
        <>
          {/* card */}
          <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 48, backgroundColor: P.ink2, transform: `${flyAway(f, 0, 0, 1400, 8)} scale(${mix(0.6, 1, card)})`, opacity: card}} />
          {/* album art */}
          <div style={{position: 'absolute', left: ax, top: ay, width: size, height: size, borderRadius: radius, overflow: 'hidden', transform: `${flyAway(f, 1, -900, -600, -30)} scale(${1 + onBeat(f, p.art) * 0.035})`}}>
            <AlbumArt art="neon" f={f} size={size} label={m > 0.98} />
          </div>
          {/* title + artist */}
          <div style={{position: 'absolute', left: ART.x, top: 980, clipPath: `inset(0 ${(1 - lerp(f, p.title, p.title + 9, 0, 1)) * 100}% 0 0)`, transform: flyAway(f, 2, 1200, -200, 12)}}>
            <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 60, color: P.white, whiteSpace: 'nowrap', transform: `translateY(${-onBeat(f, p.art) * 8}px)`}}>{ALBUMS.neon.title}</div>
            <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34, color: P.mute, marginTop: 6}}>{ALBUMS.neon.artist}</div>
          </div>
          {/* progress */}
          <div style={{position: 'absolute', left: ART.x, top: 1140, width: ART.s, transform: flyAway(f, 3, -1200, 300, -10)}}>
            <div style={{height: 10, borderRadius: 5, backgroundColor: '#34323a', transform: `scaleX(${lerp(f, p.progress, p.progress + 8, 0, 1)})`, transformOrigin: 'left'}} />
            <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: ART.s * prog, borderRadius: 5, backgroundColor: P.green}} />
            <div style={{position: 'absolute', left: ART.s * prog - 14, top: -9, width: 28, height: 28, borderRadius: 14, backgroundColor: P.white, transform: `scale(${lerp(f, p.progress + 4, p.progress + 10, 0, 1) * (1 + beat * 0.25)})`}} />
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, fontFamily: BODY, fontWeight: 600, fontSize: 26, color: P.mute, opacity: lerp(f, p.progress + 4, p.progress + 10, 0, 1)}}>
              <span>{time(prog * 214)}</span>
              <span>3:34</span>
            </div>
          </div>
          {/* controls */}
          <div style={{position: 'absolute', left: ART.x, top: 1230, width: ART.s, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {[0, 1, 2].map((i) => {
              const b = bounce(f, p.controls + i * 2, 420, 12);
              const isPlay = i === 1;
              return (
                <div key={i} style={{transform: `${flyAway(f, 4 + i, (i - 1) * 900, 700, (i - 1) * 40)} scale(${b * (isPlay ? 1 + beat * 0.08 : 1)})`}}>
                  {isPlay ? (
                    <div style={{width: 130, height: 130, borderRadius: 65, backgroundColor: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <PlayGlyph size={70} color={P.black} />
                    </div>
                  ) : (
                    <SkipGlyph size={70} color={P.white} back={i === 0} />
                  )}
                </div>
              );
            })}
          </div>
          {/* queue */}
          {QUEUE.map((q, i) => {
            const st = p.tracks[i];
            const inP = bounce(f, st, 320, 15);
            return (
              <div key={q.t} style={{position: 'absolute', left: ART.x, top: 1400 + i * 64, width: ART.s, height: 54, display: 'flex', alignItems: 'center', gap: 18, transform: `${flyAway(f, 6 + i, 1000, (i - 1) * 300, 20)} translateX(${(1 - inP) * 900}px)`, opacity: f >= st ? 1 : 0}}>
                <div style={{width: 54, height: 54, borderRadius: 10, backgroundColor: q.c}} />
                <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 28, color: P.white}}>{q.t}</div>
                <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 24, color: P.mute}}>{q.a}</div>
                {i === 0 ? (
                  <div style={{marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'flex-end', height: 30}}>
                    {[0, 1, 2, 3].map((k) => (
                      <div key={k} style={{width: 7, height: 8 + 22 * Math.abs(Math.sin(f / 3 + k)), backgroundColor: P.green, borderRadius: 2}} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {/* the composition: colour blocks slam in on the 8ths, a giant pink disc grows into the sun */}
      {composeOn
        ? BLOCKS.map((b, i) => {
            const t0 = p.compose + (i % 3) * 2.5;
            const k = bounce(f, t0, 380, 16);
            if (f < t0) return null;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x + b.from[0] * (1 - k) * 1100,
                  top: b.y + b.from[1] * (1 - k) * 1900,
                  width: b.w,
                  height: b.h,
                  backgroundColor: b.c,
                }}
              />
            );
          })
        : null}
      {composeOn ? (
        <>
          <div style={{position: 'absolute', left: 60, top: 300, fontFamily: DISP, fontWeight: 900, fontSize: 200, lineHeight: 0.9, color: P.black, transform: `translateX(${(1 - bounce(f, p.compose + 2, 380, 14)) * -900}px)`}}>
            TURN
            <br />
            IT UP
          </div>
          {(() => {
            const g = lerp(f, p.compose + 12, T.s3, 0, 1, ez.inOut);
            return <div style={{position: 'absolute', left: SUN.cx - SUN.r * g, top: SUN.cy - SUN.r * g, width: SUN.r * 2 * g, height: SUN.r * 2 * g, borderRadius: '50%', backgroundColor: P.pink, border: `${10 * g}px solid ${P.black}`}} />;
          })()}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export {H};
