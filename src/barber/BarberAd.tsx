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

// ---------------- 0-4.5 s: loud flyer, tear-away, restyle ----------------

const STRIPS = 6;
const SH = H / STRIPS;

// ragged tear line between strip k-1 and strip k (shared, so the strips fit together)
const tearLine = (k: number) => {
  const pts: [number, number][] = [];
  for (let x = -40, j = 0; x <= W + 40; x += 36, j++) {
    const n = Math.sin(j * 12.9898 + k * 78.233) * 43758.5453;
    pts.push([x, k * SH + (n - Math.floor(n) - 0.5) * 34]);
  }
  return pts;
};
const stripClip = (i: number) => {
  const top = i === 0 ? [[-40, -40], [W + 40, -40]] : tearLine(i);
  const bottom = i === STRIPS - 1 ? [[W + 40, H + 40], [-40, H + 40]] : tearLine(i + 1).slice().reverse();
  return `polygon(${[...top, ...bottom].map(([x, y]) => `${x}px ${y}px`).join(', ')})`;
};

const jolts = (f: number) => hk.jolt.reduce((acc, at) => acc + (f >= at ? Math.exp(-(f - at) / 3) : 0), 0);

const Opening: React.FC<{f: number}> = ({f}) => {
  const pops = hk.jolt.map((at) => pop(f, at, 420, 12));
  const jolt = f < hk.tear ? jolts(f) : 0;
  const torn = f >= hk.strips;

  // hook band: settled on frame 0 (the cover), small slam on frames 1-6, folds shut on the tear
  const slam = f === 0 ? 1 : mix(1.12, 1, pop(f, 1, 380, 14));
  const fold = lerp(f, hk.tear, hk.tear + 6, 1, 0, ez.in);

  const head = lerp(f, rs.header, rs.header + 14, 0, 1);
  const headOut = lerp(f, ad.start, ad.start + 10, 0, 1, ez.in);
  const rule = lerp(f, rs.rule, rs.rule + 12, 0, 1, ez.inOut);
  const dot = pop(f, rs.dot, 420, 14);
  const press = f >= rs.press ? 1 - 0.07 * Math.sin(Math.min(1, (f - rs.press) / 7) * Math.PI) : 1;
  const clear = lerp(f, ad.start, ad.start + 8, 0, 1);

  return (
    <AbsoluteFill style={{backgroundColor: f < ad.start ? K.paper : 'transparent'}}>
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
            <div key={i} style={{position: 'absolute', inset: 0, clipPath: stripClip(i), transform: `translateX(${dir * p * W * 1.2}px) rotate(${dir * p * 5}deg)`}}>
              <Flyer hideKeys pops={[1, 1, 1]} />
            </div>
          );
        })
      )}

      {/* surviving content: moves + shrinks, hard style swap at the squash point (no crossfade) */}
      {KEYS.map((k, i) => {
        if ((k.id === 'name' || k.id === 'phone') && f >= ad.start) return null;
        const start = rs.travel + i * 3;
        const t = lerp(f, start, start + 24, 0, 1, ez.inOut);
        const x = mix(k.before.x, k.after.x, t);
        const y = mix(k.before.y, k.after.y, t);
        const rot = mix(k.before.rot, k.after.rot, t);
        const swapped = t >= 0.5;
        const squash = swapped ? mix(0.8, 1, lerp(t, 0.5, 0.8, 0, 1, ez.out)) : mix(1, 0.8, lerp(t, 0.2, 0.5, 0, 1, ez.in));
        const shake = f < hk.tear ? jolts(f) : 0;
        const exit = lerp(f, ad.start + i * 2, ad.start + i * 2 + 10, 0, 1, ez.in);
        const s = squash * (1 + shake * 0.018) * (k.id === 'phone' ? press : 1);
        return (
          <Txt key={k.id} x={x} y={y + exit * 400} opacity={1 - exit} transform={`rotate(${rot + shake * 0.5}deg) scale(${s})`}>
            {swapped ? <k.After /> : <k.Before />}
          </Txt>
        );
      })}

      {f >= rs.dot ? (
        <Txt x={518} y={885} opacity={1 - clear} transform={`scale(${dot})`} style={{fontFamily: UI, fontSize: 70, color: K.accent}}>
          ·
        </Txt>
      ) : null}
      <div style={{position: 'absolute', left: 540 - 260 * rule, width: 520 * rule, top: 775, height: 4, backgroundColor: K.ink, opacity: 1 - clear}} />

      {f < hk.tear + 6 ? (
        <div style={{position: 'absolute', left: 0, top: 236, width: W, height: 180, backgroundColor: K.ink, transform: `scaleY(${fold})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: UI, fontWeight: 800, fontSize: 70, color: K.paper, direction: 'rtl', display: 'inline-block', transform: `scale(${slam})`}}>ככה נראית הפרסומת שלך?</span>
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

// ---------------- 4.5-11 s: the ad itself ----------------

const WORDS = ['תספורת', 'זקן', 'קו נקי', 'גוונים', 'סטייל'];
const WORD_Y = 1010;
const BAND_TOP = 560;
const BAND_H = 170;

// a word drawn across the full frame so halves/reveals can be clipped in frame coordinates
const Word: React.FC<{text: string; clip?: string; style?: React.CSSProperties}> = ({text, clip, style}) => (
  <div style={{position: 'absolute', inset: 0, clipPath: clip, ...style}}>
    <Txt x={540} y={WORD_Y} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 210, color: K.ink}}>
      {text}
      <span style={{color: K.accent}}>.</span>
    </Txt>
  </div>
);

const reveal = (r: number) => `inset(${WORD_Y - 150 * r}px 0 ${H - WORD_Y - 150 * r}px 0)`;

const AdScene: React.FC<{f: number}> = ({f}) => {
  const up = lerp(f, ad.start, ad.start + 12, 0, 1, ez.inOut);
  const nameY = mix(640, 420, up);
  const nameS = mix(1, 1.08, up);
  const pillY = mix(1165, 1300, up);
  const pillOut = lerp(f, ad.gather, ad.gather + 9, 0, 1, ez.in);
  const pillKick = f >= ad.first && f < ad.gather ? Math.exp(-((f - ad.first) % 15) / 3) * 0.03 : 0;

  // stripe band as a clipped, screen-fixed stripe field: opens right-to-left, floods, retracts upward
  const open = lerp(f, ad.band, ad.band + 14, 0, 1, ez.out);
  const flood = lerp(f, ad.drop - 6, ad.drop, 0, 1, ez.in);
  const leave = lerp(f, ad.stack[0] + 6, ad.stack[1] - 2, 0, 1, ez.inOut);
  const top = mix(BAND_TOP, 0, flood);
  const bot = mix(BAND_TOP + BAND_H, H, flood) * (1 - leave);
  const left = W * (1 - open);

  let idx = 0;
  ad.words.forEach((c) => {
    if (f >= c) idx++;
  });
  const lastCut = idx > 0 ? ad.words[idx - 1] : ad.first - 3;
  const since = f - lastCut;
  const r = lerp(since, 2, 6, 0, 1, ez.out);
  const wordsOut = lerp(f, ad.gather, ad.gather + 6, 0, 1, ez.in);

  const sIn = lerp(f, ad.first - 10, ad.first + 2, -300, 120, ez.out);
  const next = ad.words.find((c) => c >= f) ?? ad.drop;
  const toNext = next - f;
  const snipOpen = f < ad.gather ? (toNext <= 6 ? toNext / 6 : 1) : f < ad.drop ? lerp(f, ad.drop - 6, ad.drop, 1, 0, ez.in) : 0;
  const gather = lerp(f, ad.gather, ad.gather + 12, 0, 1, ez.inOut);
  const sx = mix(sIn, 540, gather);
  const sy = mix(WORD_Y, 1000, gather);
  const sSize = mix(200, 420, gather);
  const lineP = f < ad.gather && f >= ad.first && toNext <= 4 ? 1 - toNext / 4 : 0;

  const stack = ['פתוח', 'גם', 'בשישי'];
  const stackY = [700, 930, 1170];
  const stackOut = (i: number) => lerp(f, cp.split - 4 + i, cp.split + 4 + i, 0, 1, ez.in);
  const info = lerp(f, ad.info, ad.info + 10, 0, 1);

  return (
    <AbsoluteFill style={{backgroundColor: K.paper}}>
      {f < ad.drop ? (
        <Txt x={540} y={nameY} transform={`scale(${nameS})`}>
          <Name17 />
        </Txt>
      ) : null}

      {f >= ad.first - 3 && f < ad.gather + 6 ? (
        <>
          <Word text={WORDS[idx]} clip={reveal(r)} style={{opacity: 1 - wordsOut}} />
          {idx > 0 && since < 4 ? (
            <>
              <Word text={WORDS[idx - 1]} clip={`inset(0 0 ${H - WORD_Y}px 0)`} style={{transform: `translate(${-since * 8}px, ${-since * 26}px) rotate(${-since * 0.8}deg)`, opacity: Math.max(0, 1 - since / 2.5)}} />
              <Word text={WORDS[idx - 1]} clip={`inset(${WORD_Y}px 0 0 0)`} style={{transform: `translate(${since * 8}px, ${since * 26}px) rotate(${since * 0.8}deg)`, opacity: Math.max(0, 1 - since / 2.5)}} />
            </>
          ) : null}
        </>
      ) : null}
      {lineP > 0 ? <div style={{position: 'absolute', left: 210, top: WORD_Y - 2, width: 760 * lineP, height: 4, backgroundColor: K.accent}} /> : null}

      {f >= ad.first - 10 && f < ad.drop + 2 ? (
        <div style={{position: 'absolute', left: sx - sSize / 2, top: sy - sSize / 2}}>
          <Scissors size={sSize} open={snipOpen} />
        </div>
      ) : null}

      {f < ad.gather + 9 ? (
        <Txt x={540} y={pillY + pillOut * 300} opacity={1 - pillOut} transform={`scale(${1 + pillKick})`}>
          <Pill label="קובעים תור בהודעה" />
        </Txt>
      ) : null}

      {f >= ad.band && bot > top + 1 ? (
        <>
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(${top}px 0 ${H - bot}px ${left}px)`}}>
            <Stripes shift={-f * 3} w={56} />
          </div>
          {top > 0 ? <div style={{position: 'absolute', left, right: 0, top: top - 5, height: 5, backgroundColor: K.ink}} /> : null}
          {bot < H ? <div style={{position: 'absolute', left, right: 0, top: bot, height: 5, backgroundColor: K.ink}} /> : null}
        </>
      ) : null}

      {/* the Friday stack lands on the flood in paper blocks, which merge with the paper as the stripes retract */}
      {f >= ad.stack[0]
        ? stack.map((w, i) => {
            if (f < ad.stack[i]) return null;
            const p = pop(f, ad.stack[i], 320, 16);
            const o = stackOut(i);
            return (
              <Txt key={w} x={540} y={stackY[i] + (1 - p) * 120 - o * 160} opacity={Math.min(1, p * 3) * (1 - o)} transform={`scale(${mix(0.85, 1, p)})`}>
                <span style={{display: 'inline-block', backgroundColor: K.paper, padding: '10px 40px 26px', fontFamily: SERIF, fontWeight: 900, fontSize: 250, color: i === 2 ? K.accent : K.ink}}>
                  {w}
                  {i === 2 ? <span style={{color: K.ink}}>.</span> : null}
                </span>
              </Txt>
            );
          })
        : null}
      {f >= ad.info ? (
        <Txt x={540} y={1400 + (1 - info) * 30} opacity={info * (1 - stackOut(2))} style={{fontFamily: UI, fontWeight: 500, fontSize: 46, color: K.muted}}>
          רחוב הגפן 17 · קובעים תור בהודעה
        </Txt>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 11-13 s: before / after ----------------

const THUMB = 0.46;
const TW = W * THUMB;
const TH = H * THUMB;

const Compare: React.FC<{f: number}> = ({f}) => {
  const inB = lerp(f, cp.split, cp.split + 14, 0, 1, ez.out);
  const inA = lerp(f, cp.split + 3, cp.split + 17, 0, 1, ez.out);
  const labels = lerp(f, cp.labels, cp.labels + 8, 0, 1);
  const cut = lerp(f, cp.cut - 4, cp.cut, 0, 1, ez.in);
  const fall = lerp(f, cp.cut + 2, cp.cut + 18, 0, 1, ez.in);
  const grow = lerp(f, cp.grow, cp.wipe, 0, 1, ez.inOut);
  const lift = lerp(f, cp.wipe, cp.wipe + 12, 0, 1, ez.in);

  // before on the right (read first in Hebrew), after on the left
  const bx = W - 28 - TW / 2;
  const ax0 = 28 + TW / 2;
  const cy = 980;
  const ax = mix(ax0, W / 2, grow);
  const ay = mix(cy, H / 2, grow) - lift * (H + 60);
  const aScale = mix(THUMB, 1, grow);
  const bLabel = labels * (1 - lerp(f, cp.cut - 2, cp.cut + 4, 0, 1));

  return (
    <AbsoluteFill>
      {fall < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: bx - TW / 2,
            top: cy - TH / 2 - (1 - inB) * 1500 + fall * 1500,
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
      ) : null}
      <Txt x={bx} y={cy - TH / 2 - 60} opacity={bLabel} style={{fontFamily: UI, fontWeight: 800, fontSize: 64, color: K.ink}}>
        לפני
      </Txt>
      {cut > 0 && fall < 0.25 ? <div style={{position: 'absolute', left: bx + TW / 2 + 30 - (TW + 60) * cut, top: cy, width: (TW + 60) * cut, height: 6, backgroundColor: K.accent}} /> : null}

      <Txt x={ax0} y={cy - TH / 2 - 60} opacity={labels * (1 - grow * 3)} style={{fontFamily: UI, fontWeight: 800, fontSize: 64, color: K.accent}}>
        אחרי
      </Txt>
      <div
        style={{
          position: 'absolute',
          left: ax - (W * aScale) / 2,
          top: ay - (H * aScale) / 2 + (1 - inA) * 1500,
          width: W * aScale,
          height: H * aScale,
          overflow: 'hidden',
          border: `${4 * (1 - grow) + 5 * lift}px solid ${K.ink}`,
        }}
      >
        <div style={{width: W, height: H, transform: `scale(${aScale})`, transformOrigin: '0 0', position: 'relative'}}>
          <AfterPoster shift={-f * 3} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 13-15 s: end frame (revealed as the poster lifts away) ----------------

const EndFrame: React.FC<{f: number}> = ({f}) => {
  const l1 = lerp(f, en.line1, en.line1 + 12, 0, 1);
  const l2 = lerp(f, en.line2, en.line2 + 12, 0, 1);
  const pill = pop(f, en.pill, 320, 15);
  const hop = f >= en.plane ? Math.sin(Math.min(1, (f - en.plane) / 8) * Math.PI) : 0;
  const note = lerp(f, en.note, en.note + 2, 0, 1, ez.lin);
  const rule = lerp(f, en.line2 + 4, en.line2 + 16, 0, 1, ez.inOut);
  return (
    <AbsoluteFill style={{backgroundColor: K.paper}}>
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
    </AbsoluteFill>
  );
};

export const BarberAd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: K.paper}}>
      {f >= ad.start && f < cp.split + 14 ? <AdScene f={f} /> : null}
      {f < ad.start + 14 ? <Opening f={f} /> : null}
      {f >= cp.wipe ? <EndFrame f={f} /> : null}
      {f >= cp.split && f < cp.wipe + 13 ? <Compare f={f} /> : null}
      <Audio src={staticFile('music/barber-soundtrack.wav')} />
    </AbsoluteFill>
  );
};
