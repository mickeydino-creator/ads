import React from 'react';
import {K, LOUD, SERIF, Scissors, Stripes, Txt, UI} from './system';

// ---------- the content that survives the redesign ----------
// Each key item has a loud "before" look and a clean "after" look.

export type Pose = {x: number; y: number; rot: number};

export type KeyItem = {
  id: string;
  before: Pose;
  after: Pose;
  Before: React.FC;
  After: React.FC;
};

const stroke = (w: number, c: string = K.ink): React.CSSProperties => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill'});

export const Name17: React.FC<{size?: number}> = ({size = 190}) => (
  <span style={{fontFamily: SERIF, fontWeight: 900, fontSize: size, color: K.ink, letterSpacing: '-0.01em'}}>
    מספרה <span style={{color: K.accent}}>17</span>
  </span>
);

export const Pill: React.FC<{label: string; fill?: string; color?: string; size?: number; icon?: React.ReactNode}> = ({
  label,
  fill = K.accent,
  color = K.paper,
  size = 46,
  icon,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.4,
      height: size * 2.3,
      padding: `0 ${size * 1.1}px`,
      borderRadius: size * 1.15,
      backgroundColor: fill,
      fontFamily: UI,
      fontWeight: 700,
      fontSize: size,
      color,
      direction: 'rtl',
    }}
  >
    {label}
    {icon}
  </div>
);

export const KEYS: KeyItem[] = [
  {
    id: 'name',
    before: {x: 540, y: 700, rot: -3},
    after: {x: 540, y: 640, rot: 0},
    Before: () => (
      <span style={{fontFamily: UI, fontWeight: 900, fontStyle: 'italic', fontSize: 168, color: K.blue, ...stroke(10, K.yellow)}}>מספרה 17</span>
    ),
    After: () => <Name17 />,
  },
  {
    id: 'cut',
    before: {x: 400, y: 935, rot: 0},
    after: {x: 680, y: 885, rot: 0},
    Before: () => <span style={{fontFamily: UI, fontWeight: 800, fontSize: 78, color: K.green}}>תספורת גברים!!</span>,
    After: () => <span style={{fontFamily: UI, fontWeight: 500, fontSize: 70, color: K.ink}}>תספורת</span>,
  },
  {
    id: 'beard',
    before: {x: 420, y: 1045, rot: 0},
    after: {x: 430, y: 885, rot: 0},
    Before: () => <span style={{fontFamily: UI, fontWeight: 800, fontSize: 78, color: K.green}}>עיצוב זקן!!</span>,
    After: () => <span style={{fontFamily: UI, fontWeight: 500, fontSize: 70, color: K.ink}}>זקן</span>,
  },
  {
    id: 'fri',
    before: {x: 640, y: 1290, rot: 4},
    after: {x: 540, y: 1000, rot: 0},
    Before: () => <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: K.purple}}>פתוח גם בשישי!!!</span>,
    After: () => <span style={{fontFamily: UI, fontWeight: 400, fontSize: 52, color: K.muted}}>פתוח גם בשישי</span>,
  },
  {
    id: 'phone',
    before: {x: 540, y: 1445, rot: 0},
    after: {x: 540, y: 1165, rot: 0},
    Before: () => (
      <span style={{fontFamily: UI, fontWeight: 900, fontSize: 118, color: K.ink, borderBottom: `14px solid ${K.red}`, direction: 'ltr', display: 'inline-block'}}>
        050-000-0000
      </span>
    ),
    After: () => <Pill label="קובעים תור בהודעה" />,
  },
];

// ---------- the loud flyer ----------

const Burst: React.FC<{r: number; points?: number; fill: string}> = ({r, points = 18, fill}) => {
  const pts = new Array(points * 2)
    .fill(0)
    .map((_, i) => {
      const a = (i / (points * 2)) * Math.PI * 2;
      const rr = i % 2 ? r * 0.74 : r;
      return `${r + Math.cos(a) * rr},${r + Math.sin(a) * rr}`;
    })
    .join(' ');
  return (
    <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: 0, top: 0}}>
      <polygon points={pts} fill={fill} stroke={K.ink} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  );
};

const Sticker: React.FC<{x: number; y: number; r: number; fill: string; rot: number; s?: number; children: React.ReactNode}> = ({x, y, r, fill, rot, s = 1, children}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `rotate(${rot}deg) scale(${s})`}}>
    <Burst r={r} fill={fill} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', direction: 'rtl'}}>
      {children}
    </div>
  </div>
);

