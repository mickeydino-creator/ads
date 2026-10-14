import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {Build} from './Build';
import {Finale} from './Finale';
import {Hook} from './Hook';
import {Signature} from './Signature';
import {Transform} from './Transform';
import {H, K, ez, lerp} from './system';

// Orange panel that carries the hook -> build change: rises to cover, exits upward.
const PanelWipe: React.FC<{f: number; at: number; color?: string}> = ({f, at, color = K.orange}) => {
  if (f < at - 10 || f > at + 10) return null;
  const inP = lerp(f, at - 10, at - 1, 0, 1, ez.inOut);
  const outP = lerp(f, at, at + 9, 0, 1, ez.inOut);
  const top = f < at ? H * (1 - inP) : -H * outP;
  return <div style={{position: 'absolute', left: 0, top, width: '100%', height: H, backgroundColor: color}} />;
};

export const FormAd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: K.black}}>
      {f < T.s2 ? <Hook f={f} /> : null}
      {f >= T.s2 && f < T.s3 ? <Build f={f} /> : null}
      {f >= T.s3 && f < T.s4 ? <Transform f={f} /> : null}
      {f >= T.s4 && f < T.s5 ? <Signature f={f} /> : null}
      {f >= T.s5 ? <Finale f={f} /> : null}
      <PanelWipe f={f} at={T.s2} />
      <Audio src={staticFile('music/form-soundtrack.wav')} />
    </AbsoluteFill>
  );
};
