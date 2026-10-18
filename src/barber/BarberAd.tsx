import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {AfterPoster, Flyer, KEYS, Name17, Pill} from './Flyer';
import {H, K, Plane, SERIF, Scissors, Stripes, Txt, UI, W, ez, lerp, mix, pop} from './system';

const hk = T.hook;
const rs = T.restyle;
const ad = T.ad;
const cp = T.compare;
const en = T.end;

// ---------------- 0-5 s: loud flyer, tear-away, restyle ----------------

const STRIPS = 6;

const Opening: React.FC<{f: number}> = ({f}) => {
  const pops = hk.jolt.map((at) => pop(f, at, 420, 12));
  const jolt = hk.jolt.reduce((acc, at) => acc + (f >= at ? Math.exp(-(f - at) / 3) : 0), 0);
  const torn = f >= hk.strips;
  const stripH = H / STRIPS;

  // hook band: slides in from the right, leaves to the left on the tear
  const bandIn = 0;
  const bandPop = pop(f, hk.band, 380, 14);
  const bandOut = lerp(f, hk.tear, hk.tear + 9, 0, -W * 1.1, ez.in);

  // header that replaces the hook
  const head = lerp(f, rs.header, rs.header + 14, 0, 1);
  const headOut = lerp(f, ad.start, ad.start + 10, 0, 1, ez.in);

  // the thin rule under the clean wordmark
  const rule = lerp(f, rs.travel + 30, rs.travel + 44, 0, 1, ez.inOut);

  return (
    <AbsoluteFill style={{backgroundColor: f < ad.start ? K.paper : 'transparent'}}>
      {/* flyer: whole until the tear, then six strips peel off */}
      {!torn ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + jolt * 0.018}) rotate(${jolt * 0.5}deg)`}}>
          <Flyer hideKeys pops={pops} />
        </div>
      ) : (
        new Array(STRIPS).fill(0).map((_, i) => {
          const at = hk.strips + i * 2;
          const dir = i % 2 ? 1 : -1;
          const p = lerp(f, at, at + 13, 0, 1, ez.in);
          if (p >= 1) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(${i * stripH}px 0 ${H - (i + 1) * stripH - 1}px 0)`,
                transform: `translateX(${dir * p * W * 1.15}px) rotate(${dir * p * 4}deg)`,
              }}
            >
              <Flyer hideKeys pops={[1, 1, 1]} />
            </div>
          );
        })
      )}

      {/* the content that survives travels into the clean layout */}
      {KEYS.map((k, i) => {
        const start = rs.travel + i * 3;
        const t = lerp(f, start, start + 26, 0, 1, ez.inOut);
        const x = mix(k.before.x, k.after.x, t);
        const y = mix(k.before.y, k.after.y, t);
        const rot = mix(k.before.rot, k.after.rot, t);
        const squash = 1 - 0.14 * Math.sin(Math.PI * t);
        const xf = lerp(t, 0.38, 0.62, 0, 1, ez.lin);
        const shake = f < hk.tear ? hk.jolt.reduce((acc, at) => acc + (f >= at ? Math.exp(-(f - at) / 3) : 0), 0) : 0;
        // exit when the ad takes over (the name stays, handled by <AdScene>)
        const exit = k.id === 'name' ? 0 : lerp(f, ad.start + i * 2, ad.start + i * 2 + 12, 0, 1, ez.in);
        if (k.id === 'name' && f >= ad.start) return null;
        return (
          <React.Fragment key={k.id}>
            <Txt x={x} y={y + exit * 500} opacity={(1 - xf) * (1 - exit)} transform={`rotate(${rot + shake * 0.5}deg) scale(${squash * (1 + shake * 0.018)})`}>
              <k.Before />
            </Txt>
            <Txt x={x} y={y + exit * 500} opacity={xf * (1 - exit)} transform={`rotate(${rot}deg) scale(${squash})`}>
              <k.After />
            </Txt>
          </React.Fragment>
        );
      })}

      {/* separator dot between the two services and the rule */}
      <Txt x={518} y={885} opacity={lerp(f, rs.travel + 30, rs.travel + 38, 0, 1) * (1 - lerp(f, ad.start, ad.start + 8, 0, 1))} style={{fontFamily: UI, fontSize: 70, color: K.accent}}>
        ·
      </Txt>
      <div
        style={{
          position: 'absolute',
          left: 540 - 260 * rule,
          width: 520 * rule,
          top: 775,
          height: 4,
          backgroundColor: K.ink,
          opacity: 1 - lerp(f, ad.start, ad.start + 8, 0, 1),
        }}
      />

      {/* hook band */}
      {f >= hk.band && f < hk.tear + 10 ? (
        <div style={{position: 'absolute', left: 0, top: 236, width: W, height: 180, backgroundColor: K.ink, transform: `translateX(${bandIn + bandOut}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: UI, fontWeight: 800, fontSize: 76, color: K.paper, direction: 'rtl', display: 'inline-block', transform: `scale(${mix(1.25, 1, bandPop)})`}}>ככה נראית הפרסומת שלך?</span>
        </div>
      ) : null}

      {f >= rs.header ? (
        <Txt x={540} y={330 - headOut * 200} opacity={head * (1 - headOut)} transform={`translateY(${(1 - head) * 40}px)`} style={{fontFamily: UI, fontWeight: 700, fontSize: 66, color: K.ink}}>
          ככה היא יכולה להיראות<span style={{color: K.accent}}>.</span>
        </Txt>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 5-11 s: the ad itself ----------------

const WORDS = ['תספורת', 'זקן', 'קו נקי', 'גוונים', 'סטייל'];
const WORD_Y = 1080;

const Word: React.FC<{text: string; half?: 'top' | 'bottom'; style?: React.CSSProperties}> = ({text, half, style}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      clipPath: half === 'top' ? 'inset(0 0 50% 0)' : half === 'bottom' ? 'inset(50% 0 0 0)' : undefined,
      ...style,
    }}
  >
    <Txt x={540} y={WORD_Y} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 200, color: K.ink}}>
      {text}
      <span style={{color: K.accent}}>.</span>
    </Txt>
  </div>
);

const AdScene: React.FC<{f: number}> = ({f}) => {
  const shift = -f * 5;
  // wordmark rises into place
  const up = lerp(f, ad.start, ad.start + 12, 0, 1, ez.inOut);
  const nameY = mix(640, 440, up);
  const nameS = mix(1, 1.08, up);

  // stripe band: opens right to left, then floods the frame on the drop, then leaves upward
  const open = lerp(f, ad.band, ad.band + 14, 0, 1, ez.out);
  const flood = lerp(f, ad.drop - 6, ad.drop, 0, 1, ez.in);
  const leave = lerp(f, ad.drop + 12, ad.open + 8, 0, 1, ez.inOut);
  const bandTop = mix(600, 0, flood);
  const bandH = mix(170, H, flood);

  // which word, and the cut between words
  const cuts = ad.words;
  let idx = 0;
  cuts.forEach((c) => {
    if (f >= c) idx++;
  });
  const lastCut = idx > 0 ? cuts[idx - 1] : -100;
  const since = f - lastCut;
  const wordIn = idx === 0 ? pop(f, 176, 300, 16) : pop(f, lastCut + 1, 340, 15);
  const wordsOut = lerp(f, ad.gather, ad.gather + 8, 0, 1, ez.in);

  // scissors: enter from the left, snip on each cut, then go to centre for the drop
  const sIn = lerp(f, 168, 184, -300, 120, ez.out);
  const next = cuts.find((c) => c >= f) ?? ad.drop;
  const toNext = next - f;
  const snipOpen = f < ad.gather ? (toNext <= 6 ? toNext / 6 : 1) : f < ad.drop ? lerp(f, ad.drop - 6, ad.drop, 1, 0, ez.in) : 0;
  const gather = lerp(f, ad.gather, ad.gather + 12, 0, 1, ez.inOut);
  const sx = mix(sIn, 540, gather);
  const sy = mix(WORD_Y, 1020, gather);
  const sSize = mix(200, 420, gather);

  // cut line racing across the word just before each cut
  const lineP = f < ad.gather && toNext <= 4 ? 1 - toNext / 4 : 0;

  // "open also on Friday" stack after the flood
  const stack = ['פתוח', 'גם', 'בשישי'];
  const stackY = [720, 940, 1170];

  return (
    <AbsoluteFill style={{backgroundColor: K.paper}}>
      {f < ad.drop ? (
        <Txt x={540} y={nameY} transform={`scale(${nameS})`}>
          <Name17 />
        </Txt>
      ) : null}

      {/* words + their cut halves */}
      {f >= 176 && f < ad.gather + 8 ? (
        <>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - wordsOut, transform: `scale(${mix(0.86, 1, wordIn)})`, transformOrigin: `540px ${WORD_Y}px`}}>
            <Word text={WORDS[idx]} />
          </div>
          {idx > 0 && since < 12 ? (
            <>
              <Word text={WORDS[idx - 1]} half="top" style={{transform: `translate(${-since * 6}px, ${-since * 9}px) rotate(${-since * 0.4}deg)`, opacity: 1 - since / 12}} />
              <Word text={WORDS[idx - 1]} half="bottom" style={{transform: `translate(${since * 6}px, ${since * 9}px) rotate(${since * 0.4}deg)`, opacity: 1 - since / 12}} />
            </>
          ) : null}
        </>
      ) : null}
      {lineP > 0 ? <div style={{position: 'absolute', left: 200, top: WORD_Y - 2, width: 760 * lineP, height: 4, backgroundColor: K.accent}} /> : null}

      {f < ad.drop + 2 && f >= 168 ? (
        <div style={{position: 'absolute', left: sx - sSize / 2, top: sy - sSize / 2}}>
          <Scissors size={sSize} open={snipOpen} />
        </div>
      ) : null}

      {/* stripe band */}
      {f >= ad.band && leave < 1 ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: bandTop - leave * H,
            width: W * open,
            height: bandH,
            borderTop: `5px solid ${K.ink}`,
            borderBottom: `5px solid ${K.ink}`,
            overflow: 'hidden',
          }}
        >
          <Stripes shift={shift} w={mix(56, 110, flood)} />
        </div>
      ) : null}

      {/* the Friday stack */}
      {f >= ad.stack[0]
        ? stack.map((w, i) => {
            const p = pop(f, ad.stack[i], 280, 16);
            const out = lerp(f, cp.split - 4 + i, cp.split + 4 + i, 0, 1, ez.in);
            return (
              <div key={w} style={{position: 'absolute', left: 0, right: 0, top: stackY[i] - 140, height: 280, overflow: 'hidden'}}>
                <Txt x={540} y={140 + (1 - p) * 260 - out * 300} opacity={1 - out} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250, color: i === 2 ? K.accent : K.ink}}>
                  {w}
                  {i === 2 ? <span style={{color: K.ink}}>.</span> : null}
                </Txt>
              </div>
            );
          })
        : null}
      {f >= ad.stack[2] + 6 ? (
        <Txt x={540} y={1380} opacity={lerp(f, ad.stack[2] + 6, ad.stack[2] + 14, 0, 1) * (1 - lerp(f, cp.split, cp.split + 6, 0, 1))} style={{fontFamily: UI, fontWeight: 500, fontSize: 44, color: K.muted}}>
          רחוב הגפן 17
        </Txt>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 11-13 s: before / after ----------------

const THUMB = 0.4;
const TW = W * THUMB;
const TH = H * THUMB;

const Compare: React.FC<{f: number}> = ({f}) => {
  const inB = lerp(f, cp.split, cp.split + 14, 0, 1, ez.out);
  const inA = lerp(f, cp.split + 3, cp.split + 17, 0, 1, ez.out);
  const labels = lerp(f, cp.labels, cp.labels + 10, 0, 1);
  const cut = lerp(f, cp.cut, cp.cut + 5, 0, 1, ez.inOut);
  const fall = lerp(f, cp.cut + 5, cp.cut + 20, 0, 1, ez.in);
  const grow = lerp(f, cp.grow, cp.wipe, 0, 1, ez.inOut);

  // before on the right (read first in Hebrew), after on the left
  const bx = 790;
  const ax = mix(290, 540, grow);
  const cy = 960;
  const aScale = mix(THUMB, 1, grow);
  const ay = mix(cy, H / 2, grow);

  return (
    <AbsoluteFill>
      {fall < 1 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: bx - TW / 2,
              top: cy - TH / 2 - (1 - inB) * 1400 + fall * 1500,
              width: TW,
              height: TH,
              overflow: 'hidden',
              border: `4px solid ${K.ink}`,
              transform: `rotate(${fall * 18}deg)`,
            }}
          >
            <div style={{width: W, height: H, transform: `scale(${THUMB})`, transformOrigin: '0 0', position: 'relative'}}>
              <Flyer />
            </div>
          </div>
          <Txt x={bx} y={cy - TH / 2 - 80} opacity={labels * (1 - fall)} style={{fontFamily: UI, fontWeight: 800, fontSize: 64, color: K.ink}}>
            לפני
          </Txt>
        </>
      ) : null}
      {/* the scissors cut line across the old flyer */}
      {cut > 0 && fall < 0.3 ? <div style={{position: 'absolute', left: bx + TW / 2 - (TW + 60) * cut, top: cy, width: (TW + 60) * cut, height: 6, backgroundColor: K.accent}} /> : null}

      <Txt x={290} y={cy - TH / 2 - 80} opacity={labels * (1 - grow * 3)} style={{fontFamily: UI, fontWeight: 800, fontSize: 64, color: K.accent}}>
        אחרי
      </Txt>
      <div
        style={{
          position: 'absolute',
          left: ax - (W * aScale) / 2,
          top: ay - (H * aScale) / 2 + (1 - inA) * 1400,
          width: W * aScale,
          height: H * aScale,
          overflow: 'hidden',
          border: `${4 * (1 - grow)}px solid ${K.ink}`,
        }}
      >
        <div style={{width: W, height: H, transform: `scale(${aScale})`, transformOrigin: '0 0', position: 'relative'}}>
          <AfterPoster shift={-f * 5} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 13-15 s: end frame ----------------

const EndFrame: React.FC<{f: number}> = ({f}) => {
  // paper rises over the grown poster
  const wipe = lerp(f, cp.wipe, en.line1, 0, 1, ez.inOut);
  const l1 = lerp(f, en.line1, en.line1 + 12, 0, 1);
  const l2 = lerp(f, en.line2, en.line2 + 12, 0, 1);
  const pill = pop(f, en.pill, 320, 15);
  const hop = f >= en.plane ? Math.sin(Math.min(1, (f - en.plane) / 8) * Math.PI) : 0;
  const note = lerp(f, en.note, en.note + 2, 0, 1, ez.lin);
  const rule = lerp(f, en.line2 + 4, en.line2 + 16, 0, 1, ez.inOut);
  return (
    <div style={{position: 'absolute', left: 0, top: H * (1 - wipe), width: W, height: H, backgroundColor: K.paper, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 140, overflow: 'hidden'}}>
        <Txt x={540} y={70 + (1 - l1) * 140} style={{fontFamily: UI, fontWeight: 800, fontSize: 104, color: K.ink}}>
          רוצים פרסומת כזו
        </Txt>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, height: 140, overflow: 'hidden'}}>
        <Txt x={540} y={70 + (1 - l2) * 140} style={{fontFamily: UI, fontWeight: 800, fontSize: 104, color: K.ink}}>
          לעסק שלכם<span style={{color: K.accent}}>?</span>
        </Txt>
      </div>
      <div style={{position: 'absolute', left: 540 - 70 * rule, width: 140 * rule, top: 880, height: 6, backgroundColor: K.accent}} />
      {f >= en.pill ? (
        <Txt x={540} y={1060} transform={`scale(${mix(0.6, 1, pill)})`} opacity={Math.min(1, pill * 2)}>
          <Pill
            label="שלחו הודעה"
            fill={K.ink}
            size={60}
            icon={
              <span style={{display: 'inline-block', transform: `translate(${-hop * 18}px, ${-hop * 14}px)`}}>
                <Plane size={66} color={K.paper} />
              </span>
            }
          />
        </Txt>
      ) : null}
      <Txt x={540} y={1250} opacity={note} style={{fontFamily: UI, fontWeight: 400, fontSize: 32, color: K.muted}}>
        העסק בסרטון בדיוני. קונספט להמחשה.
      </Txt>
    </div>
  );
};

export const BarberAd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: K.paper}}>
      {f >= ad.start && f < cp.split + 14 ? <AdScene f={f} /> : null}
      {f < ad.start + 14 ? <Opening f={f} /> : null}
      {f >= cp.split && f < en.line1 ? <Compare f={f} /> : null}
      {f >= cp.wipe ? <EndFrame f={f} /> : null}
      <Audio src={staticFile('music/barber-soundtrack.wav')} />
    </AbsoluteFill>
  );
};
