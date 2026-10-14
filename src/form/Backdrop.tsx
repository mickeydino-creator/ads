import React from 'react';
import {AbsoluteFill} from 'remotion';
import {H, K, W, ez, lerp, beatKick} from './system';

// The living background: a drifting grid that draws itself in, a rotating
// dashed orange ring, hatch panels and small orbiting chips. Every layer moves
// at its own speed so foreground UI always sits on moving ground.

export const Backdrop: React.FC<{
  f: number;
  start: number; // scene start, the grid draws in from here
  base: string;
  dark?: boolean;
  ring?: {x: number; y: number; r: number};
  hatch?: {x: number; y: number; w: number; h: number};
  chips?: boolean;
  gridStep?: number;
}> = ({f, start, base, dark, ring, hatch, chips = true, gridStep = 90}) => {
  const ink = dark ? K.lineDark : K.line;
  const draw = lerp(f, start, start + 12, 0, 1, ez.out);
  const off = (f * 1.6) % gridStep;
  const kick = beatKick(f, 0);
  const cols = Math.ceil(W / gridStep) + 2;
  const rows = Math.ceil(H / gridStep) + 2;
  return (
    <AbsoluteFill style={{backgroundColor: base, overflow: 'hidden'}}>
      {/* grid */}
      {new Array(cols).fill(0).map((_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: i * gridStep - off,
            top: 0,
            width: 2,
            height: H,
            backgroundColor: ink,
            transform: `scaleY(${draw})`,
            transformOrigin: i % 2 ? 'top' : 'bottom',
          }}
        />
      ))}
      {new Array(rows).fill(0).map((_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            top: i * gridStep - off * 0.5,
            left: 0,
            height: 2,
            width: W,
            backgroundColor: ink,
            transform: `scaleX(${draw})`,
            transformOrigin: i % 2 ? 'left' : 'right',
          }}
        />
      ))}
      {/* hatch panel */}
      {hatch ? (
        <div
          style={{
            position: 'absolute',
            left: hatch.x,
            top: hatch.y,
            width: hatch.w,
            height: hatch.h,
            backgroundImage: `repeating-linear-gradient(-45deg, ${dark ? 'rgba(243,239,230,0.16)' : 'rgba(12,12,12,0.14)'} 0 3px, transparent 3px 18px)`,
            backgroundPosition: `${f * 2}px 0`,
            clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`,
          }}
        />
      ) : null}
      {/* dashed ring */}
      {ring ? (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <circle
            cx={ring.x}
            cy={ring.y}
            r={ring.r * (1 + kick * 0.02)}
            fill="none"
            stroke={K.orange}
            strokeWidth={4}
            strokeDasharray="22 16"
            transform={`rotate(${f * 1.2} ${ring.x} ${ring.y})`}
            opacity={draw}
          />
        </svg>
      ) : null}
      {/* orbiting chips */}
      {chips
        ? [0, 1, 2, 3].map((i) => {
            const a = f / (28 + i * 6) + i * 1.7;
            const x = W / 2 + Math.cos(a) * (360 + i * 60);
            const y = H / 2 + Math.sin(a * 1.3) * (700 - i * 70);
            const s = 18 + (i % 2) * 14;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - s / 2,
                  top: y - s / 2,
                  width: s,
                  height: s,
                  borderRadius: i % 2 ? s / 2 : 0,
                  backgroundColor: i === 2 ? (dark ? K.white : K.black) : K.orange,
                  transform: `rotate(${f * (i % 2 ? 3 : -2)}deg) scale(${draw * (1 + kick * 0.25)})`,
                }}
              />
            );
          })
        : null}
    </AbsoluteFill>
  );
};
