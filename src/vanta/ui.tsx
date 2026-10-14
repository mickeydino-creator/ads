import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  bg: '#0a0a0c',
  panel: '#141418',
  line: '#26262d',
  white: '#ffffff',
  paper: '#f4f4f6',
  ink: '#0d0d10',
  grey: '#8a8a96',
  soft: '#d9d9e0',
  purple: '#7b3cff',
  purpleDeep: '#5a22d6',
};

export const SANS = 'VantaSans';
for (const w of ['500', '700', '800']) {
  loadFont({family: SANS, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: w});
}

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  snap: Easing.bezier(0.2, 0.9, 0.1, 1),
};

export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ease.out) =>
  interpolate(f, [a, b], [from, to], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const spr = (f: number, start: number, stiffness = 170, damping = 16) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- small UI building blocks (all flat, no glow) ----------

export const Bar: React.FC<{w: number | string; h?: number; color?: string; r?: number; style?: React.CSSProperties}> = ({
  w,
  h = 14,
  color = C.soft,
  r = 7,
  style,
}) => <div style={{width: w, height: h, borderRadius: r, backgroundColor: color, flexShrink: 0, ...style}} />;

export const Dot: React.FC<{s: number; color: string; style?: React.CSSProperties}> = ({s, color, style}) => (
  <div style={{width: s, height: s, borderRadius: s / 2, backgroundColor: color, flexShrink: 0, ...style}} />
);

export const TitleBar: React.FC<{title: string; dark?: boolean}> = ({title, dark}) => (
  <div
    style={{
      height: 58,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 22px',
      borderBottom: `2px solid ${dark ? C.line : '#ececf1'}`,
    }}
  >
    <Dot s={14} color={dark ? '#3a3a44' : '#d4d4dc'} />
    <Dot s={14} color={dark ? '#3a3a44' : '#d4d4dc'} />
    <Dot s={14} color={dark ? '#3a3a44' : '#d4d4dc'} />
    <div style={{marginLeft: 14, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: dark ? C.white : C.ink}}>{title}</div>
  </div>
);

// Window contents --------------------------------------------------------

export const MailBody: React.FC = () => (
  <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 18}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <Dot s={40} color={i === 1 ? C.purple : '#e3e3ea'} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, flex: 1}}>
          <Bar w={`${55 + ((i * 17) % 30)}%`} h={13} color={i === 1 ? C.ink : '#c9c9d2'} />
          <Bar w={`${80 - ((i * 13) % 25)}%`} h={10} color="#e6e6ec" />
        </div>
      </div>
    ))}
  </div>
);

export const ChartBody: React.FC<{grow?: number}> = ({grow = 1}) => {
  const vals = [0.45, 0.7, 0.38, 0.85, 0.6, 0.95, 0.52];
  return (
    <div style={{padding: '26px 26px 18px', height: 'calc(100% - 58px)', display: 'flex', flexDirection: 'column'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.ink}}>+38%</div>
      <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 14}}>
        {vals.map((v, i) => (
          <div key={i} style={{flex: 1, height: `${v * 100 * grow}%`, borderRadius: 6, backgroundColor: i === 5 ? C.purple : '#1d1d24'}} />
        ))}
      </div>
    </div>
  );
};

export const TableBody: React.FC = () => (
  <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 0}}>
    {[0, 1, 2, 3, 4].map((r) => (
      <div key={r} style={{display: 'flex', gap: 14, padding: '12px 0', borderBottom: '2px solid #efeff3'}}>
        <Bar w={90} h={13} color={r === 0 ? C.ink : '#cfcfd8'} />
        <Bar w={140} h={13} color={r === 0 ? C.ink : '#e1e1e8'} />
        <Bar w={70} h={13} color={r === 2 ? C.purple : r === 0 ? C.ink : '#e1e1e8'} />
      </div>
    ))}
  </div>
);

export const ChatBody: React.FC = () => (
  <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{alignSelf: i % 2 ? 'flex-end' : 'flex-start', display: 'flex', gap: 10, alignItems: 'center'}}>
        {i % 2 ? null : <Dot s={34} color="#dedee6" />}
        <div style={{padding: '12px 18px', borderRadius: 16, backgroundColor: i % 2 ? C.purple : '#efeff3'}}>
          <Bar w={120 + ((i * 47) % 90)} h={11} color={i % 2 ? 'rgba(255,255,255,0.75)' : '#c4c4ce'} />
        </div>
      </div>
    ))}
  </div>
);

export const NotifBody: React.FC<{title: string; sub: string; accent?: boolean}> = ({title, sub, accent}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', height: '100%'}}>
    <div style={{width: 58, height: 58, borderRadius: 16, backgroundColor: accent ? C.purple : C.ink, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Dot s={16} color={C.white} />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.ink, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 21, color: C.grey, whiteSpace: 'nowrap'}}>{sub}</div>
    </div>
  </div>
);

// Pipeline node content (what every element becomes)
export const NodeBody: React.FC<{label: string; kind: string; ai?: boolean; inv?: boolean}> = ({label, kind, ai, inv}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', height: '100%'}}>
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 22,
        backgroundColor: ai ? C.purple : inv ? C.white : C.ink,
        border: inv && !ai ? `3px solid ${C.ink}` : undefined,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 30,
        color: ai ? C.white : inv ? C.ink : C.white,
      }}
    >
      {ai ? 'AI' : <Dot s={20} color={inv ? C.ink : C.white} />}
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: '0.14em', color: ai ? C.purple : C.grey}}>{kind}</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.ink, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  </div>
);

// The VANTA mark: a rounded square with a V built from two strokes and a node dot.
export const VantaMark: React.FC<{size: number; draw?: number; bg?: string}> = ({size, draw = 1, bg = C.purple}) => {
  const len = 260;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <rect x="0" y="0" width="200" height="200" rx="52" fill={bg} />
      <path
        d="M52 62 L100 146 L148 62"
        fill="none"
        stroke={C.white}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      <circle cx="148" cy="62" r={14 * Math.min(1, Math.max(0, draw * 2 - 1))} fill={C.white} />
    </svg>
  );
};
