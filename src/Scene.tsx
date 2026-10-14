import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Bottle} from './Bottle';
import {spline} from './keyframes';
import {rand} from './random';
import {makeDotTexture, makeMistTexture} from './textures';
import T from './timeline.json';

const DEG = Math.PI / 180;
const COOL_WHITE = new THREE.Color(0.93, 0.96, 1.0);

// ---------- Camera rig: one continuous move for the whole spot ----------
const CAM = {
  az: [[0, 64], [45, 56], [90, 44], [150, 6], [210, -36], [240, -30], [262, -10], [268, -8], [305, -1], [330, 0], [450, 0]] as [number, number][],
  el: [[0, 1], [90, 5], [150, 7], [210, 9], [262, 3], [268, 3], [330, 4], [450, 4]] as [number, number][],
  dist: [[0, 1.9], [60, 2.2], [90, 3.0], [150, 8.6], [210, 9.4], [235, 8.8], [252, 6.4], [262, 4.0], [270, 3.5], [302, 11.6], [330, 14.2], [450, 13.8]] as [number, number][],
  tx: [[0, 0.5], [90, 0.35], [150, 0], [450, 0]] as [number, number][],
  ty: [[0, 1.0], [90, 0.8], [150, 0.36], [210, 0.32], [262, 0.2], [268, 0.2], [330, -0.28], [450, -0.28]] as [number, number][],
  fov: [[0, 24], [90, 22], [150, 20], [450, 20]] as [number, number][],
};

const CameraRig: React.FC<{frame: number}> = ({frame}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const az = spline(frame, CAM.az) * DEG;
    const el = spline(frame, CAM.el) * DEG;
    const dist = spline(frame, CAM.dist);
    const target = new THREE.Vector3(spline(frame, CAM.tx), spline(frame, CAM.ty), 0);
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z + Math.cos(az) * Math.cos(el) * dist,
    );
    camera.fov = spline(frame, CAM.fov);
    camera.near = 0.05;
    camera.far = 200;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, frame]);
  return null;
};

// ---------- Studio light rig, re-baked into the environment every frame ----------
// Softbox diffusion: brightness falls off toward the panel edges, so a flat
// glass face catches a graded sheen instead of a hard white bar.
let softboxMap: THREE.Texture | null = null;
const getSoftboxMap = () => {
  if (softboxMap) return softboxMap;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const gx = ctx.createLinearGradient(0, 0, 128, 0);
  gx.addColorStop(0, 'rgba(255,255,255,0)');
  gx.addColorStop(0.5, 'rgba(255,255,255,1)');
  gx.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, 128, 128);
  ctx.globalCompositeOperation = 'multiply';
  const gy = ctx.createLinearGradient(0, 0, 0, 128);
  gy.addColorStop(0, '#000');
  gy.addColorStop(0.25, '#fff');
  gy.addColorStop(0.75, '#fff');
  gy.addColorStop(1, '#000');
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, 128, 128);
  softboxMap = new THREE.CanvasTexture(c);
  return softboxMap;
};

