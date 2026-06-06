import * as THREE from 'three';
import { BG_VERT, BG_FRAG } from './shaders.js';
import { createMovers, tickMovers } from './shapes.js';
import { createFrames, tickFrames } from './frames.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.focused = -1;
    this.hover = -1;
    this.rawMX = window.innerWidth / 2;
    this.rawMY = window.innerHeight / 2;

    // Callbacks set by App
    this.onFocusChange = null;

    this._ray = new THREE.Raycaster();
    this._m = new THREE.Vector2();
    this._down = null;
    this._moved = false;

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
    this.movers = createMovers(this.scene);
    this.frames = createFrames(this.scene);

    this.camState = { x: 0, y: 0, z: 13 };
    this.camWant  = { x: 0, y: 0, z: 13 };
    this.par  = { x: 0, y: 0 };
    this.parT = { x: 0, y: 0 };

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
    };
    this._onPointerUp = () => { this._down = null; };
    this._onPointerMove = (e) => {
      this.rawMX = e.clientX;
      this.rawMY = e.clientY;
      this.parT.x = -((e.clientX / window.innerWidth) - 0.5) * 1.8;
      this.parT.y = ((e.clientY / window.innerHeight) - 0.5) * 1.3;

      if (this._down) {
        const dx = Math.abs(e.clientX - this._down.x);
        const dy = Math.abs(e.clientY - this._down.y);
        if (dx + dy > 4) this._moved = true;
        if (this.focused < 0) {
          this.camWant.x = Math.max(-13, Math.min(13,
            this.camWant.x - (e.clientX - this._down.x) * 0.02));
          this.camWant.y = Math.max(-7, Math.min(7,
            this.camWant.y + (e.clientY - this._down.y) * 0.02));
          this._down = { x: e.clientX, y: e.clientY };
        }
      }

      if (this.focused < 0) {
        const h = this._pick(e);
        if (h !== this.hover) {
          this.hover = h;
          el.style.cursor = h >= 0 ? 'pointer' : 'grab';
        }
      }
    };
    this._onWheel = (e) => {
      if (this.focused < 0) {
        this.camWant.z = Math.max(7, Math.min(18, this.camWant.z + e.deltaY * 0.01));
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
    this._m.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._m.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this._ray.setFromCamera(this._m, this.camera);
    const hit = this._ray.intersectObjects(this.frames.map((f) => f.userData.pic))[0];
    return hit ? hit.object.parent.userData.index : -1;
  }

  mouseWorld(z) {
    const ndcX = (this.rawMX / window.innerWidth) * 2 - 1;
    const ndcY = -(this.rawMY / window.innerHeight) * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    if (Math.abs(dir.z) < 0.001) return { x: 0, y: 0 };
    const t = (z - this.camera.position.z) / dir.z;
    return {
      x: this.camera.position.x + dir.x * t,
      y: this.camera.position.y + dir.y * t,
    };
  }

  focus(i) {
    this.focused = i;
    const f = this.frames[i];
    this.camWant.x = f.userData.baseX;
    this.camWant.y = f.userData.baseY;
    this.camWant.z = f.position.z + 4.6;
    this.onFocusChange?.(i);
  }

  unfocus() {
    this.focused = -1;
    this.camWant.x = 0;
    this.camWant.y = 0;
    this.camWant.z = 13;
    this.onFocusChange?.(-1);
  }

  _lerp(a, b, t) { return a + (b - a) * t; }

  _tick() {
    const t = this.clock.getElapsedTime();
    this.bg.material.uniforms.uTime.value = t;

    tickMovers(this.movers, t, this.mouseWorld.bind(this));
    tickFrames(this.frames, t, this.hover, this.focused, this._lerp);

    this.camState.x = this._lerp(this.camState.x, this.camWant.x, 0.06);
    this.camState.y = this._lerp(this.camState.y, this.camWant.y, 0.06);
    this.camState.z = this._lerp(this.camState.z, this.camWant.z, 0.06);
    this.par.x = this._lerp(this.par.x, this.focused < 0 ? this.parT.x : 0, 0.05);
    this.par.y = this._lerp(this.par.y, this.focused < 0 ? this.parT.y : 0, 0.05);

    this.camera.position.set(
      this.camState.x + this.par.x,
      this.camState.y + this.par.y,
      this.camState.z
    );
    this.camera.lookAt(
      this.camState.x + this.par.x,
      this.camState.y + this.par.y,
      this.camState.z - 15
    );

    this.renderer.render(this.scene, this.camera);
    this._raf = requestAnimationFrame(this._tick);
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
