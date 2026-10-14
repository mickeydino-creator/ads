import * as THREE from 'three';
import {rand} from './random';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

// Fine horizontal grain, used as a brushed-metal roughness/bump source.
const brushLines = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  strength: number,
) => {
  const r = rand(seed);
  for (let y = 0; y < h; y++) {
    const v = (r() - 0.5) * strength;
    ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`;
    ctx.fillRect(0, y, w, 1);
  }
};

export const makeLabelTexture = (fontFamily: string) => {
  const S = 1024;
  const c = canvas(S, Math.round(S * 1.06));
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;

  // Satin silver plate with a soft vertical falloff.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#d6d9dc');
  g.addColorStop(0.45, '#c3c6ca');
  g.addColorStop(1, '#a9adb2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  brushLines(ctx, W, H, 11, 0.08);

  // Thin dark inset border.
  const inset = W * 0.045;
  ctx.strokeStyle = 'rgba(28,30,33,0.9)';
  ctx.lineWidth = W * 0.012;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

  // Wordmark.
  ctx.fillStyle = '#1d1f22';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = W * 0.2;
  ctx.font = `500 ${fontSize}px "${fontFamily}"`;
  const text = 'NOIR';
  const spacing = fontSize * 0.08;
  const widths = text.split('').map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let x = W / 2 - total / 2;
  text.split('').forEach((ch, i) => {
    ctx.fillText(ch, x + widths[i] / 2, H / 2 + fontSize * 0.04);
    x += widths[i] + spacing;
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const makeBrushedTexture = (seed: number) => {
  const c = canvas(64, 1024);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 64, 1024);
  brushLines(ctx, 64, 1024, seed, 0.14);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// Wispy, irregular puff for mist and haze sprites: many small soft blobs
// scattered along a curved band so the edge breaks up like real vapour.
export const makeMistTexture = (seed: number) => {
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const r = rand(seed);
  const arc = r() * Math.PI * 2;
  for (let i = 0; i < 70; i++) {
    const a = arc + (r() - 0.5) * 2.2;
    const d = S * (0.12 + r() * 0.22);
    const x = S / 2 + Math.cos(a) * d * 0.6 + (r() - 0.5) * S * 0.12;
    const y = S / 2 + Math.sin(a) * d * 0.6 + (r() - 0.5) * S * 0.12;
    const rad = S * (0.04 + r() * 0.12);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,255,255,${0.05 + r() * 0.09})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  // fade to zero at the sprite border
  ctx.globalCompositeOperation = 'destination-in';
  const m = ctx.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S / 2);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = m;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const makeDotTexture = () => {
  const S = 64;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
