import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {SUN} from './Player';
import {ALBUMS, AlbumArt, Art, BODY, DISP, H, P, W, bounce, eighth, ez, hash, lerp, mix, onBeat, wavePath} from './kit';

// 6-10 s: three visual worlds for three moods, chained by match cuts:
// the sun becomes the moon, the moon's wave lines straighten into the bass bars.

const w = T.worlds;

const NowPlaying: React.FC<{f: number; start: number; art: Art; dark?: boolean; accent: string}> = ({f, start, art, dark, accent}) => {
  const k = bounce(f, start + 4, 520, 18);
  const prog = lerp(f, start + 6, start + 40, 0.1, 0.7, ez.lin);
  const fg = dark ? P.white : P.black;
  return (
    <div style={{position: 'absolute', left: 90, top: 1330, width: 900, height: 190, borderRadius: 28, backgroundColor: dark ? 'rgba(255,244,232,0.08)' : 'rgba(10,10,10,0.1)', transform: `translateY(${(1 - k) * 260}px)`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 26px'}}>
      <div style={{position: 'relative', width: 140, height: 140, borderRadius: 16, overflow: 'hidden', flexShrink: 0}}>
        <AlbumArt art={art} f={f} size={140} />
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: fg, opacity: 0.7}}>NOW PLAYING</div>
        <div style={{fontFamily: DISP, fontWeight: 900, fontSize: 40, color: fg, marginTop: 4, whiteSpace: 'nowrap'}}>{ALBUMS[art].title}</div>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 26, color: fg, opacity: 0.75}}>{ALBUMS[art].artist}</div>
        <div style={{marginTop: 12, height: 8, borderRadius: 4, backgroundColor: dark ? 'rgba(255,244,232,0.2)' : 'rgba(10,10,10,0.18)'}}>
          <div style={{width: `${prog * 100}%`, height: 8, borderRadius: 4, backgroundColor: accent}} />
        </div>
      </div>
    </div>
  );
};

const StackWord: React.FC<{f: number; start: number; text: string; color: string; size: number; top: number; left?: number; skew?: number; outline?: boolean}> = ({f, start, text, color, size, top, left = 70, skew = 0, outline}) => (
  <div style={{position: 'absolute', left, top, display: 'flex', transform: `skewX(${skew}deg)`}}>
    {text.split('').map((c, i) => {
      const k = bounce(f, start + i * 1.2, 420, 14);
      return (
        <div key={i} style={{overflow: 'hidden', height: size * 1.05, marginRight: outline ? size * 0.05 : 0}}>
          <div style={{fontFamily: DISP, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: outline ? 'transparent' : color, WebkitTextStroke: outline ? `4px ${color}` : undefined, transform: `translateY(${(1 - k) * 110}%)`}}>{c}</div>
        </div>
      );
    })}
  </div>
);

