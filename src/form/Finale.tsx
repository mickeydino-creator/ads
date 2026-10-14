import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {Backdrop} from './Backdrop';
import {LETTER_BOX, STUDIO_Y, StudioReveal, WORD_Y, letterCx} from './Signature';
import {DISPLAY, K, UI, W, ez, lerp, mix, pop} from './system';

// 13-15 s: hard cut on the downbeat to black. The wordmark locks, an orange
// accent travels across the frame and settles as the rule under the lockup,
// the two lines land on the beats and a final orange square closes on 14.5 s.

const fin = T.finale;
const RULE_Y = STUDIO_Y + 196;

const Words: React.FC<{f: number; start: number; text: string; style: React.CSSProperties; step?: number; h: number}> = ({f, start, text, style, step = 2, h}) => (
  <div style={{display: 'flex', justifyContent: 'center', gap: '0.28em', ...style}}>
    {text.split(' ').map((w, i) => {
      const p = lerp(f, start + i * step, start + i * step + 8, 0, 1, ez.out);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', height: h}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`}}>{w}</span>
        </span>
      );
    })}
  </div>
);

export const Finale: React.FC<{f: number}> = ({f}) => {
  const lock = pop(f, fin.lock, 380, 14);
  const head = lerp(f, fin.accent, fin.accent + 16, 0, 1, ez.inOut);
  const tail = lerp(f, fin.accent + 6, fin.accent + 22, 0, 1, ez.inOut);
  const ruleL = 150;
  const ruleR = W - 150;
  // the accent enters from off-frame left and leaves its tail at the rule start
  const x1 = mix(-200, ruleR, head);
  const x0 = mix(-200, ruleL, tail);
  const end = pop(f, fin.button, 420, 12);
  const kick = f >= fin.button ? Math.exp(-(f - fin.button) / 4) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 0.6}}>
        <Backdrop f={f} start={fin.lock} base={K.black} dark chips={false} gridStep={120} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${mix(1.06, 1, lock) * (1 + kick * 0.012)})`}}>
        {'FORM'.split('').map((ch, i) => (
          <div key={i} style={{position: 'absolute', left: letterCx(i) - LETTER_BOX / 2, top: WORD_Y, width: LETTER_BOX, textAlign: 'center', fontFamily: DISPLAY, fontSize: 330, lineHeight: 1, color: K.white}}>
            {ch}
          </div>
        ))}
        <StudioReveal f={f} start={0} color={K.orange} done />
        {/* travelling accent -> rule */}
        <div style={{position: 'absolute', left: x0, top: RULE_Y, width: Math.max(0, x1 - x0), height: 14, backgroundColor: K.orange}} />
        <Words f={f} start={fin.line1} text="WE DON'T JUST BUILD WEBSITES." h={66} style={{position: 'absolute', top: RULE_Y + 46, width: W, fontFamily: UI, fontWeight: 700, fontSize: 52, letterSpacing: '0.04em', color: K.white}} />
        <Words f={f} start={fin.line2} text="WE BUILD" step={3} h={140} style={{position: 'absolute', top: RULE_Y + 130, width: W, fontFamily: DISPLAY, fontSize: 140, lineHeight: 1, color: K.white}} />
        <div style={{position: 'absolute', top: RULE_Y + 270, width: W, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
          <Words f={f} start={fin.line2 + 6} text="EXPERIENCES" h={140} style={{fontFamily: DISPLAY, fontSize: 140, lineHeight: 1, color: K.orange}} />
          {/* the full stop of the whole spot, flush to the word, snapping on 14.5 s */}
          <div style={{width: 34, height: 34, marginLeft: 8, marginBottom: 14, backgroundColor: K.orange, transform: `scale(${end}) rotate(${(1 - end) * 90}deg)`}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
