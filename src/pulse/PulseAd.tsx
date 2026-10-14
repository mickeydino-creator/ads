import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {Converge} from './Converge';
import {Final} from './Final';
import {Open} from './Open';
import {Player} from './Player';
import {Worlds} from './Worlds';
import {P} from './kit';

// Unofficial portfolio concept, inspired by a music-streaming experience.
export const PulseAd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: P.black}}>
      {f < T.s2 ? <Open f={f} /> : null}
      {f >= T.s2 && f < T.s3 ? <Player f={f} /> : null}
      {f >= T.s3 && f < T.s4 ? <Worlds f={f} /> : null}
      {f >= T.s4 && f < T.s5 ? <Converge f={f} /> : null}
      {f >= T.s5 ? <Final f={f} /> : null}
      <Audio src={staticFile('music/music-in-motion.wav')} />
    </AbsoluteFill>
  );
};