// `extras` 0..3: how many escalation stickers are visible; `pops` gives their scale
export const Flyer: React.FC<{hideKeys?: boolean; pops?: number[]}> = ({hideKeys, pops = [1, 1, 1]}) => (
  <div style={{position: 'absolute', inset: 0, backgroundColor: K.yellow, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 34, border: `8px dashed ${K.red}`}} />
    {/* zigzag top edge */}
    <svg width={1080} height={70} style={{position: 'absolute', top: 120, left: 0}}>
      <polyline
        points={new Array(28).fill(0).map((_, i) => `${i * 40},${i % 2 ? 60 : 10}`).join(' ')}
        fill="none"
        stroke={K.blue}
        strokeWidth={8}
      />
    </svg>
    {/* red promo banner */}
    <div style={{position: 'absolute', left: -40, right: -40, top: 445, height: 150, backgroundColor: K.red, transform: 'rotate(-3deg)'}} />
    <Txt x={540} y={515} transform="rotate(-3deg)" style={{fontFamily: LOUD, fontSize: 132, color: K.paper, ...stroke(8)}}>
      מבצע!!! מבצע!!!
    </Txt>
    <Sticker x={860} y={1000} r={150} fill={K.red} rot={12}>
      <span style={{fontFamily: LOUD, fontSize: 52, lineHeight: 1, color: K.yellow, ...stroke(5)}}>
        מחירים
        <br />
        מטורפים!!
      </span>
    </Sticker>
    <Txt x={540} y={1160} style={{fontFamily: UI, fontWeight: 500, fontSize: 50, color: K.ink}}>
      ★ ילדים ★ החלקות ★ גוונים ★
    </Txt>
    <div style={{position: 'absolute', left: 50, top: 1190, transform: 'rotate(-28deg)'}}>
      <Scissors size={230} open={0.9} color={K.ink} stroke={14} />
    </div>
    <Txt x={540} y={1548} style={{fontFamily: UI, fontWeight: 500, fontSize: 40, color: K.ink}}>
      רחוב הגפן 17, השכונה
    </Txt>
    <Txt x={540} y={1680} transform="rotate(-2deg)" style={{fontFamily: LOUD, fontSize: 96, color: K.red, ...stroke(6)}}>
      הכי זול בעיר!!!
    </Txt>
    {/* escalation stickers, popped in on the hook beats */}
    {pops[0] > 0 ? (
      <Sticker x={150} y={1050} r={95} fill={K.green} rot={-14} s={pops[0]}>
        <span style={{fontFamily: LOUD, fontSize: 56, color: K.paper, ...stroke(5)}}>חדש!!</span>
      </Sticker>
    ) : null}
    {pops[1] > 0 ? (
      <Sticker x={935} y={1690} r={105} fill={K.blue} rot={10} s={pops[1]}>
        <span style={{fontFamily: LOUD, fontSize: 44, lineHeight: 1.05, color: K.yellow, ...stroke(4)}}>
          רק
          <br />
          השבוע!!
        </span>
      </Sticker>
    ) : null}
    {pops[2] > 0 ? (
      <Txt x={110} y={1660} transform={`rotate(-10deg) scale(${pops[2]})`} style={{fontFamily: LOUD, fontSize: 170, color: K.red, ...stroke(8)}}>
        !!!
      </Txt>
    ) : null}
    {hideKeys
      ? null
      : KEYS.map((k) => (
          <Txt key={k.id} x={k.before.x} y={k.before.y} transform={`rotate(${k.before.rot}deg)`}>
            <k.Before />
          </Txt>
        ))}
  </div>
);

// ---------- the redesigned ad (used as a thumbnail and for the grow) ----------

export const AfterPoster: React.FC<{shift?: number}> = ({shift = 0}) => (
  <div style={{position: 'absolute', inset: 0, backgroundColor: K.paper, overflow: 'hidden'}}>
    <Txt x={540} y={500}>
      <Name17 size={200} />
    </Txt>
    <div style={{position: 'absolute', left: 0, right: 0, top: 680, height: 170, borderTop: `5px solid ${K.ink}`, borderBottom: `5px solid ${K.ink}`, overflow: 'hidden'}}>
      <Stripes shift={shift} w={56} />
    </div>
    <Txt x={540} y={1000} style={{fontFamily: UI, fontWeight: 500, fontSize: 68, color: K.ink}}>
      תספורת · זקן · קו נקי
    </Txt>
    <Txt x={540} y={1105} style={{fontFamily: UI, fontWeight: 400, fontSize: 50, color: K.muted}}>
      פתוח גם בשישי
    </Txt>
    <Txt x={540} y={1280}>
      <Pill label="קובעים תור בהודעה" />
    </Txt>
    <Txt x={540} y={1430} style={{fontFamily: UI, fontWeight: 400, fontSize: 38, color: K.muted}}>
      רחוב הגפן 17
    </Txt>
  </div>
);
