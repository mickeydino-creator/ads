import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {C, Dot, SANS, VantaMark, W, ease, lerp, mix, spr} from './ui';

// 10.6-13 s: the AI node's purple square has filled the frame; the VANTA app
// expands out of it panel by panel, the camera pushes to the Autopilot switch,
// and its knob opens into a white flash.

const APP = {x: 50, y: 250, w: 980, h: 1420};
const TOGGLE = {x: APP.x + APP.w - 40 - 150, y: APP.y + 46, w: 150, h: 76};

const Panel: React.FC<{fadeForPush: number; f: number; start: number; x: number; y: number; w: number; h: number; children: React.ReactNode; from?: 'up' | 'left' | 'right'}> = ({
  f,
  start,
  x,
  y,
  w,
  h,
  children,
  from = 'up',
  fadeForPush,
}) => {
  const p = spr(f, start, 320, 13);
  const dx = from === 'left' ? -120 : from === 'right' ? 120 : 0;
  const dy = from === 'up' ? 90 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 30,
        backgroundColor: C.panel,
        border: `2px solid ${C.line}`,
        overflow: 'hidden',
        opacity: (f >= start ? 1 : 0) * (1 - fadeForPush),
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${mix(0.8, 1, p)})`,
      }}
    >
      {children}
    </div>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: '0.18em', color: C.grey}}>{children}</div>
);

export const Interface: React.FC<{f: number}> = ({f}) => {
  const open = lerp(f, 318, 328, 0, 1, ease.out);
  const ax = mix(W / 2 - 40, APP.x, open);
  const ay = mix(960 - 40, APP.y, open);
  const aw = mix(80, APP.w, open);
  const ah = mix(80, APP.h, open);
  const [p1, p2, p3, p4] = T.panels;
  // camera: push in toward the switch
  const push = lerp(f, 358, 376, 0, 1, ease.inOut);
  const cs = mix(1, 1.9, push) * mix(1, 1.8, lerp(f, 368, 390, 0, 1, ease.inOut));
  const fx = TOGGLE.x + TOGGLE.w - 38;
  const fy = TOGGLE.y + TOGGLE.h / 2;
  const tasks = Math.round(lerp(f, p2, p2 + 30, 0, 12480, ease.out));
  const hours = Math.round(lerp(f, p2 + 4, p2 + 34, 0, 326, ease.out));
  // knob opens into a white field
  const knobR = mix(28, 1120, lerp(f, T.circleWipe - 2, T.impact, 0, 1, ease.inOut));
  const steps = ['New invoice email', 'Extract & classify', 'Update records', 'Request approval', 'Notify the team'];
  return (
    <AbsoluteFill style={{backgroundColor: C.purple, overflow: 'hidden'}}>
      {[
        {x: -260, y: 120, w: 760, h: 520, c: '#6c2cf2', sp: 1.0},
        {x: 620, y: 1240, w: 700, h: 760, c: '#8a52ff', sp: -0.7},
        {x: 560, y: -180, w: 620, h: 420, c: '#8a52ff', sp: 0.55},
        {x: -200, y: 1500, w: 640, h: 380, c: '#6c2cf2', sp: -1.2},
      ].map((b, i) => {
        const grow = lerp(f, 318 + i * 3, 336 + i * 3, 0, 1, ease.out);
        const t = (f - 318) * b.sp;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x + t * 2.2,
              top: b.y - t * 1.4,
              width: b.w,
              height: b.h,
              borderRadius: 60,
              backgroundColor: b.c,
              transform: `scale(${grow}) rotate(${-8 + i * 5}deg)`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{transform: `translate(${(W / 2 - fx) * push}px, ${(960 - fy) * push}px) scale(${cs})`, transformOrigin: `${fx}px ${fy}px`}}>
        <div style={{position: 'absolute', left: ax, top: ay, width: aw, height: ah, borderRadius: mix(22, 44, open), backgroundColor: C.bg, overflow: 'hidden'}}>
          {/* header */}
          <div style={{position: 'absolute', left: 40, top: 40, display: 'flex', alignItems: 'center', gap: 20, opacity: lerp(f, p1, p1 + 8, 0, 1), transform: `translateY(${lerp(f, p1, p1 + 10, 30, 0)}px)`}}>
            <VantaMark size={84} draw={lerp(f, p1, p1 + 12, 0, 1, ease.inOut)} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, letterSpacing: '0.02em'}}>
              VANTA <span style={{color: C.purple}}>AI</span>
            </div>
          </div>
          {/* autopilot switch */}
          <div style={{position: 'absolute', left: TOGGLE.x - APP.x, top: TOGGLE.y - APP.y, opacity: lerp(f, p1 + 4, p1 + 12, 0, 1)}}>
            <div style={{width: TOGGLE.w, height: TOGGLE.h, borderRadius: TOGGLE.h / 2, backgroundColor: f >= p4 + 4 ? C.purple : '#2c2c34', position: 'relative'}}>
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: mix(10, TOGGLE.w - 66, lerp(f, p4 + 2, p4 + 10, 0, 1, ease.out)),
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: C.white,
                }}
              />
            </div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', color: C.grey, marginTop: 10, textAlign: 'center'}}>AUTOPILOT</div>
          </div>
          {/* stats */}
          <Panel fadeForPush={lerp(f, 356, 366, 0, 1, ease.inOut)} f={f} start={p2} x={40} y={200} w={430} h={260} from="left">
            <div style={{padding: 34}}>
              <Kicker>TASKS AUTOMATED</Kicker>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 78, color: C.white, marginTop: 18, fontVariantNumeric: 'tabular-nums'}}>{tasks.toLocaleString('en-US')}</div>
              <div style={{width: 120, height: 8, borderRadius: 4, backgroundColor: C.purple, marginTop: 16}} />
            </div>
          </Panel>
          <Panel fadeForPush={lerp(f, 356, 366, 0, 1, ease.inOut)} f={f} start={p2 + 3} x={510} y={200} w={430} h={260} from="right">
            <div style={{padding: 34}}>
              <Kicker>HOURS SAVED</Kicker>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 78, color: C.white, marginTop: 18, fontVariantNumeric: 'tabular-nums'}}>
                {hours}
                <span style={{fontSize: 40, color: C.grey}}> h</span>
              </div>
              <div style={{width: 120, height: 8, borderRadius: 4, backgroundColor: C.white, marginTop: 16}} />
            </div>
          </Panel>
          {/* the workflow, now one tidy list */}
          <Panel fadeForPush={lerp(f, 356, 366, 0, 1, ease.inOut)} f={f} start={p3} x={40} y={500} w={900} h={560}>
            <div style={{padding: '34px 34px 0'}}>
              <Kicker>WORKFLOW · INVOICES</Kicker>
            </div>
            <div style={{position: 'absolute', left: 66, top: 112, width: 6, height: lerp(f, p3 + 4, p3 + 20, 0, 4 * 92, ease.inOut), backgroundColor: C.purple, borderRadius: 3}} />
            {steps.map((s, i) => {
              const p = spr(f, p3 + 3 + i * 2, 260, 20);
              return (
                <div key={s} style={{position: 'absolute', left: 50, top: 96 + i * 92, display: 'flex', alignItems: 'center', gap: 26, opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
                  <Dot s={38} color={i === 1 ? C.purple : C.white} style={{border: `6px solid ${C.bg}`}} />
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.white}}>{s}</div>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.purple, letterSpacing: '0.12em'}}>{i === 1 ? 'AI' : ''}</div>
                </div>
              );
            })}
          </Panel>
          {/* activity */}
          <Panel fadeForPush={lerp(f, 356, 366, 0, 1, ease.inOut)} f={f} start={p4} x={40} y={1100} w={900} h={280}>
            <div style={{padding: '30px 34px 0'}}>
              <Kicker>THIS WEEK</Kicker>
            </div>
            <div style={{position: 'absolute', left: 34, right: 34, bottom: 30, height: 150, display: 'flex', alignItems: 'flex-end', gap: 16}}>
              {[0.35, 0.5, 0.42, 0.66, 0.58, 0.82, 1].map((v, i) => (
                <div key={i} style={{flex: 1, borderRadius: 8, height: `${v * 100 * spr(f, p4 + 2 + i, 220, 18)}%`, backgroundColor: i === 6 ? C.purple : '#2c2c34'}} />
              ))}
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
      {f >= T.circleWipe - 2 ? (
        <div style={{position: 'absolute', left: W / 2 - knobR, top: 960 - knobR, width: knobR * 2, height: knobR * 2, borderRadius: knobR, backgroundColor: C.white}} />
      ) : null}
    </AbsoluteFill>
  );
};