const panel = (w: number, h: number, soft = false) => {
  const mat = new THREE.MeshBasicMaterial({
    color: COOL_WHITE.clone(),
    side: THREE.DoubleSide,
    map: soft ? getSoftboxMap() : null,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  return mesh;
};
const placeOnRing = (m: THREE.Mesh, azDeg: number, radius: number, y: number) => {
  m.position.set(Math.sin(azDeg * DEG) * radius, y, Math.cos(azDeg * DEG) * radius);
  m.lookAt(0, y, 0);
};
const setIntensity = (m: THREE.Mesh, v: number) => {
  (m.material as THREE.MeshBasicMaterial).color.copy(COOL_WHITE).multiplyScalar(v);
};

const StudioEnvironment: React.FC<{frame: number}> = ({frame}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const rig = useMemo(() => {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0, 0, 0);
    const sweep = panel(0.8, 9, true);
    const key = panel(2.4, 7, true);
    const fill = panel(1.6, 6, true);
    const rimL = panel(1.1, 9, true);
    const rimR = panel(1.1, 9, true);
    const front = panel(3.5, 2.5);
    const top = panel(4, 4);
    const rimTop = panel(7, 0.4);
    top.position.set(0, 7, 0);
    top.lookAt(0, 0, 0);
    envScene.add(sweep, key, fill, rimL, rimR, top, front, rimTop);
    return {envScene, sweep, key, fill, rimL, rimR, top, front, rimTop, pmrem: new THREE.PMREMGenerator(gl)};
  }, [gl]);
  const last = useRef<THREE.WebGLRenderTarget | null>(null);

  useLayoutEffect(() => {
    const f = frame;
    // Shot 1: a single narrow strip sweeps across the bottle edge in darkness.
    placeOnRing(rig.sweep, spline(f, [[0, 112], [90, 40], [150, 18], [450, 18]]), 6, 0);
    setIntensity(rig.sweep, spline(f, [[0, 0], [8, 6], [90, 7], [150, 1.2], [450, 1.2]]));
    // Studio opens up from shot 2 onward.
    placeOnRing(rig.key, -62, 6, 0.6);
    setIntensity(rig.key, spline(f, [[0, 0], [70, 0], [140, 0.4], [450, 0.4]]));
    placeOnRing(rig.fill, 75, 6, 0.4);
    setIntensity(rig.fill, spline(f, [[0, 0], [90, 0], [150, 0.28], [450, 0.28]]));
    // Rim strips behind the product: the crisp silver outline of the hero frame.
    placeOnRing(rig.rimL, -168, 6, 0);
    placeOnRing(rig.rimR, 168, 6, 0);
    rig.rimTop.position.set(0, 4.2, -4.5);
    rig.rimTop.lookAt(0, 0, 0);
    const rim = spline(f, [[0, 0], [60, 0], [130, 3], [200, 2.2], [262, 2.2], [310, 20], [450, 20]]);
    setIntensity(rig.rimL, rim);
    setIntensity(rig.rimR, rim);
    setIntensity(rig.rimTop, rim * 0.6);
    // Soft front-top card so the silver label reads in the hero frame.
    placeOnRing(rig.front, 0, 6, 3.2);
    setIntensity(rig.front, spline(f, [[0, 0], [90, 0], [160, 0.5], [300, 0.5], [330, 0.9], [450, 0.9]]));
    setIntensity(rig.top, spline(f, [[0, 0.0], [90, 0.15], [150, 1.1], [450, 1.1]]));

    const rt = rig.pmrem.fromScene(rig.envScene, 0, 0.1, 50, {size: 512});
    scene.environment = rt.texture;
    if (last.current) last.current.dispose();
    last.current = rt;
  }, [frame, rig, scene]);

  return null;
};

// ---------- Air: suspended droplets, fine dust, impact mist ----------
type AirDrop = {base: THREE.Vector3; vel: THREE.Vector3; phase: number; r: number};

const makeAirDrops = (): AirDrop[] => {
  const r = rand(21);
  const out: AirDrop[] = [];
  while (out.length < 90) {
    const p = new THREE.Vector3((r() * 2 - 1) * 4.5, (r() * 2 - 1) * 3.2 + 0.4, (r() * 2 - 1) * 4.5);
    // keep the product clear
    if (Math.hypot(p.x, p.z) < 1.6) continue;
    const k = r();
    out.push({
      base: p,
      vel: new THREE.Vector3((r() - 0.5) * 0.002, 0.0015 + r() * 0.002, (r() - 0.5) * 0.002),
      phase: r() * Math.PI * 2,
      r: 0.008 + k * k * 0.03,
    });
  }
  return out;
};

const impactKick = (f: number) => (f < T.impact ? 0 : 1 - Math.exp(-(f - T.impact) / 10));

const AirDroplets: React.FC<{frame: number}> = ({frame}) => {
  const drops = useMemo(makeAirDrops, []);
  const mesh = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#0b0c0e',
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2.4,
    });
    return new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), mat, drops.length);
  }, [drops]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const kick = impactKick(frame);
    drops.forEach((d, i) => {
      const p = d.base.clone().addScaledVector(d.vel, frame);
      p.y += Math.sin(frame / 45 + d.phase) * 0.04;
      const out = new THREE.Vector3(p.x, (p.y - 0.4) * 0.5, p.z).normalize();
      p.addScaledVector(out, kick * 0.9);
      // air clears after the impact so the hero frame stays clean
      const s = d.r * spline(frame, [[0, 1], [275, 1], [325, 0], [450, 0]]);
      m.compose(p, q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [frame, drops, mesh]);
  return <primitive object={mesh} />;
};

const Dust: React.FC<{frame: number}> = ({frame}) => {
  const {geo, base} = useMemo(() => {
    const r = rand(5);
    const n = 260;
    const base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x = 0;
      let z = 0;
      do {
        x = (r() * 2 - 1) * 5;
        z = (r() * 2 - 1) * 5;
      } while (Math.hypot(x, z) < 1.3);
      base[i * 3] = x;
      base[i * 3 + 1] = (r() * 2 - 1) * 3.5 + 0.4;
      base[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    return {geo, base};
  }, []);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: makeDotTexture(),
        color: '#d8dde3',
        size: 0.022,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    [],
  );
  useLayoutEffect(() => {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const kick = impactKick(frame);
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const z = base[i * 3 + 2];
      const len = Math.hypot(x, z) || 1;
      pos.setXYZ(
        i,
        x + Math.sin(frame / 70 + i) * 0.05 + (x / len) * kick * 0.5,
        y + frame * 0.0012 + Math.cos(frame / 60 + i * 1.3) * 0.04,
        z + (z / len) * kick * 0.5,
      );
    }
    pos.needsUpdate = true;
    mat.opacity = spline(frame, [[0, 0.08], [90, 0.3], [450, 0.3]]);
  }, [frame, geo, base, mat]);
  return <points geometry={geo} material={mat} />;
};

