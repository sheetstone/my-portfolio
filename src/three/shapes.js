import * as THREE from 'three';
import { SHAPE_VERT, SHAPE_FRAG } from './shaders.js';

const PALETTE = [0x1b3fd4, 0xf4c20d, 0x2f9e57, 0x111111, 0xf3ecdb, 0xe85a1f];
const TYPES = ['blob', 'leaf', 'flower', 'frond'];

// Original defaults — use sliders to tune
export const DEFAULT_CONFIG = {
  far:  { n: 7,  zMin: -30, zMax: -14, rMin: 2.8, rMax: 6.0, minX: 0 },
  mid:  { n: 12, zMin: -12, zMax: -6,   rMin: 1.2, rMax: 3.2, minX: 0 },
  near: { n: 6,  zMin: 8,   zMax: -2,  rMin: 2.0, rMax: 4.0, minX: 0 },
  repR: 4.8, repForce: 0.32, repDecay: 0.88, repClamp: 6,
};

function mulberry(s) {
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shapeGeo(type, R, seed) {
  const rnd = mulberry(seed);
  const N = 110;
  const pts = [];
  const h1 = rnd() * 6.28;
  const h2 = rnd() * 6.28;
  const k1 = 2 + ((rnd() * 3) | 0);
  const k2 = 4 + ((rnd() * 4) | 0);

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let r = R, sx = 1, sy = 1;
    if (type === 'blob') {
      r = R * (1 + 0.2 * Math.sin(3 * a + h1) + 0.1 * Math.sin(5 * a + h2));
    } else if (type === 'leaf') {
      r = R * (1 + 0.3 * Math.sin(2 * a + h1));
      sy = 1.7; sx = 0.68;
    } else if (type === 'flower') {
      r = R * (0.5 + 0.5 * Math.pow(Math.abs(Math.cos(2.5 * a)), 0.7));
    } else if (type === 'frond') {
      r = R * (0.45 + 0.55 * Math.abs(Math.sin(a * 4 + h1)));
      sy = 1.5; sx = 0.62;
    }
    r += R * 0.05 * Math.sin(a * k1 + h1) + R * 0.03 * Math.sin(a * k2 + h2);
    pts.push(new THREE.Vector2(Math.cos(a) * r * sx, Math.sin(a) * r * sy));
  }

  const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
  g.center();
  return g;
}

const baseShapeMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uColor:   { value: new THREE.Color(0xffffff) },
    uSeed:    { value: 0 },
    uOpacity: { value: 1.0 },
  },
  vertexShader: SHAPE_VERT,
  fragmentShader: SHAPE_FRAG,
});

function makeShape(type, R, colorHex, seed) {
  const g = shapeGeo(type, R, seed);
  const mat = baseShapeMat.clone();
  mat.uniforms.uColor.value = new THREE.Color(colorHex);
  mat.uniforms.uSeed.value = seed % 100;
  const mesh = new THREE.Mesh(g, mat);
  const shadow = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 })
  );
  shadow.position.set(R * 0.06, -R * 0.08, -0.05);
  const grp = new THREE.Group();
  grp.add(shadow, mesh);
  grp.userData.mesh = mesh; // exposed for opacity control
  return grp;
}

export function destroyMovers(movers, scene) {
  movers.forEach(grp => {
    scene.remove(grp);
    const seen = new Set();
    grp.traverse(obj => {
      if (obj.geometry && !seen.has(obj.geometry)) {
        obj.geometry.dispose();
        seen.add(obj.geometry);
      }
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material])
          .forEach(m => m.dispose());
      }
    });
  });
}

export function createMovers(scene, cfg = DEFAULT_CONFIG) {
  const movers = [];
  let seed = 7;

  function scatter({ n, zMin, zMax, rMin, rMax, minX }) {
    for (let i = 0; i < n; i++) {
      const type = TYPES[(seed * 3) % TYPES.length];
      const R = rMin + Math.random() * (rMax - rMin);
      const col = PALETTE[(seed * 5) % PALETTE.length];
      const grp = makeShape(type, R, col, seed++);
      const z = zMin + Math.random() * (zMax - zMin);
      let xPos;
      if (minX > 0) {
        const side = Math.random() < 0.5 ? -1 : 1;
        xPos = side * (minX + Math.random() * 6);
      } else {
        xPos = (Math.random() - 0.5) * 44;
      }
      grp.position.set(xPos, (Math.random() - 0.5) * 24, z);
      grp.rotation.z = Math.random() * 6.28;
      const depth = (z - zMin) / (zMax - zMin);
      grp.userData = {
        rot: (Math.random() - 0.5) * 0.25 * (1 - depth * 0.6),
        bobA: 0.2 + Math.random() * 0.5,
        bobS: 0.2 + Math.random() * 0.5,
        swA: 0.15 + Math.random() * 0.4,
        swS: 0.15 + Math.random() * 0.4,
        ph: Math.random() * 6.28,
        baseX: grp.position.x,
        baseY: grp.position.y,
        repelX: 0,
        repelY: 0,
      };
      scene.add(grp);
      movers.push(grp);
    }
  }

  scatter(cfg.far);
  scatter(cfg.mid);
  scatter(cfg.near);
  return movers;
}

export function tickMovers(movers, t, mouseWorld, cfg = DEFAULT_CONFIG) {
  const { repR, repForce, repDecay, repClamp } = cfg;
  movers.forEach((g) => {
    const u = g.userData;
    g.rotation.z += u.rot * 0.01;

    const mw = mouseWorld(g.position.z);
    const dx = g.position.x - mw.x;
    const dy = g.position.y - mw.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < repR && dist > 0.01) {
      const f = Math.pow((repR - dist) / repR, 2) * repForce;
      u.repelX += (dx / dist) * f;
      u.repelY += (dy / dist) * f;
    }

    u.repelX = Math.max(-repClamp, Math.min(repClamp, u.repelX)) * repDecay;
    u.repelY = Math.max(-repClamp, Math.min(repClamp, u.repelY)) * repDecay;

    g.position.x = u.baseX + Math.sin(t * u.swS + u.ph) * u.swA + u.repelX;
    g.position.y = u.baseY + Math.sin(t * u.bobS + u.ph * 1.3) * u.bobA + u.repelY;
  });
}