// ---------- world 1: orange + pink, SUMMER FEVER ----------
const SunWorld: React.FC<{f: number}> = ({f}) => {
  const kick = onBeat(f, w.sun);
  const sink = lerp(f, w.moon - 6, w.moon, 0, 1, ez.inOut);
  return (
    <AbsoluteFill style={{backgroundColor: P.orange, overflow: 'hidden'}}>
      {/* halftone field */}
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${P.pink} 32%, transparent 34%)`, backgroundSize: '44px 44px', backgroundPosition: `${f * 3}px ${f * 1.5}px`, opacity: 0.55}} />
      {/* sun rings, beating */}
      {[0, 1, 2, 3, 4].map((i) => {
        const r = (SUN.r + 260 - i * 130) * (1 + kick * 0.04 * (5 - i));
        return <div key={i} style={{position: 'absolute', left: SUN.cx - r, top: SUN.cy - r, width: r * 2, height: r * 2, borderRadius: '50%', backgroundColor: i % 2 ? P.orange : P.pink, border: i === 4 ? `10px solid ${P.black}` : undefined}} />;
      })}
      {/* horizon stripes sliding */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, top: 1000 + i * 36 + (i * i * 4), width: W, height: 14 + i * 3, backgroundColor: P.orange, transform: `translateX(${((f * (6 + i * 2)) % 200) - 100}px)`}} />
      ))}
      <StackWord f={f} start={w.sun + 2} text="SUMMER" color={P.white} size={148} top={300} left={60} />
      <StackWord f={f} start={w.sun + 7.5} text="FEVER" color={P.black} size={148} top={470} left={300} />
      <NowPlaying f={f} start={w.sun} art="sun" accent={P.pink} />
      <div style={{position: 'absolute', inset: 0, backgroundColor: '#1b1450', clipPath: `circle(${sink * 1500}px at ${SUN.cx}px ${SUN.cy}px)`}} />
    </AbsoluteFill>
  );
};

// ---------- world 2: purple + blue, MIDNIGHT DRIVE ----------
const MOON = {cx: SUN.cx, cy: SUN.cy, r: 170};
const MoonWorld: React.FC<{f: number}> = ({f}) => {
  const t = f - w.moon;
  const bite = lerp(f, w.moon + 2, w.moon + 14, 0, 1, ez.inOut);
  const straighten = lerp(f, w.bass - 9, w.bass, 0, 1, ez.inOut);
  return (
    <AbsoluteFill style={{backgroundColor: '#1b1450', overflow: 'hidden'}}>
      {/* star grid */}
      {new Array(60).fill(0).map((_, i) => {
        const x = (i % 6) * 190 + 60 + ((Math.floor(i / 6) % 2) * 95);
        const y = Math.floor(i / 6) * 190 + 120;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 8, height: 8, borderRadius: 4, backgroundColor: P.white, opacity: tw * 0.6}} />;
      })}
      {/* moon (same circle the sun left) */}
      <div style={{position: 'absolute', left: MOON.cx - MOON.r, top: MOON.cy - MOON.r, width: MOON.r * 2, height: MOON.r * 2, borderRadius: '50%', backgroundColor: P.white}} />
      <div style={{position: 'absolute', left: MOON.cx - MOON.r + mix(-400, 80, bite), top: MOON.cy - MOON.r - 40, width: MOON.r * 2, height: MOON.r * 2, borderRadius: '50%', backgroundColor: '#1b1450'}} />
      {/* flowing wave lines, which straighten into bars at the cut */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={wavePath(f + i * 4, -20, W + 20, 1060 + i * 46, 34 * (1 - straighten), {seed: i, freq: 0.012})} stroke={i % 2 ? P.blue : P.purple} strokeWidth={12} fill="none" strokeLinecap="round" />
        ))}
      </svg>
      <StackWord f={f} start={w.moon + 2} text="MIDNIGHT" color={P.white} size={130} top={300} skew={-10} outline />
      <StackWord f={f} start={w.moon + 9} text="DRIVE" color={P.blue} size={170} top={450} left={150} skew={-10} />
      <NowPlaying f={f} start={w.moon} art="moon" dark accent={P.purple} />
      <div style={{position: 'absolute', right: 70, top: 250, fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: '0.2em', color: P.white, opacity: 0.6}}>{`MOOD ${t >= 0 ? '02' : ''}`}</div>
    </AbsoluteFill>
  );
};

// ---------- world 3: black + acid green, BASS THEORY ----------
const BassWorld: React.FC<{f: number}> = ({f}) => {
  const k8 = eighth(f, w.bass);
  const grid = lerp(f, w.bass, w.bass + 10, 0, 1);
  return (
    <AbsoluteFill style={{backgroundColor: P.black, overflow: 'hidden'}}>
      {/* grid */}
      {new Array(13).fill(0).map((_, i) => (
        <div key={`v${i}`} style={{position: 'absolute', left: i * 90, top: 0, width: 2, height: H, backgroundColor: P.green, opacity: 0.18, transform: `scaleY(${grid})`}} />
      ))}
      {new Array(22).fill(0).map((_, i) => (
        <div key={`h${i}`} style={{position: 'absolute', top: i * 90 + ((f * 4) % 90), left: 0, height: 2, width: W, backgroundColor: P.green, opacity: 0.18, transform: `scaleX(${grid})`}} />
      ))}
      {/* the moon's lines, now equaliser bars */}
      {new Array(7).fill(0).map((_, i) => {
        const h = (140 + 520 * hash(i * 7 + Math.floor((f - w.bass) / 7.5))) * (0.7 + k8 * 0.3);
        const grow = lerp(f, w.bass + i, w.bass + 8 + i, 0, 1);
        return <div key={i} style={{position: 'absolute', left: 90 + i * 135, top: 1380 - h * grow, width: 100, height: h * grow, backgroundColor: i % 3 === 1 ? P.white : P.green}} />;
      })}
      {/* repeating type stack */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 70,
            top: 260 + i * 150 + (i ? Math.sin(f / 4 + i) * 6 : 0),
            fontFamily: DISP,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1,
            color: i % 2 ? 'transparent' : P.green,
            WebkitTextStroke: i % 2 ? `3px ${P.green}` : undefined,
            letterSpacing: i % 2 ? '0.06em' : undefined,
            clipPath: `inset(0 ${(1 - lerp(f, w.bass + i * 2, w.bass + 6 + i * 2, 0, 1)) * 100}% 0 0)`,
            transform: `translateX(${(i % 2 ? 1 : -1) * Math.min(60, (f - w.bass) * 2)}px)`,
          }}
        >
          BASS
        </div>
      ))}
      <div style={{position: 'absolute', left: 670, top: 300, width: 340, height: 340, overflow: 'hidden', border: `6px solid ${P.green}`, transform: `rotate(${(1 - bounce(f, w.bass + 10, 300, 12)) * 30}deg) scale(${bounce(f, w.bass + 10, 300, 12)})`}}>
        <AlbumArt art="bass" f={f} size={340} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 1440, fontFamily: DISP, fontWeight: 900, fontSize: 44, color: P.green}}>{ALBUMS.bass.title.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 90, top: 1500, fontFamily: BODY, fontWeight: 600, fontSize: 30, color: P.white, opacity: 0.7}}>{ALBUMS.bass.artist}</div>
    </AbsoluteFill>
  );
};

export const Worlds: React.FC<{f: number}> = ({f}) => (
  <>
    {f < w.moon ? <SunWorld f={f} /> : null}
    {f >= w.moon && f < w.bass ? <MoonWorld f={f} /> : null}
    {f >= w.bass ? <BassWorld f={f} /> : null}
  </>
);

export {mix};
