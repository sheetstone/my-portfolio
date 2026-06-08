import * as THREE from 'three';
import { BG_VERT, BG_FRAG } from './shaders.js';
import { DEFAULT_CONFIG, createMovers, destroyMovers, tickMovers } from './shapes.js';
import { RING_R, createFrames, tickFrames, buildCardBackTexture } from './frames.js';

// Shortest signed angle from `from` to `to` in radians, result in (-π, π]
function shortestAngle(from, to) {
  let diff = to - from;
  diff -= Math.PI * 2 * Math.round(diff / (Math.PI * 2));
  return diff;
}

// Easing functions
function easeOutCubic(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}
function easeOutBack(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const DEFAULT_CAM_Z = RING_R + 16;
const FOCUS_CAM_Z   = RING_R + 5;

// Intro fly-in source — off-screen top-left, close to camera
const INTRO_SRC_X = -22;
const INTRO_SRC_Y =  15;
const INTRO_SRC_Z = RING_R + 10;

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.focused = -1;
    this.hover = -1;
    this.rawMX = window.innerWidth / 2;
    this.rawMY = window.innerHeight / 2;

    this.onFocusChange = null;

    this._ray = new THREE.Raycaster();
    this._m = new THREE.Vector2();
    this._down = null;
    this._moved = false;
    this._hoveredShape = null;
    this._isTouch = false;
    this._velHistory = []; // [{dx, t}] — recent per-event deltas for momentum

    this._tick = this._tick.bind(this);
    this._init();
  }

  _init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa81a14);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this._createBackground();
    this.shapeConfig = { ...DEFAULT_CONFIG,
      far:  { ...DEFAULT_CONFIG.far  },
      mid:  { ...DEFAULT_CONFIG.mid  },
      near: { ...DEFAULT_CONFIG.near },
    };
    this.movers = createMovers(this.scene, this.shapeConfig);

    const { frames, haloGroup } = createFrames(this.scene);
    this.frames = frames;
    this.haloGroup = haloGroup;

    this.haloState = 0;
    this.haloWant  = 0;

    // Camera state — z drives zoom; x/y are always 0 with halo layout
    this.camState = { x: 0, y: 0, z: DEFAULT_CAM_Z };
    this.camWant  = { x: 0, y: 0, z: DEFAULT_CAM_Z };
    this.par  = { x: 0, y: 0 };
    this.parT = { x: 0, y: 0 };

    // Y-axis tilt (vertical drag) — springs back to 0 on release
    this.tiltWant  = 0;
    this.tiltState = 0;

    // Intro: start delay matches loading overlay (650 ms)
    this._introDelay = 0.65;

    this._bindEvents();
    this.clock = new THREE.Clock();
    this._raf = requestAnimationFrame(this._tick);
  }

  _createBackground() {
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 150),
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: BG_VERT,
        fragmentShader: BG_FRAG,
      })
    );
    bg.position.z = -32;
    this.scene.add(bg);
    this.bg = bg;
  }

  _bindEvents() {
    const el = this.renderer.domElement;

    this._onPointerDown = (e) => {
      this._down = { x: e.clientX, y: e.clientY };
      this._moved = false;
      this._isTouch = e.pointerType === 'touch';
      this._velHistory = [];
    };

    this._onPointerUp = () => {
      if (this._moved && this.focused < 0) {
        const step = (Math.PI * 2) / this.frames.length;

        if (this._isTouch && this._velHistory.length >= 2) {
          // Compute px/s velocity from the last few events
          const window = this._velHistory.slice(-5);
          const totalDx = window.reduce((s, h) => s + h.dx, 0);
          const totalDt = window[window.length - 1].t - window[0].t;
          const velPxPerSec = totalDt > 0 ? (totalDx / totalDt) * 1000 : 0;

          // Convert to halo angle momentum (same sign convention as drag)
          const momentumAngle = this.haloState + velPxPerSec * 0.004 * 0.18;
          this.haloWant = Math.round(momentumAngle / step) * step;
        } else {
          this.haloWant = Math.round(this.haloState / step) * step;
        }
      }
      this._down = null;
      this._isTouch = false;
    };

    this._onPointerMove = (e) => {
      this.rawMX = e.clientX;
      this.rawMY = e.clientY;

      // Parallax is a mouse-hover effect — skip for touch (no hover concept)
      if (e.pointerType !== 'touch') {
        this.parT.x = -((e.clientX / window.innerWidth)  - 0.5) * 1.8;
        this.parT.y =  ((e.clientY / window.innerHeight) - 0.5) * 1.3;
      }

      if (this._down) {
        const deltaX = e.clientX - this._down.x;
        const deltaY = e.clientY - this._down.y;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 4) this._moved = true;

        // Record per-event delta for momentum calculation on touch lift
        if (e.pointerType === 'touch') {
          this._velHistory.push({ dx: deltaX, t: performance.now() });
          if (this._velHistory.length > 8) this._velHistory.shift();
        }

        // Lock halo and tilt while intro animation is running
        if (this.focused < 0 && this._introDelay === null) {
          // Touch: swipe right → ring right (natural); mouse: drag right → ring left (grab)
          const haloDir = e.pointerType === 'touch' ? 1 : -1;
          this.haloWant += haloDir * deltaX * 0.004;

          // Tilt is desktop-only — accidental vertical thumb arc on mobile
          // would accumulate unwanted tilt, so skip it for touch
          if (e.pointerType !== 'touch') {
            this.tiltWant = Math.max(-4, Math.min(4,
              this.tiltWant + deltaY * 0.003
            ));
          }
        }

        this._down = { x: e.clientX, y: e.clientY };
      }

      if (this.focused < 0) {
        const h = this._pick(e);
        if (h !== this.hover) {
          this.hover = h;
          el.style.cursor = h >= 0 ? 'pointer' : 'grab';
        }
      }

      // Shape hover fade — foreground shapes (closer than ring front)
      this._m.x = (e.clientX / window.innerWidth)  * 2 - 1;
      this._m.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this._ray.setFromCamera(this._m, this.camera);
      const fgMeshes = this.movers
        .filter(g => g.position.z > RING_R)
        .map(g => g.userData.mesh)
        .filter(Boolean);
      const shapeHit = this._ray.intersectObjects(fgMeshes)[0];
      this._hoveredShape = shapeHit ? shapeHit.object.parent : null;
    };

    this._onWheel = (e) => {
      if (this.focused < 0) {
        this.camWant.z = Math.max(
          RING_R + 4,
          Math.min(RING_R + 24, this.camWant.z + e.deltaY * 0.01)
        );
      }
      e.preventDefault();
    };

    this._onClick = (e) => {
      if (this._moved) return;
      if (this.focused >= 0) { this.unfocus(); return; }
      const i = this._pick(e);
      if (i >= 0) this.focus(i);
    };

    el.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointermove', this._onPointerMove);
    el.addEventListener('wheel', this._onWheel, { passive: false });
    el.addEventListener('click', this._onClick);
  }

  _pick(e) {
    this._m.x = (e.clientX / window.innerWidth)  * 2 - 1;
    this._m.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this._ray.setFromCamera(this._m, this.camera);
    const hit = this._ray.intersectObjects(this.frames.map(f => f.userData.pic))[0];
    return hit ? hit.object.parent.userData.index : -1;
  }

  mouseWorld(z) {
    const ndcX =  (this.rawMX / window.innerWidth)  * 2 - 1;
    const ndcY = -(this.rawMY / window.innerHeight)  * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    if (Math.abs(dir.z) < 0.001) return { x: 0, y: 0 };
    const t = (z - this.camera.position.z) / dir.z;
    return {
      x: this.camera.position.x + dir.x * t,
      y: this.camera.position.y + dir.y * t,
    };
  }

  // Intro: cards arc in from top-left, staggered by index
  _tickIntro(t) {
    if (this._introDelay === null) return;

    const introT   = t - this._introDelay;
    const stagger  = 0.07;  // seconds between each card
    const cardDur  = 0.60;  // each card's flight duration

    // Before animation starts: park cards at source (off-screen top-left)
    if (introT <= 0) {
      this.frames.forEach(f => {
        f.position.x  = INTRO_SRC_X;
        f.position.z  = INTRO_SRC_Z;
        f.userData.baseY = INTRO_SRC_Y;
        f.rotation.z  = -0.5;
        f.rotation.y  = 0;
      });
      return;
    }

    let allDone = true;
    this.frames.forEach((f, i) => {
      const p = Math.max(0, Math.min(1, (introT - i * stagger) / cardDur));
      if (p < 1) allDone = false;

      const { ringX, ringZ, ringRotY } = f.userData;

      // x/z follow cubic ease (decelerates into ring position)
      const ep = easeOutCubic(p);
      f.position.x = INTRO_SRC_X + (ringX - INTRO_SRC_X) * ep;
      f.position.z = INTRO_SRC_Z + (ringZ - INTRO_SRC_Z) * ep;

      // y uses easeOutBack for a satisfying landing bounce
      f.userData.baseY = INTRO_SRC_Y * (1 - easeOutBack(p));

      // Tumble: start tilted (-0.5 rad in z), settle to upright
      const er = easeOutCubic(Math.min(1, p * 1.2)); // slightly ahead of position
      f.rotation.z = -0.5 * (1 - er);

      // Ring orientation: shortest rotation from face-on (0) to ring angle
      f.rotation.y = shortestAngle(0, ringRotY) * er;
    });

    if (allDone) {
      // Snap all cards precisely to their ring positions
      this.frames.forEach(f => {
        const { ringX, ringZ, ringRotY } = f.userData;
        f.position.x   = ringX;
        f.position.z   = ringZ;
        f.rotation.y   = ringRotY;
        f.rotation.z   = 0;
        f.userData.baseY = 0;
      });
      this._introDelay = null;
    }
  }

  focus(i) {
    const step = (Math.PI * 2) / this.frames.length;
    this.haloWant = this.haloState + shortestAngle(this.haloState, -i * step);

    const frame = this.frames[i];
    if (frame.userData.placeholder) return;

    this.focused = i;
    this.camWant.z = FOCUS_CAM_Z;
    this.tiltWant = 0; // reset tilt when focusing
    this.onFocusChange?.(i);
  }

  unfocus() {
    this.focused = -1;
    this.camWant.z = DEFAULT_CAM_Z;
    this.onFocusChange?.(-1);
  }

  _lerp(a, b, t) { return a + (b - a) * t; }

  _tick() {
    const t = this.clock.getElapsedTime();
    this.bg.material.uniforms.uTime.value = t;

    tickMovers(this.movers, t, this.mouseWorld.bind(this), this.shapeConfig);

    // Fade foreground shapes semi-transparent on hover
    this.movers.forEach(g => {
      const mesh = g.userData.mesh;
      if (!mesh || g.position.z <= RING_R) return;
      const target = g === this._hoveredShape ? 0.25 : 1.0;
      mesh.material.uniforms.uOpacity.value = this._lerp(
        mesh.material.uniforms.uOpacity.value, target, 0.12
      );
    });

    // Intro animation updates card positions before tickFrames reads them
    this._tickIntro(t);
    tickFrames(this.frames, t, this.hover, this.focused, this._lerp.bind(this));

    // Higher lerp factor during active touch drag — ring tracks finger tightly
    const haloLerp = (this._down && this._isTouch) ? 0.28 : 0.07;
    this.haloState = this._lerp(this.haloState, this.haloWant, haloLerp);
    this.haloGroup.rotation.y = this.haloState;

    this.camState.x = this._lerp(this.camState.x, this.camWant.x, 0.06);
    this.camState.y = this._lerp(this.camState.y, this.camWant.y, 0.06);
    this.camState.z = this._lerp(this.camState.z, this.camWant.z, 0.06);
    this.par.x = this._lerp(this.par.x, this.focused < 0 ? this.parT.x : 0, 0.05);
    this.par.y = this._lerp(this.par.y, this.focused < 0 ? this.parT.y : 0, 0.05);

    // Tilt springs back to 0 when not dragging or when focused
    if (!this._down || this.focused >= 0) {
      this.tiltWant *= 0.88;
    }
    this.tiltState = this._lerp(this.tiltState, this.tiltWant, 0.07);

    // Camera: tilt shifts position.y while lookAt stays at ring centre y
    const camX = this.camState.x + this.par.x;
    const camY = this.camState.y + this.par.y;
    this.camera.position.set(camX, camY + this.tiltState, this.camState.z);
    this.camera.lookAt(camX, camY, 0); // always face ring centre

    this.renderer.render(this.scene, this.camera);
    this._raf = requestAnimationFrame(this._tick);
  }

  setCardBackStyle(style) {
    const tex = buildCardBackTexture(style);
    this.frames.forEach(f => {
      const { back, pic, placeholder } = f.userData;
      // Always update the back face mesh
      if (back) { back.material.map = tex; back.material.needsUpdate = true; }
      // Placeholder front face also shows the back texture
      if (placeholder && pic) { pic.material.map = tex; pic.material.needsUpdate = true; }
    });
  }

  recreateShapes(cfg) {
    this.shapeConfig = cfg;
    destroyMovers(this.movers, this.scene);
    this.movers = createMovers(this.scene, cfg);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('wheel', this._onWheel);
    el.removeEventListener('click', this._onClick);
    this.renderer.dispose();
  }
}
