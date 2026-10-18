import React from 'react';
import {Composition, Still} from 'remotion';
import {CoverForm, CoverMusic, CoverVanta} from './covers/Covers';
import {NoirCommercial} from './NoirCommercial';
import T from './timeline.json';
import {NoirEditorial} from './editorial/NoirEditorial';
import ET from './editorial/timeline.json';
import {VantaAd} from './vanta/VantaAd';
import VT from './vanta/timeline.json';
import {FormAd} from './form/FormAd';
import FT from './form/timeline.json';
import {PulseAd} from './pulse/PulseAd';
import PT from './pulse/timeline.json';
import {BarberAd} from './barber/BarberAd';
import BT from './barber/timeline.json';

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
    <Composition
      id="FormAd"
      component={FormAd}
      durationInFrames={FT.durationInFrames}
      fps={FT.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="MusicInMotion"
      component={PulseAd}
      durationInFrames={PT.durationInFrames}
      fps={PT.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="BarberAd"
      component={BarberAd}
      durationInFrames={BT.durationInFrames}
      fps={BT.fps}
      width={1080}
      height={1920}
    />
    <Still id="CoverVanta" component={CoverVanta} width={1080} height={1920} />
    <Still id="CoverForm" component={CoverForm} width={1080} height={1920} />
    <Still id="CoverMusic" component={CoverMusic} width={1080} height={1920} />
    </>
  );
};
