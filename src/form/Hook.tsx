import React from 'react';
import {AbsoluteFill} from 'remotion';
import T from './timeline.json';
import {Backdrop} from './Backdrop';
import {BrowserChrome, DISPLAY, H, K, MONO, W, ez, lerp, mix, pop} from './system';

// 0-3 s: BORING. slams, splits and stretches out of frame; a generic
// "boring" site appears through a slit mask; orange band sweeps; cut to black;
// the site is struck through and shatters as NOT HERE. lands.

const h = T.hook;
const WORD = 'BORING.'.split('');
const WIN = {x: 90, y: 520, w: 900, h: 820};

const BoringSite: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, backgroundColor: '#e7e4dd', display: 'flex', flexDirection: 'column'}}>
    <BrowserChrome url="generic-template.site" />
    <div style={{padding: 34, display: 'flex', flexDirection: 'column', gap: 22, flex: 1}}>
      <div style={{height: 230, backgroundColor: '#c9c6bf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 22, color: '#8d8a84'}}>
        [ STOCK IMAGE ]
      </div>
      <div style={{height: 26, width: '70%', backgroundColor: '#b9b6af'}} />
      <div style={{height: 14, width: '92%', backgroundColor: '#cfccc5'}} />
      <div style={{height: 14, width: '84%', backgroundColor: '#cfccc5'}} />
      <div style={{display: 'flex', gap: 18, marginTop: 10}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{flex: 1, height: 170, backgroundColor: '#d6d3cc'}} />
        ))}
      </div>
      <div style={{alignSelf: 'flex-start', marginTop: 8, padding: '14px 30px', backgroundColor: '#b0ada6', fontFamily: MONO, fontSize: 20, color: '#efece6'}}>LEARN MORE</div>
    </div>
  </div>
);

export const Hook: React.FC<{f: number}> = ({f}) => {
  const dark = f >= h.flip;
  // BORING. slam + split
  const slam = pop(f, h.slam, 420, 16);
  const winOpen = lerp(f, h.browser, h.browser + 12, 0, 1, ez.out);
  const strike = lerp(f, h.strike, h.strike + 7, 0, 1, ez.out);
  const shatter = (i: number) => lerp(f, h.shatter + i, h.shatter + 14 + i, 0, 1, ez.in);
  const sweep = lerp(f, h.sweep, h.sweep + 12, 0, 1, ez.inOut);
  const notIn = pop(f, h.not, 360, 15);
  const hereIn = pop(f, h.here, 360, 15);
  const squash = f >= 60 ? Math.exp(-(f - 60) / 4) : 0;

  return (
    <AbsoluteFill>
      <Backdrop
        f={f}
        start={dark ? h.flip : 0}
        base={dark ? K.black : K.white}
        dark={dark}
        ring={dark ? {x: 860, y: 1580, r: 210} : {x: 830, y: 380, r: 170}}
        hatch={dark ? {x: 0, y: 1500, w: 520, h: 300} : {x: 560, y: 1450, w: 520, h: 260}}
      />

      {/* BORING. */}
      {f < h.browser + 14 ? (
        <div style={{position: 'absolute', top: 760, left: 0, width: W, display: 'flex', justifyContent: 'center', transform: `scale(${mix(1.45, 1, slam)}) rotate(${(1 - slam) * -5}deg)`}}>
          {WORD.map((ch, i) => {
            const p = lerp(f, h.split + i, h.split + 14 + i, 0, 1, ez.in);
            const dir = i % 2 ? 1 : -1;
            return (
              <div
                key={i}
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 330,
                  lineHeight: 1,
                  color: K.black,
                  transform: `translate(${(i - 3) * 90 * p}px, ${dir * 1500 * p * p}px) scaleY(${1 + 2.2 * p}) scaleX(${1 - 0.35 * p})`,
                  transformOrigin: dir > 0 ? '50% 0%' : '50% 100%',
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* the boring website, revealed through a horizontal slit, then shattered */}
      {f >= h.browser ? (
        <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h}}>
          {[0, 1, 2, 3].map((i) => {
            const s = shatter(i);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (WIN.w / 4) * i,
                  top: 0,
                  width: WIN.w / 4 + 1,
                  height: WIN.h,
                  overflow: 'hidden',
                  clipPath: `inset(${(1 - winOpen) * 50}% 0 ${(1 - winOpen) * 50}% 0)`,
                  transform: `translate(${(i - 1.5) * 160 * s}px, ${(i % 2 ? -1 : 1) * 1400 * s * s}px) rotate(${(i - 1.5) * 14 * s}deg)`,
                }}
              >
                <div style={{position: 'absolute', left: -(WIN.w / 4) * i, top: 0, width: WIN.w, height: WIN.h, border: `4px solid ${K.black}`, boxSizing: 'border-box', overflow: 'hidden'}}>
                  <BoringSite />
                </div>
              </div>
            );
          })}
          {/* strike-through */}
          <div
            style={{
              position: 'absolute',
              left: -60,
              top: WIN.h / 2 - 22,
              width: WIN.w + 120,
              height: 44,
              backgroundColor: K.orange,
              transform: `rotate(-14deg) scaleX(${strike})`,
              transformOrigin: 'left center',
              opacity: 1 - shatter(1),
            }}
          />
        </div>
      ) : null}

      {/* orange band + black lines sweeping across */}
      {f >= h.sweep && f < h.sweep + 14 ? (
        <>
          <div style={{position: 'absolute', left: mix(-2600, W + 400, sweep), top: 900, width: 2400, height: 320, backgroundColor: K.orange, transform: 'rotate(-12deg)'}} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: mix(-1500, W + 300, lerp(f, h.sweep + i * 2, h.sweep + 12 + i * 2, 0, 1, ez.inOut)), top: 860 + i * 420, width: 1200, height: 8, backgroundColor: K.black, transform: 'rotate(-12deg)'}} />
          ))}
        </>
      ) : null}

      {/* NOT HERE. */}
      {f >= h.not ? (
        <div style={{position: 'absolute', top: 470, width: W, textAlign: 'center', transform: `scaleY(${1 - squash * 0.12}) scaleX(${1 + squash * 0.06})`}}>
          <div style={{overflow: 'hidden', height: 470}}>
            <div style={{fontFamily: DISPLAY, fontSize: 470, lineHeight: 1, color: K.white, transform: `translateY(${(1 - notIn) * 480}px)`}}>NOT</div>
          </div>
          {f >= h.here ? (
            <div style={{overflow: 'hidden', height: 470}}>
              <div style={{fontFamily: DISPLAY, fontSize: 470, lineHeight: 1, color: K.orange, transform: `translateY(${(1 - hereIn) * -480}px)`}}>HERE.</div>
            </div>
          ) : null}
          <div style={{margin: '18px auto 0', width: 620, height: 14, backgroundColor: K.white, transform: `scaleX(${lerp(f, 60, 68, 0, 1)})`, transformOrigin: 'left'}} />
        </div>
      ) : null}

      <div style={{position: 'absolute', left: 64, top: 250, fontFamily: MONO, fontSize: 26, color: dark ? K.white : K.black, opacity: 0.7}}>
        {dark ? '02 / NOT HERE' : '01 / BORING'}
      </div>
    </AbsoluteFill>
  );
};

export {H};
