import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {loadFont} from '@remotion/fonts';
import * as THREE from 'three';
import {Scene} from './Scene';
import {makeLabelTexture} from './textures';
import T from './timeline.json';

// Fonts are bundled locally (SIL OFL, see public/fonts) so renders never depend on the network.
const serif = {fontFamily: 'NoirSerif'};
const sans = {fontFamily: 'NoirSans'};
const fontsReady = Promise.all([
  loadFont({family: serif.fontFamily, url: staticFile('fonts/cormorant-garamond-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: sans.fontFamily, url: staticFile('fonts/montserrat-latin-400-normal.woff2'), weight: '400'}),
]);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SILVER_TEXT =
  'linear-gradient(180deg, #f3f5f7 0%, #c9cdd2 48%, #9ea3a9 52%, #d9dce0 100%)';

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [60, 160], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{backgroundColor: '#030304'}}>
      {/* Charcoal studio sweep, neutral only. */}
      <AbsoluteFill
        style={{
          opacity: open,
          background:
            'linear-gradient(180deg, #08090a 0%, #121417 38%, #1a1c20 58%, #0f1012 72%, #070708 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - T.wordmark;
  const reveal = interpolate(t, [0, 30], [0, 1], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});
  const spacing = interpolate(t, [0, 60], [0.62, 0.42], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  // A silver light pass travels across the letters, echoing the opening sweep.
  const sheen = interpolate(t, [6, 48], [-40, 140], clamp);
  const tag = interpolate(frame - T.tagline, [0, 26], [0, 1], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});
  const rule = interpolate(frame - T.tagline, [-6, 30], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: 1250,
          width: '100%',
          textAlign: 'center',
          fontFamily: serif.fontFamily,
          fontWeight: 500,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: `${spacing}em`,
          paddingLeft: `${spacing}em`,
          backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sheen - 18}%, rgba(255,255,255,0.85) ${sheen}%, rgba(255,255,255,0) ${sheen + 18}%), ${SILVER_TEXT}`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 18}px)`,
          clipPath: `inset(0 ${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}%)`,
        }}
      >
        NOIR
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1434,
          left: '50%',
          width: 120,
          height: 1,
          marginLeft: -60,
          background: '#8d9298',
          transform: `scaleX(${rule})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1462,
          width: '100%',
          textAlign: 'center',
          fontFamily: sans.fontFamily,
          fontWeight: 400,
          fontSize: 40,
          letterSpacing: '0.38em',
          paddingLeft: '0.38em',
          color: '#c9cdd2',
          opacity: tag,
          transform: `translateY(${(1 - tag) * 12}px)`,
        }}
      >
        SCENT. WITHOUT WORDS.
      </div>
    </AbsoluteFill>
  );
};

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* Neutral lens vignette. */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* Fine film grain keeps the dark gradients from banding. */}
      <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

export const NoirCommercial: React.FC = () => {
  const {width, height} = useVideoConfig();
  const [labelMap, setLabelMap] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('Loading fonts and label texture'));

  useEffect(() => {
    fontsReady
      .then(() => document.fonts.load(`500 200px "${serif.fontFamily}"`))
      .then(() => {
        setLabelMap(makeLabelTexture(serif.fontFamily));
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill>
      <Backdrop />
      {labelMap ? (
        <ThreeCanvas
          width={width}
          height={height}
          gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}
          dpr={1}
          style={{position: 'absolute'}}
        >
          <Scene labelMap={labelMap} />
        </ThreeCanvas>
      ) : null}
      <Wordmark />
      <Finish />
      <Audio src={staticFile('noir-soundtrack.wav')} />
    </AbsoluteFill>
  );
};
