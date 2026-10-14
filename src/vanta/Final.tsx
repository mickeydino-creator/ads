import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {C, SANS, VantaMark, W, ease, lerp, mix, spr} from './ui';

// 13-15 s: hard cut on the impact to the black end frame. The mark slams in,
// two flat rings echo the hit, the wordmark and tagline cut in on the beat.

const MaskUp: React.FC<{f: number; start: number; children: React.ReactNode; h: number; dur?: number}> = ({f, start, children, h, dur = 10}) => {
  const p = lerp(f, start, start + dur, 0, 1, ease.out);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', height: h, verticalAlign: 'top'}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>{children}</span>
    </span>
  );
};

export const Final: React.FC<{f: number}> = ({f}) => {
  const s = T.impact;
  const mark = spr(f, s, 260, 14);
  const hold = lerp(f, 420, 450, 1, 1.015, ease.inOut);
  const ringA = lerp(f, s, s + 22, 0, 1, ease.out);
  const ringB = lerp(f, s + 5, s + 30, 0, 1, ease.out);
  const word = 'VANTA';
  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${hold})`}}>
        {[ringA, ringB].map((r, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: W / 2 - mix(110, 620, r),
              top: 690 - mix(110, 620, r),
              width: mix(220, 1240, r),
              height: mix(220, 1240, r),
              borderRadius: mix(56, 620, r),
              border: `${i ? 2 : 4}px solid ${C.purple}`,
              opacity: (1 - r) * 0.9,
            }}
          />
        ))}
        <div style={{position: 'absolute', left: W / 2 - 120, top: 570, transform: `scale(${mix(1.6, 1, mark)})`, opacity: Math.min(1, mark * 2)}}>
          <VantaMark size={240} draw={lerp(f, s + 2, s + 14, 0, 1, ease.inOut)} />
        </div>
        <div style={{position: 'absolute', top: 900, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 168, lineHeight: 1, color: C.white, letterSpacing: '0.01em', whiteSpace: 'nowrap'}}>
          {word.split('').map((ch, i) => (
            <MaskUp key={i} f={f} start={s + 3 + i * 2} h={176}>
              {ch}
            </MaskUp>
          ))}
          <span style={{display: 'inline-block', width: 40}} />
          <MaskUp f={f} start={s + 14} h={176}>
            <span style={{color: C.purple}}>AI</span>
          </MaskUp>
        </div>
        <div style={{position: 'absolute', left: W / 2 - 200, top: 1115, width: 400, height: 8, borderRadius: 4, backgroundColor: C.purple, transform: `scaleX(${lerp(f, T.tagline - 4, T.tagline + 10, 0, 1, ease.inOut)})`}} />
        <div style={{position: 'absolute', top: 1170, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.25, letterSpacing: '0.12em', color: C.white}}>
          <MaskUp f={f} start={T.tagline} h={66}>
            WORK SMARTER.
          </MaskUp>
          <br />
          <MaskUp f={f} start={T.tagline + 6} h={66}>
            <span style={{color: C.purple}}>AUTOMATE EVERYTHING.</span>
          </MaskUp>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
