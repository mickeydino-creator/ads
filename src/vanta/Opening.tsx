import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, SANS, W, ease, lerp, mix, spr} from './ui';

// 0-3 s: TOO -> MANY -> TASKS? Typographic transformations on the beat,
// a white cut-in with the giant "?", whose dot becomes the purple iris.

const Word: React.FC<{text: string; size: number; color?: string; outline?: boolean; style?: React.CSSProperties}> = ({
  text,
  size,
  color = C.white,
  outline,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 0.9,
      letterSpacing: '-0.03em',
      color: outline ? 'transparent' : color,
      WebkitTextStroke: outline ? `5px ${color}` : undefined,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

const Centered: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', top: y, left: 0, width: W, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

export const Opening: React.FC<{f: number}> = ({f}) => {
  // ---- beat 1 (0-15): TOO, split mask - top half from left, bottom half from right
  const tooIn = lerp(f, 0, 7, 1, 0, ease.out);
  // ---- beat 2 (15-30): purple bar wipes TOO into MANY
  const barIn = lerp(f, 15, 21, 0, 1, ease.inOut);
  const barOut = lerp(f, 21, 27, 0, 1, ease.inOut);
  // ---- beat 3 (30-45): stack reflows, TASKS? letters drop in
  const stack = spr(f, 30, 220, 20);
  const tasksLetters = 'TASKS?'.split('');
  // ---- 45-60: outline transform + echoes
  const outlineMany = f >= 45;
  const underline = lerp(f, 44, 54, 0, 1, ease.out);
  // ---- white cut-in (60-90)
  const white = f >= 60;

  if (white) {
    const qIn = spr(f, 60, 200, 18);
    const dotGrow = lerp(f, 76, 90, 0, 1, ease.in);
    const qFade = lerp(f, 76, 82, 1, 0, ease.inOut);
    // question-mark glyph geometry (approximate dot position for the 900px "?")
    // measured centre/radius of the glyph's dot at rest
    const dotX = 542;
    const dotY = 1143;
    const r = mix(113, 2300, dotGrow);
    return (
      <AbsoluteFill style={{backgroundColor: C.paper, overflow: 'hidden'}}>
        {/* side labels: the task pile, set small and fast */}
        {[
          ['EMAILS', 260],
          ['INVOICES', 330],
          ['REPORTS', 1400],
          ['APPROVALS', 1470],
          ['UPDATES', 1540],
        ].map(([t, y], i) => {
          const p = lerp(f, 62 + i * 2, 72 + i * 2, 0, 1);
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: i % 2 ? undefined : 70,
                right: i % 2 ? 70 : undefined,
                top: y as number,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: '0.18em',
                color: C.ink,
                opacity: p * qFade,
                transform: `translateX(${(1 - p) * (i % 2 ? 80 : -80)}px)`,
              }}
            >
              {t}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 380,
            width: W,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 1000,
            lineHeight: 1,
            color: C.ink,
            transform: `translateY(${(1 - qIn) * 300}px) rotate(${(1 - qIn) * -18}deg)`,
            opacity: qFade,
          }}
        >
          ?
        </div>
        <div
          style={{
            position: 'absolute',
            left: dotX - r,
            top: dotY - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: C.purple,
            opacity: f >= 76 ? 1 : 0,
          }}
        />
      </AbsoluteFill>
    );
  }

  const tooY = mix(760, 470, stack);
  const tooSize = mix(330 * (1 + lerp(f, 6, 21, 0, 0.08, ease.out)), 230, stack);
  const manyY = mix(760, 690, stack);
  const manySize = mix(330, 230, stack);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
      {/* TOO: split mask entrance, then hidden behind the bar, returns in the stack */}
      {f < 21 || f >= 30 ? (
        <Centered y={tooY}>
          <div style={{position: 'relative'}}>
            <div style={{clipPath: 'inset(0 0 50% 0)', transform: `translateX(${-tooIn * 700}px)`}}>
              <Word text="TOO" size={tooSize} />
            </div>
            <div style={{position: 'absolute', top: 0, clipPath: 'inset(50% 0 0 0)', transform: `translateX(${tooIn * 700}px)`}}>
              <Word text="TOO" size={tooSize} />
            </div>
          </div>
        </Centered>
      ) : null}
      {f >= 21 ? (
        <Centered y={manyY}>
          <Word text="MANY" size={manySize} outline={outlineMany} color={outlineMany ? C.purple : C.white} />
        </Centered>
      ) : null}
      {/* TASKS?: letters drop with overshoot, one per 16th */}
      {f >= 30 ? (
        <Centered y={910}>
          <div style={{display: 'flex'}}>
            {tasksLetters.map((ch, i) => {
              const p = spr(f, 30 + i * 3, 280, 19);
              return (
                <div key={i} style={{overflow: 'hidden', height: 220}}>
                  <div style={{transform: `translateY(${(1 - p) * -230}px)`}}>
                    <Word text={ch} size={220} color={ch === '?' ? C.purple : C.white} />
                  </div>
                </div>
              );
            })}
          </div>
        </Centered>
      ) : null}
      {/* echoes of TASKS? stepping down on the 8th notes */}
      {[52, 56].map((s, i) =>
        f >= s ? (
          <Centered key={s} y={910 + (i + 1) * 230}>
            <div style={{clipPath: `inset(0 0 ${(1 - lerp(f, s, s + 4, 0, 1)) * 100}% 0)`}}>
              <Word text="TASKS?" size={220} outline color={i ? '#3a3a44' : '#6a6a76'} />
            </div>
          </Centered>
        ) : null,
      )}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 1150,
          width: W - 240,
          height: 14,
          backgroundColor: C.purple,
          transform: `scaleX(${underline})`,
          transformOrigin: 'left',
          opacity: f < 52 ? 1 : 0,
        }}
      />
      {/* the wipe bar */}
      {f >= 15 && f < 27 ? (
        <div
          style={{
            position: 'absolute',
            top: 700,
            height: 440,
            left: 0,
            width: W,
            backgroundColor: C.purple,
            transform: `scaleX(${f < 21 ? barIn : 1 - barOut})`,
            transformOrigin: f < 21 ? 'left' : 'right',
          }}
        />
      ) : null}
      {/* frame counter detail, top-left */}
      <div style={{position: 'absolute', left: 64, top: 250, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', color: C.grey}}>
        {`MONDAY 09:${String(Math.min(59, Math.floor(f * 0.8))).padStart(2, '0')}`}
      </div>
    </AbsoluteFill>
  );
};

export {H};
