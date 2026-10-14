import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {BODY, DISP, H, P, PlayGlyph, W, bounce, ez, lerp, mix, ringPath} from './kit';

// 13-15 s: hard cut on the downbeat. EVERY MOOD. / EVERY BEAT. drop in on
// the beats, a player bar fills to the end of the track and closes on 14.5 s.
// Clearly labelled as an unofficial portfolio concept.

const fin = T.final;
const LINES = [
  {t: 'EVERY', c: P.white, y: 360, start: fin.mood},
  {t: 'MOOD.', c: P.pink, y: 520, start: fin.mood + 3},
  {t: 'EVERY', c: P.white, y: 720, start: fin.beat},
  {t: 'BEAT.', c: P.green, y: 880, start: fin.beat + 3},
];

export const Final: React.FC<{f: number}> = ({f}) => {
  const fill = lerp(f, fin.fill, fin.full, 0, 1, ez.inOut);
  const done = f >= fin.full;
  const pulse = lerp(f, fin.full, fin.full + 14, 0, 1, ez.out);
  const ring = bounce(f, fin.cut, 200, 18);
  return (
    <AbsoluteFill style={{backgroundColor: P.black, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}}>
        <path d={ringPath(f, W / 2, 700, 430 * ring, 22, 14)} stroke={P.purple} strokeWidth={6} fill="none" />
        <path d={ringPath(f + 9, W / 2, 700, 500 * ring, 16, 9)} stroke={P.pink} strokeWidth={3} fill="none" />
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 250, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: '0.24em', color: P.mute}}>MUSIC IN MOTION · PORTFOLIO CONCEPT</div>
      {LINES.map((L) => (
        <div key={L.y} style={{position: 'absolute', top: L.y, width: W, display: 'flex', justifyContent: 'center'}}>
          {L.t.split('').map((ch, i) => {
            const k = bounce(f, L.start + i * 0.8, 440, 14);
            return (
              <div key={i} style={{overflow: 'hidden', height: 170}}>
                <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 150, lineHeight: 1.12, color: L.c, transform: `translateY(${(1 - k) * -110}%)`}}>{ch}</div>
              </div>
            );
          })}
        </div>
      ))}
      {/* the player bar closing the spot */}
      <div style={{position: 'absolute', left: 110, top: 1130, width: 860, opacity: lerp(f, fin.fill - 4, fin.fill + 2, 0, 1)}}>
        <div style={{height: 12, borderRadius: 6, backgroundColor: '#2a2830'}} />
        <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: 860 * fill, borderRadius: 6, backgroundColor: P.green}} />
        <div style={{position: 'absolute', left: 860 * fill - 18, top: -12, width: 36, height: 36, borderRadius: 18, backgroundColor: P.white}} />
        {done ? <div style={{position: 'absolute', left: 860 - 18 - 60 * pulse, top: -12 - 60 * pulse, width: 36 + 120 * pulse, height: 36 + 120 * pulse, borderRadius: '50%', border: `4px solid ${P.green}`, opacity: 1 - pulse}} /> : null}
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 24, fontFamily: BODY, fontWeight: 600, fontSize: 26, color: P.mute}}>
          <span>{`0:${String(13 + Math.floor(fill * 2)).padStart(2, '0')}`}</span>
          <span>0:15</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: W / 2 - 70, top: 1230, width: 140, height: 140, borderRadius: 70, backgroundColor: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${bounce(f, fin.fill, 380, 12) * (done ? 1 + 0.12 * Math.exp(-(f - fin.full) / 4) : 1)})`}}>
        {done ? (
          <div style={{display: 'flex', gap: 16}}>
            <div style={{width: 18, height: 60, backgroundColor: P.black, borderRadius: 4}} />
            <div style={{width: 18, height: 60, backgroundColor: P.black, borderRadius: 4}} />
          </div>
        ) : (
          <PlayGlyph size={76} color={P.black} />
        )}
      </div>
      <div style={{position: 'absolute', top: 1440, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 25, lineHeight: 1.45, color: P.mute, opacity: lerp(f, fin.legal, fin.legal + 8, 0, 1), transform: `translateY(${lerp(f, fin.legal, fin.legal + 10, 16, 0)}px)`}}>
        Unofficial portfolio concept inspired by Spotify.
        <br />
        Not affiliated with or endorsed by Spotify.
      </div>
    </AbsoluteFill>
  );
};

export {mix};
