import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Easing, interpolate} from 'remotion';
import {spline} from './keyframes';
import {rand} from './random';
import T from './timeline.json';
import {makeBrushedTexture} from './textures';

// Proportions measured from the supplied reference collage (front + profile views).
export const BODY = {w: 1.6, h: 1.75, d: 0.76, r: 0.1};
const COLLAR = {r: 0.2, h: 0.07};
const CAP = {r: 0.33, h: 0.63};
const LABEL = {w: 0.7, h: 0.742, y: 0.2};

export const BODY_TOP = BODY.h / 2;
export const CAP_TOP = BODY_TOP + COLLAR.h + CAP.h;

const capProfile = () => {
  const R = CAP.r;
  const H = CAP.h;
  const pts: [number, number][] = [
    [0, 0],
    [R - 0.035, 0],
    [R - 0.028, 0.004],
    [R - 0.028, 0.055],
    [R - 0.012, 0.062],
    [R - 0.012, 0.075],
    // fine groove ring near the base
    [R - 0.022, 0.082],
    [R - 0.022, 0.092],
    [R, 0.1],
  ];
  // softened top edge (quarter round)
  const er = 0.035;
  pts.push([R, H - er]);
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push([R - er + Math.cos(a) * er, H - er + Math.sin(a) * er]);
  }
  pts.push([0, H]);
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
};

type DropletSpec = {pos: THREE.Vector3; normal: THREE.Vector3; r: number};

const makeCondensation = (): DropletSpec[] => {
  const r = rand(7);
  const out: DropletSpec[] = [];
  const hx = BODY.w / 2;
  const hy = BODY.h / 2;
  const hz = BODY.d / 2;
  const inLabel = (x: number, y: number) =>
    Math.abs(x) < LABEL.w / 2 + 0.02 && Math.abs(y - LABEL.y) < LABEL.h / 2 + 0.02;
  const size = () => {
    const k = r();
    return 0.003 + k * k * k * 0.012;
  };
  // front + back faces
  for (const side of [1, -1]) {
    for (let i = 0; i < 70; i++) {
      const x = (r() * 2 - 1) * (hx - BODY.r);
      // condensation gathers toward the lower half
      const y = -hy + BODY.r + Math.pow(r(), 2.2) * (BODY.h - BODY.r * 2);
      if (side === 1 && inLabel(x, y)) continue;
      out.push({
        pos: new THREE.Vector3(x, y, side * hz),
        normal: new THREE.Vector3(0, 0, side),
        r: size(),
      });
    }
  }
  // left + right faces
  for (const side of [1, -1]) {
    for (let i = 0; i < 22; i++) {
      const z = (r() * 2 - 1) * (hz - BODY.r);
      const y = -hy + BODY.r + Math.pow(r(), 2.2) * (BODY.h - BODY.r * 2);
      out.push({
        pos: new THREE.Vector3(side * hx, y, z),
        normal: new THREE.Vector3(side, 0, 0),
        r: size(),
      });
    }
  }
  return out;
};

// Droplets that run down the front glass, each timed to a liquid sound cue.
const RUNNERS = [
  {x: -0.58, y: 0.62, len: 0.34, r: 0.022},
  {x: 0.52, y: -0.28, len: 0.26, r: 0.02},
  {x: -0.46, y: -0.12, len: 0.3, r: 0.024},
  {x: 0.62, y: 0.5, len: 0.36, r: 0.021},
  {x: -0.2, y: -0.3, len: 0.28, r: 0.023},
];

export const Bottle: React.FC<{labelMap: THREE.Texture; frame: number}> = ({labelMap, frame}) => {
  const bodyGeo = useMemo(
    () => new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 6, BODY.r),
    [],
  );
  const capGeo = useMemo(() => new THREE.LatheGeometry(capProfile(), 128), []);
  const brushed = useMemo(() => {
    const t = makeBrushedTexture(3);
    return t;
  }, []);

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#020203',
        roughness: 0.035,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        ior: 1.52,
        specularIntensity: 1,
        envMapIntensity: 1.25,
      }),
    [],
  );
  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#d3d6da',
        metalness: 1,
        roughness: 0.55,
        roughnessMap: brushed,
        // brushed aluminium reads bright even in a black set (diffuse bounce stand-in)
        emissive: new THREE.Color(0.2, 0.205, 0.215),
        emissiveMap: brushed,
        envMapIntensity: 1.1,
      }),
    [brushed],
  );
  const collarMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#7d8187',
        metalness: 1,
        roughness: 0.22,
        emissive: new THREE.Color(0.06, 0.06, 0.065),
        envMapIntensity: 1,
      }),
    [],
  );
  const labelMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: labelMap,
        emissiveMap: labelMap,
        emissive: new THREE.Color(0.16, 0.16, 0.17),
        metalness: 0.7,
        roughness: 0.38,
        clearcoat: 0.3,
        envMapIntensity: 1.15,
      }),
    [labelMap],
  );

  const droplets = useMemo(makeCondensation, []);
  const dropletMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 14, 10);
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#4a4e55',
      roughness: 0.0,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2.6,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, droplets.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 0, 1);
    droplets.forEach((d, i) => {
      q.setFromUnitVectors(up, d.normal);
      const p = d.pos.clone().addScaledVector(d.normal, d.r * 0.15);
      // flattened lens shape, slightly elongated by gravity
      m.compose(p, q, new THREE.Vector3(d.r, d.r * 1.15, d.r * 0.42));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [droplets]);

  // The fill-light stand-in follows the studio lights: in the dark opening only
  // the travelling strip may reveal the metal.
  const lightUp = spline(frame, [[0, 0], [70, 0.05], [150, 1], [450, 1]]);
  metal.emissiveIntensity = lightUp;
  // Condensation burns off in the mist wave so the hero glass reads clean.
  const dew = spline(frame, [[0, 1], [285, 1], [325, 0], [450, 0]]);
  const dewMat = dropletMesh.material as THREE.MeshPhysicalMaterial;
  dewMat.transparent = true;
  dewMat.opacity = dew;
  dropletMesh.visible = dew > 0.001;
  collarMat.emissiveIntensity = lightUp;
  labelMat.emissiveIntensity = lightUp;

  return (
    <group>
      <mesh geometry={bodyGeo} material={glass} />
      <mesh
        position={[0, LABEL.y, BODY.d / 2 + 0.0015]}
        material={labelMat}
      >
        <planeGeometry args={[LABEL.w, LABEL.h]} />
      </mesh>
      <mesh position={[0, BODY_TOP + COLLAR.h / 2, 0]} material={collarMat}>
        <cylinderGeometry args={[COLLAR.r, COLLAR.r + 0.01, COLLAR.h, 96]} />
      </mesh>
      <mesh
        geometry={capGeo}
        material={metal}
        position={[0, BODY_TOP + COLLAR.h, 0]}
      />
      <primitive object={dropletMesh} />
      {RUNNERS.map((d, i) => {
        const start = T.liquidDrops[i];
        const p = interpolate(frame, [start, start + 26], [0, 1], {
          easing: Easing.bezier(0.3, 0, 0.2, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        // slight stretch while the droplet is moving
        const stretch = 1 + Math.sin(p * Math.PI) * 0.45;
        return (
          <mesh
            key={i}
            material={dropletMesh.material as THREE.Material}
            position={[d.x, d.y - p * d.len, BODY.d / 2 + d.r * 0.15]}
            scale={[d.r, d.r * 1.15 * stretch, d.r * 0.42]}
          >
            <sphereGeometry args={[1, 18, 12]} />
          </mesh>
        );
      })}
    </group>
  );
};
