import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {AlbumArt, DISP, H, P, W, bounce, eighth, ez, hash, lerp, mix, wavePath} from './kit';

// 0-3 s: a sound wave bursts across black, PRESS PLAY. rises out of the wave
// line, the letters stretch into equalizer bars, the bars bounce on the 8ths,
// swing into a radial equalizer and an iris opens onto the first album.

const o = T.open;
const LETTERS = [
  ...'PRESS'.split('').map((c, i) => ({c, word: 0, i})),
  ...'PLAY.'.split('').map((c, i) => ({c, word: 1, i})),
];
const COLORS = [P.green, P.pink, P.white, P.purple];
export const IRIS = {cx: W / 2, cy: 960, r: 270};

const letterX = (word: number, i: number) => (word === 0 ? 150 + i * 158 : 170 + i * 160);
const letterY = (word: number) => (word === 0 ? 640 : 860);

export const Open: React.FC<{f: number}> = ({f}) => {
  const burst = lerp(f, o.burst, o.burst + 14, 1, 0, ez.out);
  const amp = mix(70, 620, burst) * (f < o.split ? 1 : lerp(f, o.split, o.split + 8, 1, 0.3));
  const stretch = (k: number) => lerp(f, o.split + k * 0.6, o.bars, 0, 1, ez.in);
  const radialAll = lerp(f, o.radial, o.radial + 12, 0, 1, ez.inOut);
  const iris = lerp(f, o.iris, o.iris + 10, 0, 1, ez.out);
  const scatter = lerp(f, o.iris + 2, 90, 0, 1, ez.in);
  const kick = eighth(f, o.bars);
  return (
    <AbsoluteFill style={{backgroundColor: P.black, overflow: 'hidden'}}>
      {/* the wave + two trailing echoes */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {[2, 1, 0].map((k) => (
          <path
            key={k}
            d={wavePath(f - k * 2, -40, W + 40, 960 + k * 6, amp * (1 - k * 0.18), {env: f < 20 ? 'burst' : 'flat', seed: k})}
            stroke={[P.green, P.pink, P.purple][k]}
            strokeWidth={k === 0 ? 10 : 6}
            fill="none"
            opacity={(k === 0 ? 1 : 0.55) * (1 - radialAll)}
          />
        ))}
      </svg>

      {/* letters -> bars */}
      {LETTERS.map((L, n) => {
        const start = L.word === 0 ? o.press + L.i : o.play + L.i;
        if (f < start) return null;
        const rise = bounce(f, start, 420, 15);
        const st = stretch(n);
        const isBar = f >= o.bars;
        const radial = lerp(f, o.radial + n * 0.8, o.radial + 10 + n * 0.8, 0, 1, ez.inOut);
        const color = L.word === 0 ? P.white : L.c === '.' ? P.pink : P.green;
        // radial target
        const ang = (n / LETTERS.length) * Math.PI * 2 - Math.PI / 2 + f * 0.02;
        const rx = IRIS.cx + Math.cos(ang) * 360;
        const ry = IRIS.cy + Math.sin(ang) * 360;
        const rowX = 130 + n * 92;
        const bx = mix(rowX, rx, radial) + Math.cos(ang) * scatter * 900;
        const by = mix(960, ry, radial) + Math.sin(ang) * scatter * 900;
        const barH = (120 + 300 * hash(n * 3 + Math.floor((f - o.bars) / 7.5))) * (0.75 + kick * 0.35) * mix(1, 0.55, radial);
        if (isBar) {
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: bx - 30,
                top: by - barH / 2,
                width: 60,
                height: barH,
                borderRadius: 30,
                backgroundColor: COLORS[n % 4],
                transform: `rotate(${radial * (ang * 180 / Math.PI + 90)}deg)`,
                transformOrigin: '50% 50%',
              }}
            />
          );
        }
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: letterX(L.word, L.i),
              top: letterY(L.word),
              fontFamily: DISP,
              fontWeight: 900,
              fontSize: 200,
              lineHeight: 1,
              color,
              // rise out of the wave line, then stretch thin and tall toward the bar
              clipPath: `inset(0 0 ${(1 - rise) * 100}% 0)`,
              transform: `translate(${(rowX - letterX(L.word, L.i) - 60) * st}px, ${(960 - letterY(L.word) - 95) * st}px) translateY(${(1 - rise) * 120}px) scale(${mix(1, 0.4, st)}, ${mix(1, 2.2, st)})`,
              transformOrigin: '50% 50%',
            }}
          >
            {L.c}
          </div>
        );
      })}

      {/* iris: the pink circle opens on the first album */}
      {f >= o.iris ? (
        <div style={{position: 'absolute', left: IRIS.cx - IRIS.r * iris, top: IRIS.cy - IRIS.r * iris, width: IRIS.r * 2 * iris, height: IRIS.r * 2 * iris, borderRadius: '50%', overflow: 'hidden', backgroundColor: P.pink}}>
          <div style={{position: 'absolute', left: IRIS.r * iris - IRIS.r, top: IRIS.r * iris - IRIS.r, width: IRIS.r * 2, height: IRIS.r * 2, opacity: lerp(f, o.iris + 4, o.iris + 10, 0, 1)}}>
            <AlbumArt art="neon" f={f} size={IRIS.r * 2} />
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 64, top: 240, fontFamily: DISP, fontWeight: 800, fontSize: 26, color: P.mute, letterSpacing: '0.1em'}}>
        {`0:0${Math.floor(f / 30)} / 0:15`}
      </div>
    </AbsoluteFill>
  );
};
