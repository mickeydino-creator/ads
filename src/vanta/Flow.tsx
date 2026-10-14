import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {
  C,
  ChartBody,
  ChatBody,
  H,
  MailBody,
  NodeBody,
  NotifBody,
  SANS,
  TableBody,
  TitleBar,
  W,
  ease,
  lerp,
  mix,
  spr,
} from './ui';

// 3-10 s: the pile of apps flies in, a purple line connects it, everything
// snaps to a grid on the drop, then folds into one five-step automation.

type Rect = {x: number; y: number; w: number; h: number; r: number};
type Kind = 'mail' | 'chart' | 'table' | 'chat' | 'notif';
type El = {
  kind: Kind;
  title: string;
  sub?: string;
  accent?: boolean;
  scatter: Rect;
  from: {x: number; y: number; r: number}; // entry start (off screen), centre coords
  node: number;
  primary: boolean; // the element that remains visible once merged into its node
};

export const NODES = [
  {kind: 'TRIGGER', label: 'New invoice email'},
  {kind: 'AI STEP', label: 'Extract & classify', ai: true},
  {kind: 'ACTION', label: 'Update records'},
  {kind: 'ACTION', label: 'Request approval'},
  {kind: 'DONE', label: 'Notify the team'},
];
export const NODE = {w: 700, h: 150, x: (W - 700) / 2, y0: 560, gap: 210};
export const nodeRect = (i: number): Rect => ({x: NODE.x, y: NODE.y0 + i * NODE.gap, w: NODE.w, h: NODE.h, r: 0});

const ELS: El[] = [
  {kind: 'mail', title: 'Inbox', scatter: {x: 60, y: 340, w: 540, h: 420, r: -5}, from: {x: -500, y: 200, r: -30}, node: 0, primary: true},
  {kind: 'notif', title: 'New invoice received', sub: 'billing@ · just now', accent: true, scatter: {x: 470, y: 290, w: 560, h: 120, r: 4}, from: {x: 1600, y: 100, r: 20}, node: 0, primary: false},
  {kind: 'chart', title: 'Weekly report', scatter: {x: 500, y: 600, w: 520, h: 400, r: 6}, from: {x: 1700, y: 700, r: 25}, node: 1, primary: true},
  {kind: 'table', title: 'Invoices', scatter: {x: 70, y: 860, w: 580, h: 400, r: 3}, from: {x: -600, y: 1100, r: -20}, node: 2, primary: true},
  {kind: 'notif', title: 'CRM not synced', sub: '14 records behind', scatter: {x: 470, y: 1070, w: 540, h: 120, r: -4}, from: {x: 1600, y: 1200, r: 18}, node: 2, primary: false},
  {kind: 'notif', title: '3 approvals waiting', sub: 'Finance · 2h overdue', accent: true, scatter: {x: 40, y: 1300, w: 560, h: 120, r: 5}, from: {x: -600, y: 1500, r: -25}, node: 3, primary: true},
  {kind: 'chat', title: 'Team chat', scatter: {x: 520, y: 1240, w: 500, h: 380, r: -6}, from: {x: 1500, y: 2200, r: 30}, node: 4, primary: true},
  {kind: 'notif', title: '12 new mentions', sub: '#ops · #finance', scatter: {x: 90, y: 1500, w: 520, h: 120, r: -3}, from: {x: 300, y: 2300, r: -20}, node: 4, primary: false},
  {kind: 'notif', title: 'Reminder: send report', sub: 'Today 17:00', scatter: {x: 480, y: 1680, w: 540, h: 120, r: 3}, from: {x: 1500, y: 2100, r: 15}, node: 3, primary: false},
];

// 3x3 alignment grid used on the first snap
const gridRect = (i: number): Rect => {
  const cw = 300;
  const ch = 280;
  const c = i % 3;
  const r = Math.floor(i / 3);
  return {x: 60 + c * (cw + 30), y: 520 + r * (ch + 40), w: cw, h: ch, r: 0};
};

const center = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

// Quadratic path from the entry point into the scattered slot.
const entryRect = (el: El, p: number): Rect => {
  const end = center(el.scatter);
  const ctrl = {x: mix(el.from.x, end.x, 0.5) + (el.from.x < W / 2 ? 200 : -200), y: mix(el.from.y, end.y, 0.2) - 260};
  const q = (a: number, b: number, c: number) => (1 - p) * (1 - p) * a + 2 * (1 - p) * p * b + p * p * c;
  const cx = q(el.from.x, ctrl.x, end.x);
  const cy = q(el.from.y, ctrl.y, end.y);
  return {x: cx - el.scatter.w / 2, y: cy - el.scatter.h / 2, w: el.scatter.w, h: el.scatter.h, r: mix(el.from.r, el.scatter.r, p)};
};

const blend = (a: Rect, b: Rect, t: number): Rect => ({x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t), r: mix(a.r, b.r, t)});

const elementState = (el: El, i: number, f: number) => {
  const start = T.entries[i];
  const pIn = lerp(f, start, start + 16, 0, 1, ease.out);
  let rect = entryRect(el, pIn);
  // organised drift while waiting
  const drift = f > start + 16 ? Math.sin((f + i * 11) / 18) * 6 : 0;
  rect = {...rect, y: rect.y + drift};
  const g = spr(f, T.gridSnap, 240, 20);
  rect = blend(rect, gridRect(i), g);
  const pp = spr(f, T.pipeSnap, 200, 20);
  rect = blend(rect, nodeRect(el.node), pp);
  return {rect, visible: f >= start, pIn, g, pp};
};

