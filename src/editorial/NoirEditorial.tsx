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
}> = ({children, x, y, color, size = 26, align = 'left', opacity = 1}) => (
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

// Layout grid: one image column (x 230-850) shared by every page.
const COL_X = 230;
const COL_W = 620;
const LEAD = {x: COL_X, y: 300, w: COL_W, h: 700};
// Frame used on the black pages (shot 4), photos never shown larger than this.
const STAGE = {w: 660, h: 800, cy: 1010};
const FOLIO_Y = 232;

// ---------------------------------------------------------------------------
// Shot 1 - The line (0-60): a hairline draws, opens into a slit onto the cap.
// ---------------------------------------------------------------------------
const ShotLine: React.FC<{f: number}> = ({f}) => {
  const draw = lerp(f, 0, 12, 0, 1);
  const slit = lerp(f, 8, 22, 0, 360, out);
  const expand = lerp(f, 46, 60, 0, 1, inOut);
  const bandH = slit + (H - slit) * expand;
  const top = H / 2 - bandH / 2;
  const imgSize = 760;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Label x={72} y={FOLIO_Y} color={INK} opacity={lerp(f, 4, 16, 0, 1) * (1 - expand)}>
        N° 01
      </Label>
      <Label x={W - 72} y={FOLIO_Y} color={INK} align="right" opacity={lerp(f, 8, 20, 0, 1) * (1 - expand)}>
        NOIR
      </Label>
      <div style={{position: 'absolute', left: 0, top, width: W, height: bandH, overflow: 'hidden', backgroundColor: BLACK}}>
        <Img
          src={photo('cap-macro')}
          style={{
            position: 'absolute',
            left: (W - imgSize) / 2,
            top: H / 2 - top - imgSize / 2,
            width: imgSize,
            height: imgSize,
            transform: `scale(${lerp(f, 8, 60, 1.1, 1.0, Easing.out(Easing.quad))})`,
          }}
        />
      </div>
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            left: 0,
            top: H / 2 + (s * bandH) / 2 - 0.75,
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
// Shot 2 - The letters (60-135): NOIR set inside the margins, cut in on the
// eighth notes, held whole, then a window opens on the bottle behind it.
// ---------------------------------------------------------------------------
const WORD = ['N', 'O', 'I', 'R'];
const ShotLetters: React.FC<{f: number}> = ({f}) => {
  const winOpen = lerp(f, T.window, T.window + 14, 0, 1);
  const winGrow = lerp(f, 121, 135, 0, 1, inOut);
  const ww = winOpen * 300 + winGrow * (LEAD.w - 300);
  const wh = 760 + winGrow * (LEAD.h - 760);
  const wy = H / 2 - wh / 2 + winGrow * (LEAD.y - (H / 2 - LEAD.h / 2));
  const wordOut = lerp(f, 112, 122, 0, 1, inOut);
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {ww > 0.5 ? (
        <PhotoWindow src={photo('front')} x={W / 2 - ww / 2} y={wy} w={ww} h={wh} zoom={lerp(f, T.window, 135, 1.2, 1.0)} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 760,
          width: W,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 380,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          opacity: 1 - wordOut,
          transform: `translateY(${-wordOut * 30}px)`,
        }}
      >
        {WORD.map((ch, i) => (
          <MaskRise key={ch} start={T.letters[i]} frame={f} dur={10} style={{height: 420}}>
            {ch}
          </MaskRise>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 1250,
          width: W - 144,
          height: 1,
          backgroundColor: SILVER,
          opacity: 1 - wordOut,
          transform: `scaleX(${lerp(f, 60, 96, 0, 1, inOut)})`,
          transformOrigin: 'left',
        }}
      />
      <Label x={72} y={1276} color={SILVER} opacity={lerp(f, 86, 98, 0, 1) * (1 - wordOut)}>
        EAU DE PARFUM
      </Label>
      <Label x={W - 72} y={1276} color={SILVER} align="right" opacity={lerp(f, 92, 104, 0, 1) * (1 - wordOut)}>
        N° 02
      </Label>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 3 - Contact sheet (135-240): white page on one column grid, lead frame,
// two studies, a two-line headline on the beats; the page then turns black
// around the lead frame for the drop.
// ---------------------------------------------------------------------------
const STUDY = 290;
const STUDIES = [
  {src: 'profile-b', x: COL_X, label: '02 / PROFILE'},
  {src: 'top', x: COL_X + COL_W - STUDY, label: '03 / CROWN'},
];
const STUDY_Y = LEAD.y + LEAD.h + 74;
const HEAD_Y = STUDY_Y + STUDY + 92;

const ShotSheet: React.FC<{f: number}> = ({f}) => {
  const take = lerp(f, 222, 240, 0, 1, inOut);
  const fade = 1 - lerp(f, 220, 230, 0, 1, inOut);
  // black page grows out of the lead frame; the photo frame travels to the stage
  const bx = LEAD.x * (1 - take);
  const by = LEAD.y * (1 - take);
  const bw = LEAD.w + (W - LEAD.w) * take;
  const bh = LEAD.h + (H - LEAD.h) * take;
  const pw = LEAD.w + (STAGE.w - LEAD.w) * take;
  const ph = LEAD.h + (STAGE.h - LEAD.h) * take;
  const pcy = LEAD.y + LEAD.h / 2 + (STAGE.cy - (LEAD.y + LEAD.h / 2)) * take;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Label x={72} y={FOLIO_Y} color={INK} opacity={fade}>
        N° 03
      </Label>
      <Label x={W - 72} y={FOLIO_Y} color={INK} align="right" opacity={fade}>
        {`0${Math.min(3, 1 + Math.floor(Math.max(0, f - 135) / 15))} / 03`}
      </Label>
      <Label x={LEAD.x} y={LEAD.y + LEAD.h + 22} color={INK} size={22} opacity={lerp(f, 140, 152, 0, 1) * fade}>
        01 / FORM
      </Label>
      {STUDIES.map((s, i) => {
        const t = T.sheetFrames[i];
        const open = lerp(f, t, t + 14, 0, 1);
        return (
          <div key={s.src} style={{opacity: fade}}>
            <div style={{position: 'absolute', left: s.x, top: STUDY_Y, width: STUDY, height: STUDY * open, overflow: 'hidden'}}>
              <PhotoWindow src={photo(s.src)} x={0} y={0} w={STUDY} h={STUDY} zoom={lerp(f, t, t + 40, 1.3, 1.05)} />
            </div>
            <Label x={s.x} y={STUDY_Y + STUDY + 22} color={INK} size={22} opacity={lerp(f, t + 6, t + 18, 0, 1)}>
              {s.label}
            </Label>
          </div>
        );
      })}
      <div
        style={{position: 'absolute', left: COL_X, top: HEAD_Y - 30, width: COL_W, height: 1, backgroundColor: SILVER, opacity: fade, transform: `scaleX(${lerp(f, 168, 200, 0, 1, inOut)})`, transformOrigin: 'left'}}
      />
      <div style={{position: 'absolute', left: COL_X, top: HEAD_Y, fontFamily: SERIF, fontSize: 96, lineHeight: 1.04, color: INK, opacity: fade}}>
        <div style={{whiteSpace: 'nowrap'}}>
          <MaskRise start={T.words[0]} frame={f} dur={11} style={{marginRight: 24, height: 104}}>
            Shadow,
          </MaskRise>
          <MaskRise start={T.words[1]} frame={f} dur={11} style={{height: 104}}>
            line,
          </MaskRise>
        </div>
        <MaskRise start={T.words[2]} frame={f} dur={11} style={{height: 104}}>
          silence.
        </MaskRise>
      </div>
      <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, backgroundColor: BLACK}} />
      <PhotoWindow src={photo('front')} x={W / 2 - pw / 2} y={pcy - ph / 2} w={pw} h={ph} zoom={lerp(f, 135, 240, 1.0, 1.05, Easing.linear)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 4 - The cut (240-330): hard cut on the drop to a new angle in the same
// frame; four bands step out of register and ease back, twice on the bar.
// ---------------------------------------------------------------------------
// Band cuts sit above the shoulders and below the label so cap and label stay whole.
const BANDS = [0, 0.3, 0.72, 0.86, 1];
const SHIFT = [-1, 0.7, -0.55, 0.85];
const HERO = {size: 640, cy: 720};
const BLEED = 90; // bands are wider than the frame so a shift never exposes an edge

const ShotCut: React.FC<{f: number}> = ({f}) => {
  const hit = (start: number, amp: number) => (f < start ? 0 : amp * lerp(f, start, start + 12, 1, 0, Easing.bezier(0.2, 0.9, 0.3, 1)));
  const k = hit(T.slices[0], 38) + hit(T.slices[1], 24);
  const lineOp = Math.min(1, k / 14);
  const wipe = lerp(f, T.wipe, 326, 0, 1, inOut);
  // the frame travels into the signature frame while the page turns white
  const move = lerp(f, T.wipe, 330, 0, 1, inOut);
  const fw = STAGE.w + (HERO.size - STAGE.w) * move;
  const fh = STAGE.h + (HERO.size - STAGE.h) * move;
  const fcy = STAGE.cy + (HERO.cy - STAGE.cy) * move;
  const x0 = W / 2 - fw / 2;
  const y0 = fcy - fh / 2;
  const imgSize = Math.max(fw, fh);
  // on the half-beat the front view slides in over the angle, inside the frame
  const swap = lerp(f, 315, 327, 0, 1, inOut);
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      <div
        style={{
          position: 'absolute',
          top: 250,
          width: W,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 190,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: '0.06em',
          paddingLeft: '0.06em',
        }}
      >
        <MaskRise start={T.scent} frame={f} dur={12} style={{height: 210}}>
          SCENT.
        </MaskRise>
      </div>
      <Label x={W / 2 - STAGE.w / 2} y={STAGE.cy + STAGE.h / 2 + 24} color={SILVER} size={22} opacity={lerp(f, 262, 276, 0, 1)}>
        04 / ANGLE
      </Label>
      {/* white page rises behind the photograph */}
      <div style={{position: 'absolute', left: 0, top: H * (1 - wipe), width: W, height: H, backgroundColor: PAPER}} />
      <div style={{position: 'absolute', left: x0, top: y0, width: fw, height: fh, overflow: 'hidden', backgroundColor: '#1c1d20'}}>
        {SHIFT.map((sh, i) => {
          const top = Math.round(BANDS[i] * fh);
          const bottom = Math.round(BANDS[i + 1] * fh);
          return (
            <div key={i} style={{position: 'absolute', left: -BLEED + sh * k, top, width: fw + BLEED * 2, height: bottom - top + (i < SHIFT.length - 1 ? 1 : 0), overflow: 'hidden'}}>
              <Img
                src={photo('three-quarter-r')}
                style={{position: 'absolute', left: BLEED + (fw - imgSize) / 2, top: (fh - imgSize) / 2 - top, width: imgSize, height: imgSize}}
              />
            </div>
          );
        })}
        {BANDS.slice(1, -1).map((b) => (
          <div key={b} style={{position: 'absolute', left: 0, top: Math.round(b * fh), width: fw, height: 1, backgroundColor: SILVER, opacity: lineOp}} />
        ))}
        {swap > 0 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: fw, height: fh * swap, overflow: 'hidden'}}>
            <PhotoWindow src={photo('front')} x={0} y={0} w={fw} h={fh} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot 5 - Signature (330-450): framed photograph, wordmark, rule, tagline.
// One restrained accent on the 13 s downbeat: a hairline frame draws.
// ---------------------------------------------------------------------------
const ShotSignature: React.FC<{f: number}> = ({f}) => {
  const push = lerp(f, 330, 450, 1, 1.02, Easing.linear);
  const frameDraw = lerp(f, T.endAccent, T.endAccent + 20, 0, 1, inOut);
  const pad = 22;
  const fx = W / 2 - HERO.size / 2 - pad;
  const fy = HERO.cy - HERO.size / 2 - pad;
  const fs = HERO.size + pad * 2;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
        <div style={{position: 'absolute', left: W / 2 - HERO.size / 2, top: HERO.cy - HERO.size / 2, width: HERO.size, height: HERO.size, overflow: 'hidden'}}>
          <PhotoWindow src={photo('front')} x={0} y={0} w={HERO.size} h={HERO.size} />
        </div>
        {/* hairline frame: top+bottom draw from the centre, sides from the top */}
        <div style={{position: 'absolute', left: fx, top: fy, width: fs, height: 1, backgroundColor: INK, transform: `scaleX(${frameDraw})`}} />
        <div style={{position: 'absolute', left: fx, top: fy + fs, width: fs, height: 1, backgroundColor: INK, transform: `scaleX(${frameDraw})`}} />
        <div style={{position: 'absolute', left: fx, top: fy, width: 1, height: fs, backgroundColor: INK, transform: `scaleY(${frameDraw})`}} />
        <div style={{position: 'absolute', left: fx + fs, top: fy, width: 1, height: fs, backgroundColor: INK, transform: `scaleY(${frameDraw})`}} />
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
        <div style={{position: 'absolute', top: 1410, width: W, textAlign: 'center', fontFamily: SANS, fontSize: 38, letterSpacing: '0.36em', paddingLeft: '0.36em', color: INK}}>
          <MaskRise start={T.tagline} frame={f} dur={14} style={{height: 50}}>
            SCENT. WITHOUT WORDS.
          </MaskRise>
        </div>
        <Label x={W / 2} y={1500} color={INK} size={24} align="center" opacity={0.55 * lerp(f, T.tagline + 10, T.tagline + 24, 0, 1)}>
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
