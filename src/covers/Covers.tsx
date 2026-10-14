import React from 'react';
import {AbsoluteFill} from 'remotion';
// Each cover speaks the visual language of its own spot, built from the same components.
import {C, NodeBody, NotifBody, SANS, VantaMark} from '../vanta/ui';
import {K, DISPLAY, MONO, Card} from '../form/system';
import {SiteContent} from '../form/Build';
import {P, DISP, BODY, AlbumArt, wavePath, ringPath} from '../pulse/kit';

// Series grammar (all three): project label at the top, a two-line hook,
// a hero visual from the spot, the name at the bottom. Everything that matters
// sits inside y 240-1680 so the 3:4 profile-grid crop keeps it.
const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- 01 VANTA
export const CoverVanta: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
    {/* faint tilted notification pile behind the flow */}
    {[
      {x: -60, y: 760, r: -9, t: '3 approvals waiting', s: 'Finance · 2h overdue', a: true},
      {x: 560, y: 900, r: 7, t: 'CRM not synced', s: '14 records behind', a: false},
      {x: -30, y: 1180, r: 5, t: '12 new mentions', s: '#ops · #finance', a: false},
      {x: 600, y: 1270, r: -6, t: 'New invoice received', s: 'billing@ · just now', a: true},
    ].map((n, i) => (
      <div key={i} style={{position: 'absolute', left: n.x, top: n.y, width: 540, height: 120, borderRadius: 26, backgroundColor: C.white, opacity: 0.16, transform: `rotate(${n.r}deg)`}}>
        <NotifBody title={n.t} sub={n.s} accent={n.a} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 80, top: 250, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.22em', color: C.grey}}>PROJECT 01 · MOTION SPOT</div>
    <div style={{position: 'absolute', left: 76, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 168, lineHeight: 0.92, letterSpacing: '-0.03em', color: C.white}}>
      TOO MANY
      <br />
      TASKS<span style={{color: C.purple}}>?</span>
    </div>
    {/* the flow: three nodes on a purple line */}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={W / 2} y1={760} x2={W / 2} y2={1300} stroke={C.purple} strokeWidth={10} strokeLinecap="round" />
    </svg>
    {[
      {label: 'New invoice email', kind: 'TRIGGER', ai: false, y: 700},
      {label: 'Extract & classify', kind: 'AI STEP', ai: true, y: 920},
      {label: 'Notify the team', kind: 'DONE', ai: false, y: 1140},
    ].map((n) => (
      <div key={n.label} style={{position: 'absolute', left: (W - 720) / 2, top: n.y, width: 720, height: 160, borderRadius: 40, backgroundColor: C.white, outline: n.ai ? `8px solid ${C.purple}` : undefined}}>
        <NodeBody label={n.label} kind={n.kind} ai={n.ai} />
        <div style={{position: 'absolute', right: 30, top: 58, width: 46, height: 46, borderRadius: 23, backgroundColor: C.purple, color: C.white, fontFamily: SANS, fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 0, width: W, top: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>
      <VantaMark size={120} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, color: C.white, letterSpacing: '0.01em'}}>
        VANTA <span style={{color: C.purple}}>AI</span>
      </div>
    </div>
    <div style={{position: 'absolute', top: 1560, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.12em', color: C.white}}>
      WORK SMARTER. <span style={{color: C.purple}}>AUTOMATE EVERYTHING.</span>
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- 02 FORM
const FormGrid: React.FC = () => (
  <>
    {new Array(14).fill(0).map((_, i) => (
      <div key={`v${i}`} style={{position: 'absolute', left: i * 90, top: 0, width: 2, height: H, backgroundColor: K.line}} />
    ))}
    {new Array(23).fill(0).map((_, i) => (
      <div key={`h${i}`} style={{position: 'absolute', top: i * 90, left: 0, height: 2, width: W, backgroundColor: K.line}} />
    ))}
  </>
);

export const CoverForm: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: K.white, overflow: 'hidden'}}>
    <FormGrid />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={930} cy={330} r={150} fill="none" stroke={K.orange} strokeWidth={5} strokeDasharray="22 16" />
    </svg>
    <div style={{position: 'absolute', left: 0, top: 1560, width: 560, height: 200, backgroundImage: 'repeating-linear-gradient(-45deg, rgba(12,12,12,0.14) 0 3px, transparent 3px 18px)'}} />
    <div style={{position: 'absolute', left: 70, top: 250, fontFamily: MONO, fontSize: 28, color: K.black, opacity: 0.75}}>PROJECT 02 / MOTION SPOT</div>
    <div style={{position: 'absolute', left: 60, top: 300, fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.95, color: K.black}}>
      BORING.
      <div style={{position: 'absolute', left: -20, top: 110, width: 760, height: 40, backgroundColor: K.orange, transform: 'rotate(-10deg)'}} />
    </div>
    <div style={{position: 'absolute', left: 60, top: 540, fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.95, color: K.orange}}>NOT HERE.</div>
    {/* the built site, tilted, with a card breaking out of it */}
    <div style={{position: 'absolute', left: 250, top: 830, width: 940, height: 1200, transform: 'scale(0.6) rotate(-4deg)', transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, border: `5px solid ${K.black}`, backgroundColor: K.white}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 940, height: 64, borderBottom: `4px solid ${K.black}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px'}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 16, height: 16, borderRadius: 8, border: `3px solid ${K.black}`, backgroundColor: i === 0 ? K.orange : 'transparent'}} />
        ))}
        <div style={{marginLeft: 16, fontFamily: MONO, fontSize: 20}}>form.studio</div>
      </div>
      <SiteContent f={200} build={false} />
    </div>
    <div style={{position: 'absolute', left: 90, top: 1120, width: 300, height: 380, transform: 'rotate(8deg)'}}>
      <Card n="02" title="WEB" tone="orange" />
    </div>
    <div style={{position: 'absolute', left: 70, top: 1520, fontFamily: DISPLAY, fontSize: 132, lineHeight: 1, color: K.black, letterSpacing: '0.02em', backgroundColor: K.white, padding: '0 14px'}}>
      FORM STUDIO<span style={{color: K.orange}}>.</span>
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- 03 MUSIC IN MOTION
export const CoverMusic: React.FC = () => {
  const f = 300; // a frozen moment of the animated artwork
  return (
    <AbsoluteFill style={{backgroundColor: P.black, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={ringPath(f, W / 2, 1060, 420, 24, 14)} stroke={P.purple} strokeWidth={6} fill="none" />
        <path d={ringPath(f + 9, W / 2, 1060, 470, 16, 9)} stroke={P.pink} strokeWidth={4} fill="none" />
        <path d={wavePath(f, -40, W + 40, 1060, 90, {seed: 2})} stroke={P.green} strokeWidth={10} fill="none" />
      </svg>
      {/* radial equaliser around the frames */}
      {new Array(18).fill(0).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const h = 60 + 70 * Math.abs(Math.sin(i * 1.7));
        // keep the headline and the disclaimer clear
        if (Math.abs(Math.sin(a)) > 0.55) return null;
        return (
          <div key={i} style={{position: 'absolute', left: W / 2 + Math.cos(a) * 470 - 16, top: 1060 + Math.sin(a) * 520 - h / 2, width: 32, height: h, borderRadius: 16, backgroundColor: [P.green, P.pink, P.white, P.purple][i % 4], transform: `rotate(${(a * 180) / Math.PI + 90}deg)`}} />
        );
      })}
      <div style={{position: 'absolute', left: 80, top: 250, fontFamily: BODY, fontWeight: 800, fontSize: 26, letterSpacing: '0.22em', color: P.mute}}>PROJECT 03 · UNOFFICIAL CONCEPT</div>
      <div style={{position: 'absolute', left: 74, top: 300, fontFamily: DISP, fontWeight: 900, fontSize: 150, lineHeight: 1.04, color: P.white}}>
        PRESS
        <br />
        <span style={{color: P.green}}>PLAY</span>
        <span style={{color: P.pink}}>.</span>
      </div>
      {[
        {art: 'sun' as const, x: 150, y: 900, r: -10, c: P.pink},
        {art: 'bass' as const, x: 630, y: 900, r: 10, c: P.green},
        {art: 'moon' as const, x: 380, y: 840, r: 0, c: P.purple},
      ].map((a) => (
        <div key={a.art} style={{position: 'absolute', left: a.x, top: a.y, width: 320, height: 320, borderRadius: 28, overflow: 'hidden', border: `10px solid ${a.c}`, transform: `rotate(${a.r}deg)`}}>
          <AlbumArt art={a.art} f={f} size={300} />
        </div>
      ))}
      <div style={{position: 'absolute', top: 1380, width: W, textAlign: 'center', fontFamily: DISP, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: P.white}}>
        MUSIC IN
        <br />
        <span style={{color: P.green}}>MOTION</span>
      </div>
      <div style={{position: 'absolute', top: 1590, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 26, color: '#d6cfdc'}}>
        Unofficial portfolio concept inspired by Spotify. Not affiliated.
      </div>
    </AbsoluteFill>
  );
};