const Content: React.FC<{el: El; f: number}> = ({el, f}) => {
  if (el.kind === 'notif') return <NotifBody title={el.title} sub={el.sub ?? ''} accent={el.accent} />;
  return (
    <>
      <TitleBar title={el.title} />
      {el.kind === 'mail' ? <MailBody /> : null}
      {el.kind === 'chart' ? <ChartBody grow={lerp(f, 110, 130, 0.2, 1)} /> : null}
      {el.kind === 'table' ? <TableBody /> : null}
      {el.kind === 'chat' ? <ChatBody /> : null}
    </>
  );
};

export const Flow: React.FC<{f: number}> = ({f}) => {
  const white = f >= T.whiteCut && f < T.whiteCut + 15;
  const states = ELS.map((el, i) => elementState(el, i, f));
  // camera: slow push while the pile builds, recentre after the snap
  const cam = lerp(f, 90, 180, 1.0, 1.06, ease.inOut) * (1 - lerp(f, 180, 200, 0, 0.06, ease.out));

  // the purple line runs through the elements in workflow order, from live positions
  const order = ELS.map((el, i) => ({i, node: el.node, primary: el.primary})).sort((a, b) => a.node - b.node || Number(b.primary) - Number(a.primary));
  const pts = order.map((o) => center(states[o.i].rect));
  let len = 0;
  for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
  const draw = lerp(f, T.drop, T.drop + 14, 0, 1, ease.inOut);
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // counter of open tasks, climbing while the pile builds, collapsing on the drop
  const count = Math.round(f < T.drop ? lerp(f, 92, 172, 0, 47, ease.inOut) : lerp(f, T.drop, T.pipeSnap, 47, 0, ease.out));
  const counterOut = lerp(f, T.pipeSnap, T.pipeSnap + 12, 0, 1, ease.inOut);

  // pulses travel the finished pipeline
  const pulses = [262, 277, 292].map((s) => lerp(f, s, s + 22, 0, 1, ease.inOut));

  const bg = white ? C.paper : C.bg;
  return (
    <AbsoluteFill style={{backgroundColor: bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 64, top: 140, opacity: 1 - counterOut, transform: `translateY(${-counterOut * 40}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 100, lineHeight: 1, color: f < T.drop ? C.white : C.purple, fontVariantNumeric: 'tabular-nums'}}>{count}</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: C.grey, marginTop: 6}}>TASKS PENDING</div>
      </div>
      <div style={{position: 'absolute', left: 64, top: 200, opacity: lerp(f, T.pipeSnap + 8, T.pipeSnap + 18, 0, 1), transform: `translateY(${lerp(f, T.pipeSnap + 8, T.pipeSnap + 20, 30, 0)}px)`, fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: white ? C.ink : C.white}}>
        One flow.
        <br />
        <span style={{color: C.purple}}>Zero busywork.</span>
      </div>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <path
            d={d}
            fill="none"
            stroke={C.purple}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - draw)}
          />
          {pulses.map((p, k) => {
            if (p <= 0 || p >= 1) return null;
            const y = mix(NODE.y0 + NODE.h / 2, NODE.y0 + 4 * NODE.gap + NODE.h / 2, p);
            return <circle key={k} cx={W / 2} cy={y} r={16} fill={white ? C.ink : C.white} stroke={C.purple} strokeWidth={6} />;
          })}
        </svg>
        {ELS.map((el, i) => {
          const s = states[i];
          if (!s.visible) return null;
          const {x, y, w, h, r} = s.rect;
          const toNode = s.pp;
          const fadeMerged = el.primary ? 1 : 1 - lerp(toNode, 0.55, 0.95, 0, 1, ease.inOut);
          const node = NODES[el.node];
          const radius = mix(el.kind === 'notif' ? 26 : 22, 40, toNode);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                transform: `rotate(${r}deg) scale(${mix(0.6, 1, s.pIn)})`,
                borderRadius: radius,
                backgroundColor: C.white,
                outline: white ? `3px solid ${C.ink}` : undefined,
                overflow: 'hidden',
                opacity: fadeMerged,
              }}
            >
              <div style={{position: 'absolute', inset: 0, opacity: 1 - lerp(toNode, 0.1, 0.5, 0, 1, ease.inOut)}}>
                <div
                  style={{
                    width: el.scatter.w,
                    height: el.scatter.h,
                    transformOrigin: 'top left',
                    transform: (() => {
                      const k = Math.min(w / el.scatter.w, h / el.scatter.h);
                      return `translate(${(w - el.scatter.w * k) / 2}px, ${(h - el.scatter.h * k) / 2}px) scale(${k})`;
                    })(),
                  }}
                >
                  <Content el={el} f={f} />
                </div>
              </div>
              <div style={{position: 'absolute', inset: 0, opacity: lerp(toNode, 0.45, 0.85, 0, 1, ease.inOut)}}>
                <NodeBody label={node.label} kind={node.kind} ai={node.ai} inv={white} />
              </div>
              {/* step number badge on the finished nodes */}
              <div
                style={{
                  position: 'absolute',
                  right: 26,
                  top: h / 2 - 22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: f >= 262 + el.node * 5 ? C.purple : '#e6e6ec',
                  color: f >= 262 + el.node * 5 ? C.white : C.grey,
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: lerp(toNode, 0.7, 1, 0, 1) * (el.primary ? 1 : 0),
                }}
              >
                {f >= 262 + el.node * 5 ? '✓' : el.node + 1}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
