import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {Final} from './Final';
import {Flow, NODE, nodeRect} from './Flow';
import {Interface} from './Interface';
import {Opening} from './Opening';
import {H, W, ease, lerp} from './ui';

// Dive: the camera pushes into the AI node's purple icon until it fills the frame.
const Dive: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
  const r = nodeRect(1);
  const cx = r.x + 28 + 40;
  const cy = r.y + NODE.h / 2;
  const p = lerp(f, T.s4, 318, 0, 1, ease.in);
  const s = Math.pow(30, p);
  return (
    <AbsoluteFill style={{transform: `translate(${(W / 2 - cx) * Math.min(1, p * 1.4)}px, ${(H / 2 - cy) * Math.min(1, p * 1.4)}px) scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>
      {children}
    </AbsoluteFill>
  );
};

// Iris: the purple dot from the "?" opens onto the dark app pile.
const Iris: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
  const r = lerp(f, T.s2, T.s2 + 12, 0, 1300, ease.out);
  return (
    <AbsoluteFill style={{backgroundColor: '#7b3cff'}}>
      <AbsoluteFill style={{clipPath: `circle(${r}px at 542px 1143px)`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VantaAd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c'}}>
      {f < T.s2 ? <Opening f={f} /> : null}
      {f >= T.s2 && f < T.s4 ? (
        <Iris f={f}>
          <Flow f={f} />
        </Iris>
      ) : null}
      {f >= T.s4 && f < 318 ? (
        <Dive f={f}>
          <Flow f={f} />
        </Dive>
      ) : null}
      {f >= 318 && f < T.impact ? <Interface f={f} /> : null}
      {f >= T.impact ? <Final f={f} /> : null}
      <Audio src={staticFile('music/vanta-mix.wav')} />
    </AbsoluteFill>
  );
};
