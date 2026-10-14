import React from 'react';
import {Composition} from 'remotion';
import {NoirCommercial} from './NoirCommercial';
import T from './timeline.json';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NoirCommercial"
      component={NoirCommercial}
      durationInFrames={T.durationInFrames}
      fps={T.fps}
      width={T.width}
      height={T.height}
    />
  );
};
