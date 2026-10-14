import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFont} from '@remotion/fonts';
import T from './timeline.json';

// ---------------------------------------------------------------------------
// System: black / off-white fields, ink and a single silver accent.
// Every cut and reveal sits on the track's 120 BPM grid (one beat = 15 frames).
// ---------------------------------------------------------------------------
const W = 1080;
const H = 1920;
const BLACK = '#0b0b0c';
const PAPER = '#f2f1ed';
const INK = '#121213';
const SILVER = '#a9adb2';

const SERIF = 'NoirSerif';
const SANS = 'NoirSans';
loadFont({family: SERIF, url: staticFile('fonts/cormorant-garamond-latin-500-normal.woff2'), weight: '500'});
loadFont({family: SANS, url: staticFile('fonts/montserrat-latin-400-normal.woff2'), weight: '400'});

const photo = (name: string) => staticFile(`photos/${name}.png`);

const out = Easing.bezier(0.16, 1, 0.3, 1); // decisive arrival
const inOut = Easing.bezier(0.65, 0, 0.35, 1); // layout travel
const lerp = (f: number, a: number, b: number, from: number, to: number, ease = out) =>
  interpolate(f, [a, b], [from, to], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Label: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  color: string;
  size?: number;
  align?: 'left' | 'right' | 'center';
  opacity?: number;
}> = ({children, x, y, color, size = 24, align = 'left', opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: align === 'left' ? x : undefined,
      right: align === 'right' ? W - x : undefined,
      top: y,
      width: align === 'center' ? W : undefined,
      textAlign: align,
      fontFamily: SANS,
      fontSize: size,
      letterSpacing: '0.32em',
      color,
      opacity,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

// Text that rises out of its own baseline mask.
const MaskRise: React.FC<{
  start: number;
  frame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dur?: number;
}> = ({start, frame, children, style, dur = 14}) => {
  const p = lerp(frame, start, start + dur, 0, 1);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`}}>{children}</span>
    </span>
  );
};

// A photograph shown through a rectangular window (the window moves, the photo is cropped).
const PhotoWindow: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zoom?: number;
  focusY?: number;
  border?: string;
}> = ({src, x, y, w, h, zoom = 1, focusY = 50, border}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      overflow: 'hidden',
      backgroundColor: '#1c1d20',
      outline: border,
    }}
  >
    <Img
      src={src}
      style={{
        position: 'absolute',
        left: '50%',
        top: `${focusY}%`,
        width: Math.max(w, h),
        height: Math.max(w, h),
        objectFit: 'cover',
        transform: `translate(-50%, -${focusY}%) scale(${zoom})`,
      }}
    />
  </div>
);

// ---------------------------------------------------------------------------
// Shot 1 - The line (0-60): a hairline draws, opens into a slit onto the cap.
// ---------------------------------------------------------------------------
const ShotLine: React.FC<{f: number}> = ({f}) => {
  const draw = lerp(f, 2, 24, 0, 1);
  const slit = lerp(f, 26, 44, 0, 320, out);
  const expand = lerp(f, 46, 60, 0, 1, inOut);
  const bandH = slit + (H - slit) * expand;
  const top = H / 2 - bandH / 2;
  const imgSize = W * 1.05;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Label x={72} y={96} color={INK} opacity={lerp(f, 4, 18, 0, 1)}>
        N° 01
      </Label>
      <Label x={W - 72} y={96} color={INK} align="right" opacity={lerp(f, 8, 22, 0, 1)}>
        NOIR
      </Label>
      {/* the band: black field, cap photograph centred inside */}
      <div style={{position: 'absolute', left: 0, top, width: W, height: bandH, overflow: 'hidden', backgroundColor: BLACK}}>
        <Img
          src={photo('cap-macro')}
          style={{
            position: 'absolute',
            left: (W - imgSize) / 2,
            top: H / 2 - top - imgSize / 2,
            width: imgSize,
            height: imgSize,
            transform: `scale(${lerp(f, 26, 60, 1.12, 1.0, Easing.out(Easing.quad))})`,
          }}
        />
      </div>
      {/* the hairline splits into the slit's two edges */}
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            left: 0,
            top: H / 2 + (s * bandH) / 2 - 0.5,
            width: W,
            height: 1.5,
            backgroundColor: INK,
            transform: `scaleX(${draw})`,
            transformOrigin: 'left center',
            opacity: 1 - expand,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 2 - The letters (60-135): NOIR cut in letter by letter, then a window
// opens through the word onto the bottle.
// ---------------------------------------------------------------------------
const WORD = ['N', 'O', 'I', 'R'];
const ShotLetters: React.FC<{f: number}> = ({f}) => {
  const winOpen = lerp(f, T.window, T.window + 14, 0, 1);
  const winGrow = lerp(f, 121, 135, 0, 1, inOut);
  // window grows from a slim column to the contact sheet's lead frame size
  const ww = winOpen * 300 + winGrow * (620 - 300);
  const wh = 900 + winGrow * (780 - 900);
  const wy = H / 2 - wh / 2 + winGrow * (300 - (H / 2 - 780 / 2));
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      <div
        style={{
          position: 'absolute',
          top: 620,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 500,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          left: -100,
          width: W + 200,
        }}
      >
        {WORD.map((ch, i) => (
          <MaskRise key={ch} start={T.letters[i]} frame={f} dur={12} style={{height: 560}}>
            {ch}
          </MaskRise>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 1290,
          width: W - 144,
          height: 1,
          backgroundColor: SILVER,
          transform: `scaleX(${lerp(f, 62, 104, 0, 1, inOut)})`,
          transformOrigin: 'left',
        }}
      />
      <Label x={72} y={1316} color={SILVER} opacity={lerp(f, 90, 102, 0, 1)}>
        EAU DE PARFUM
      </Label>
      <Label x={W - 72} y={1316} color={SILVER} align="right" opacity={lerp(f, 96, 108, 0, 1)}>
        N° 02
      </Label>
      {ww > 0.5 ? (
        <PhotoWindow src={photo('front')} x={W / 2 - ww / 2} y={wy} w={ww} h={wh} zoom={lerp(f, T.window, 135, 1.25, 1.0)} />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 3 - Contact sheet (135-240): white page, lead frame + two studies,
// kinetic words on the beats, then the lead frame takes the page.
// ---------------------------------------------------------------------------
const LEAD = {x: (W - 620) / 2, y: 300, w: 620, h: 780};
const STUDIES = [
  {src: 'profile-b', x: 230, label: '02 / PROFILE'},
  {src: 'top', x: 574, label: '03 / CROWN'},
];
const WORDS = ['Shadow,', 'line,', 'silence.'];

const ShotSheet: React.FC<{f: number}> = ({f}) => {
  // lead frame fills the screen into the drop
  const take = lerp(f, 222, 240, 0, 1, Easing.bezier(0.7, 0, 0.84, 0));
  const lx = LEAD.x * (1 - take);
  const ly = LEAD.y * (1 - take);
  const lw = LEAD.w + (W - LEAD.w) * take;
  const lh = LEAD.h + (H - LEAD.h) * take;
  const fade = 1 - lerp(f, 222, 232, 0, 1, inOut);
  // the photo inside grows from the lead crop to a full-width square
  const pw = LEAD.w + take * (W - LEAD.w);
  const ph = LEAD.h + take * (W - LEAD.h);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Label x={72} y={96} color={INK} opacity={fade}>
        N° 03
      </Label>
      <Label x={W - 72} y={96} color={INK} align="right" opacity={fade}>
        {`0${Math.min(3, 1 + Math.floor(Math.max(0, f - 135) / 15))} / 03`}
      </Label>
      {STUDIES.map((s, i) => {
        const t = T.sheetFrames[i];
        const open = lerp(f, t, t + 14, 0, 1);
        const size = 276;
        return (
          <div key={s.src} style={{opacity: fade}}>
            <div style={{position: 'absolute', left: s.x, top: 1130, width: size, height: size * open, overflow: 'hidden'}}>
              <PhotoWindow src={photo(s.src)} x={0} y={0} w={size} h={size} zoom={lerp(f, t, t + 40, 1.3, 1.05)} />
            </div>
            <Label x={s.x} y={1130 + size + 22} color={INK} size={18} opacity={lerp(f, t + 6, t + 18, 0, 1)}>
              {s.label}
            </Label>
          </div>
        );
      })}
      <Label x={LEAD.x} y={LEAD.y + LEAD.h + 22} color={INK} size={18} opacity={lerp(f, 140, 152, 0, 1) * fade}>
        01 / FORM
      </Label>
      {/* kinetic words, one per beat */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 1500,
          fontFamily: SERIF,
          fontStyle: 'normal',
          fontSize: 118,
          lineHeight: 1.0,
          color: INK,
          opacity: fade,
          whiteSpace: 'nowrap',
        }}
      >
        {WORDS.map((w, i) => (
          <MaskRise key={w} start={T.words[i]} frame={f} dur={11} style={{marginRight: 26, height: 132}}>
            {w}
          </MaskRise>
        ))}
      </div>
      <div
        style={{position: 'absolute', left: 72, top: 1470, width: W - 144, height: 1, backgroundColor: SILVER, opacity: fade, transform: `scaleX(${lerp(f, 168, 200, 0, 1, inOut)})`, transformOrigin: 'left'}}
      />
      <div style={{position: 'absolute', left: lx, top: ly, width: lw, height: lh, backgroundColor: BLACK, overflow: 'hidden'}}>
        <PhotoWindow
          src={photo('front')}
          x={(lw - pw) / 2}
          y={(lh - ph) / 2}
          w={pw}
          h={ph}
          zoom={lerp(f, 135, 240, 1.0, 1.06, Easing.linear)}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 4 - The cut (240-330): on the drop the photograph is sliced into
// strips that snap back into register; SCENT. lands on the next accent.
// ---------------------------------------------------------------------------
const STRIPS = 9;
const OFFSETS = [-1, 0.6, -0.35, 1, -0.8, 0.45, -0.55, 0.9, -0.25];

const ShotCut: React.FC<{f: number}> = ({f}) => {
  // two hits: the drop and one bar later
  const hit = (start: number, amp: number) =>
    f < start ? 0 : amp * Math.exp(-(f - start) / 4.5) * Math.cos((f - start) * 0.0);
  const k = hit(T.slices[0], 150) + hit(T.slices[1], 90);
  const lineOp = Math.min(1, k / 40);
  // photo travels into the hero frame while the page wipes to white
  const move = lerp(f, T.wipe, 330, 0, 1, inOut);
  const size = W + (640 - W) * move;
  const cx = W / 2;
  const cy = H / 2 + (720 - H / 2) * move;
  const stripH = size / STRIPS;
  const wipe = lerp(f, T.wipe, 326, 0, 1, inOut);
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {/* white page rises from below */}
      <div style={{position: 'absolute', left: 0, top: H * (1 - wipe), width: W, height: H, backgroundColor: PAPER}} />
      <div
        style={{
          position: 'absolute',
          top: 150,
          width: W,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 210,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: '0.04em',
          opacity: 1 - lerp(f, T.wipe - 4, T.wipe + 8, 0, 1, inOut),
        }}
      >
        <MaskRise start={T.scent} frame={f} dur={12} style={{height: 230}}>
          SCENT.
        </MaskRise>
      </div>
      <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size}}>
        {new Array(STRIPS).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: OFFSETS[i] * k,
              top: i * stripH,
              width: size,
              height: stripH + 0.5,
              overflow: 'hidden',
            }}
          >
            <Img
              src={photo('front')}
              style={{position: 'absolute', left: 0, top: -i * stripH, width: size, height: size}}
            />
          </div>
        ))}
        {/* silver hairlines mark the cut while the strips are out of register */}
        {new Array(STRIPS - 1).fill(0).map((_, i) => (
          <div
            key={`l${i}`}
            style={{position: 'absolute', left: -60, top: (i + 1) * stripH, width: size + 120, height: 1, backgroundColor: SILVER, opacity: lineOp}}
          />
        ))}
      </div>
      <Label x={72} y={1700} color={SILVER} opacity={(1 - wipe) * lerp(f, 262, 276, 0, 1)}>
        N° 04
      </Label>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 5 - Signature (330-450): white page, framed photograph, wordmark,
// rule, tagline. Near-still; a 2% push holds attention.
// ---------------------------------------------------------------------------
const ShotSignature: React.FC<{f: number}> = ({f}) => {
  const push = lerp(f, 330, 450, 1, 1.02, Easing.linear);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
        <PhotoWindow src={photo('front')} x={W / 2 - 320} y={720 - 320} w={640} h={640} />
        <div
          style={{
            position: 'absolute',
            top: 1120,
            width: W,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 190,
            lineHeight: 1,
            color: INK,
            letterSpacing: '0.24em',
            paddingLeft: '0.24em',
          }}
        >
          <MaskRise start={T.wordmark} frame={f} dur={16} style={{height: 210}}>
            NOIR
          </MaskRise>
        </div>
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 90,
            top: 1370,
            width: 180,
            height: 1.5,
            backgroundColor: SILVER,
            transform: `scaleX(${lerp(f, T.rule, T.rule + 18, 0, 1, inOut)})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 1410,
            width: W,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 38,
            letterSpacing: '0.36em',
            paddingLeft: '0.36em',
            color: INK,
          }}
        >
          <MaskRise start={T.tagline} frame={f} dur={14} style={{height: 50}}>
            SCENT. WITHOUT WORDS.
          </MaskRise>
        </div>
        <Label x={W / 2} y={1522} color={INK} size={22} align="center" opacity={0.55 * lerp(f, T.tagline + 10, T.tagline + 24, 0, 1)}>
          EAU DE PARFUM
        </Label>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const NoirEditorial: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {f < T.shot2 ? <ShotLine f={f} /> : null}
      {f >= T.shot2 && f < T.shot3 ? <ShotLetters f={f} /> : null}
      {f >= T.shot3 && f < T.shot4 ? <ShotSheet f={f} /> : null}
      {f >= T.shot4 && f < T.shot5 ? <ShotCut f={f} /> : null}
      {f >= T.shot5 ? <ShotSignature f={f} /> : null}
      <Audio src={staticFile('music/noir-editorial-mix.wav')} />
    </AbsoluteFill>
  );
};