type Puff = {angle: number; speed: number; size: number; y: number; z: number; tex: number; spin: number};

const MistWave: React.FC<{frame: number}> = ({frame}) => {
  const textures = useMemo(() => [makeMistTexture(1), makeMistTexture(2), makeMistTexture(3)], []);
  const puffs = useMemo<Puff[]>(() => {
    const r = rand(99);
    return new Array(56).fill(0).map((_, i) => ({
      angle: (i / 56) * Math.PI * 2 + r() * 0.3,
      speed: 0.7 + r() * 0.6,
      size: 0.5 + r() * 0.5,
      y: 0.3 + (r() - 0.5) * 0.6,
      z: -1.2 - r() * 1.4,
      tex: i % 3,
      spin: (r() - 0.5) * 0.01,
    }));
  }, []);
  const sprites = useMemo(
    () =>
      puffs.map(
        (p) =>
          new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: textures[p.tex],
              color: '#c9ced5',
              transparent: true,
              opacity: 0,
              depthWrite: false,
            }),
          ),
      ),
    [puffs, textures],
  );
  // Ambient haze that hangs behind the product for the whole spot.
  const haze = useMemo(() => {
    const r = rand(44);
    return new Array(6).fill(0).map((_, i) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({map: textures[i % 3], color: '#aab0b8', transparent: true, opacity: 0, depthWrite: false}),
      );
      s.position.set((r() - 0.5) * 6, -0.2 + r() * 2, -4 - r() * 3);
      s.userData.baseX = s.position.x;
      s.scale.setScalar(5 + r() * 3);
      return s;
    });
  }, [textures]);

  useLayoutEffect(() => {
    const t = frame - T.impact;
    puffs.forEach((p, i) => {
      const s = sprites[i];
      const mat = s.material as THREE.SpriteMaterial;
      if (t < 0) {
        mat.opacity = 0;
        s.visible = false;
        return;
      }
      s.visible = true;
      const grow = 1 - Math.exp(-(t / 16) * p.speed);
      const radius = 0.7 + grow * 2.6 * p.speed;
      s.position.set(Math.cos(p.angle) * radius, p.y + Math.sin(p.angle) * radius * 0.55, p.z);
      s.scale.setScalar(p.size * (0.5 + grow * 1.5));
      mat.rotation = p.angle + t * p.spin;
      const fadeIn = Math.min(1, t / 4);
      // the wave dissipates fully before the wordmark lands
      mat.opacity = fadeIn * 0.3 * Math.exp(-t / 22);
    });
    const hazeOpacity = spline(frame, [[0, 0.05], [90, 0.07], [450, 0.07]]);
    haze.forEach((h, i) => {
      (h.material as THREE.SpriteMaterial).opacity = hazeOpacity;
      h.position.x = h.userData.baseX + Math.sin(frame / 120 + i) * 0.25;
    });
  }, [frame, puffs, sprites, haze]);

  return (
    <group>
      {haze.map((h, i) => (
        <primitive key={`h${i}`} object={h} />
      ))}
      {sprites.map((s, i) => (
        <primitive key={`m${i}`} object={s} />
      ))}
    </group>
  );
};

// ---------- Product motion ----------
const BOTTLE_YAW: [number, number][] = [[0, 0], [210, 0], [266, -0.5], [330, 0], [450, 0]];

export const Scene: React.FC<{labelMap: THREE.Texture}> = ({labelMap}) => {
  const frame = useCurrentFrame();
  const settleIn = spline(frame, [[0, 1], [300, 1], [360, 0], [450, 0]]);
  const bob = Math.sin(frame / 38) * 0.03 * settleIn;
  const tilt = Math.sin(frame / 52) * 0.012 * settleIn;
  return (
    <>
      <CameraRig frame={frame} />
      <StudioEnvironment frame={frame} />
      <group position={[0, bob, 0]} rotation={[0, spline(frame, BOTTLE_YAW), tilt]}>
        <Bottle labelMap={labelMap} frame={frame} />
      </group>
      <AirDroplets frame={frame} />
      <Dust frame={frame} />
      <MistWave frame={frame} />
    </>
  );
};
