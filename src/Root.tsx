import React from 'react';
import {Composition} from 'remotion';
import {NoirCommercial} from './NoirCommercial';
import T from './timeline.json';
import {NoirEditorial} from './editorial/NoirEditorial';
import ET from './editorial/timeline.json';
import {VantaAd} from './vanta/VantaAd';
import VT from './vanta/timeline.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="NoirCommercial"
      component={NoirCommercial}
      durationInFrames={T.durationInFrames}
      fps={T.fps}
      width={T.width}
      height={T.height}
    />
    <Composition
      id="NoirEditorial"
      component={NoirEditorial}
      durationInFrames={ET.durationInFrames}
      fps={ET.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="VantaAd"
      component={VantaAd}
      durationInFrames={VT.durationInFrames}
      fps={VT.fps}
      width={1080}
      height={1920}
    />
    </>
  );
};
