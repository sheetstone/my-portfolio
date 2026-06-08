import * as THREE from 'three';
import { PROJECTS } from '../data/projects.js';

// ─── Ring parameters ──────────────────────────────────────────────────────────
export const RING_R     = 10;
const        CARD_TOTAL = 12;

// ─── CARD BACK STYLES ─────────────────────────────────────────────────────────
// Each function draws on a 640 × 896 canvas.
// To add a new design: write a buildStyle_X() and register it in buildCardBackTexture().

export const CARD_BACK_STYLES = [
  { id: 'geometric', label: 'Géométrique', color: '#1b3fd4' },
  { id: 'icarus',    label: 'Icare',       color: '#0d1f5c' },
  { id: 'arbre',     label: 'Arbre',       color: '#c4006e' },
];

// Geometric: bold triangle tessellation after Matisse *Poster Design* 1952
function buildStyleGeometric() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  x.fillStyle = '#f8f8f5';
  x.fillRect(0, 0, 640, 896);

  x.save();
  x.beginPath();
  x.rect(23, 23, 594, 850);
  x.clip();

  const cols = 9, rows = 13;
  const tw = 594 / cols;
  const th = 850 / rows;
  const colors = ['#1b3fd4','#2e7d32','#f4c20d','#d81b60','#111111','#d0ccc2','#f5f5f0','#e85a1f'];

  // Seeded LCG for reproducible pattern
  let s = 1337;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 0x100000000; };

  for (let r = 0; r <= rows; r++) {
    for (let col = 0; col <= cols; col++) {
      const bx = 23 + col * tw;
      const by = 23 + r * th;
      // Upper-left triangle
      x.fillStyle = colors[(rnd() * colors.length) | 0];
      x.beginPath();
      x.moveTo(bx, by); x.lineTo(bx + tw, by); x.lineTo(bx, by + th);
      x.fill();
      // Lower-right triangle
      x.fillStyle = colors[(rnd() * colors.length) | 0];
      x.beginPath();
      x.moveTo(bx + tw, by); x.lineTo(bx + tw, by + th); x.lineTo(bx, by + th);
      x.fill();
    }
  }
  x.restore();

  x.strokeStyle = '#111111';
  x.lineWidth = 9;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2;
  x.strokeRect(21, 21, 598, 854);

  return new THREE.CanvasTexture(c);
}

// Icare: dark split background + white figure + gold stars after *The Fall of Icarus* 1943
function buildStyleIcarus() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  // Deep navy left side
  x.fillStyle = '#0d1f5c';
  x.fillRect(0, 0, 640, 896);

  // Near-black right, with soft diagonal edge
  x.fillStyle = '#090910';
  x.beginPath();
  x.moveTo(370, 0); x.lineTo(640, 0); x.lineTo(640, 896); x.lineTo(300, 896);
  x.closePath();
  x.fill();

  // 8-pointed gold stars
  function star(sx, sy, r) {
    x.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 - Math.PI / 2;
      const ro = i % 2 === 0 ? r : r * 0.40;
      const px = sx + Math.cos(a) * ro;
      const py = sy + Math.sin(a) * ro;
      i === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.closePath();
    x.fill();
  }
  x.fillStyle = '#f4c40e';
  star(110, 125, 44);
  star(515, 195, 38);
  star(70,  520, 34);
  star(570, 475, 40);
  star(155, 785, 30);
  star(490, 775, 36);

  // White Icarus silhouette
  x.fillStyle = '#f5f2eb';
  function ell(ex, ey, rx, ry, angle) {
    x.save();
    x.translate(ex, ey);
    x.rotate(angle);
    x.beginPath();
    x.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }
  const fx = 310, fy = 448;
  ell(fx,       fy - 165, 28, 36,   0   );  // head
  ell(fx,       fy -  45, 32, 90,   0   );  // torso
  ell(fx - 105, fy -  82, 20, 75,   1.10);  // left arm
  ell(fx + 105, fy -  82, 20, 75,  -1.10);  // right arm
  ell(fx -  50, fy + 100, 18, 72,  -0.22);  // left leg
  ell(fx +  50, fy + 100, 18, 72,   0.22);  // right leg

  // Red heart on chest
  x.fillStyle = '#cc1f1f';
  const hx = fx, hy = fy - 35, hr = 11;
  x.beginPath(); x.arc(hx - hr * 0.55, hy, hr * 0.75, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(hx + hr * 0.55, hy, hr * 0.75, 0, Math.PI * 2); x.fill();
  x.beginPath();
  x.moveTo(hx - hr * 1.15, hy);
  x.lineTo(hx, hy + hr * 1.4);
  x.lineTo(hx + hr * 1.15, hy);
  x.closePath();
  x.fill();

  // White border
  x.strokeStyle = '#f5f2eb';
  x.lineWidth = 9;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2;
  x.strokeRect(21, 21, 598, 854);

  return new THREE.CanvasTexture(c);
}

// Arbre: magenta field + white organic branching form after *Arbre de neige* 1947
function buildStyleArbre() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  x.fillStyle = '#c4006e';
  x.fillRect(0, 0, 640, 896);

  x.fillStyle   = '#f5f2eb';
  x.strokeStyle = '#f5f2eb';
  x.lineCap     = 'round';
  x.lineJoin    = 'round';

  // Central trunk
  x.lineWidth = 50;
  x.beginPath();
  x.moveTo(322, 865);
  x.bezierCurveTo(318, 720, 326, 540, 320, 185);
  x.stroke();

  // Left branches
  for (const [startX, startY, cpX, cpY, endX, endY, w] of [
    [308, 745, 215, 660, 132, 565, 32],
    [308, 635, 185, 535,  95, 425, 28],
    [312, 525, 195, 428, 110, 325, 24],
    [314, 418, 205, 343, 138, 250, 22],
    [316, 318, 228, 268, 165, 195, 18],
  ]) {
    x.lineWidth = w;
    x.beginPath();
    x.moveTo(startX, startY);
    x.quadraticCurveTo(cpX, cpY, endX, endY);
    x.stroke();
    x.beginPath();
    x.arc(endX, endY, w * 0.72, 0, Math.PI * 2);
    x.fill();
  }

  // Right branches
  for (const [startX, startY, cpX, cpY, endX, endY, w] of [
    [334, 720, 425, 638, 508, 545, 32],
    [336, 608, 435, 510, 525, 405, 28],
    [332, 498, 422, 412, 512, 318, 24],
    [328, 398, 415, 335, 482, 250, 22],
    [324, 302, 402, 260, 452, 190, 18],
  ]) {
    x.lineWidth = w;
    x.beginPath();
    x.moveTo(startX, startY);
    x.quadraticCurveTo(cpX, cpY, endX, endY);
    x.stroke();
    x.beginPath();
    x.arc(endX, endY, w * 0.72, 0, Math.PI * 2);
    x.fill();
  }

  // Crown tip
  x.beginPath();
  x.arc(320, 165, 28, 0, Math.PI * 2);
  x.fill();

  // White border
  x.strokeStyle = '#f5f2eb';
  x.lineWidth = 9;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2;
  x.strokeRect(21, 21, 598, 854);

  return new THREE.CanvasTexture(c);
}

// About Me card — monogram portrait, distinct from project cards
function buildAboutCardTexture(p) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  x.fillStyle = '#faf8f2';
  x.fillRect(0, 0, 640, 896);

  x.strokeStyle = '#1a1410';
  x.lineWidth = 10;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2.5;
  x.strokeRect(22, 22, 596, 852);

  function pip(cx, cy, r) {
    x.beginPath();
    x.moveTo(cx, cy - r); x.lineTo(cx + r * 0.7, cy);
    x.lineTo(cx, cy + r); x.lineTo(cx - r * 0.7, cy);
    x.closePath(); x.fill();
  }

  // Top-left corner: monogram initials + pip
  x.fillStyle = p.accent;
  x.font = 'bold 52px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText('HZ', 32, 28);
  pip(50, 112, 14);

  // Portrait panel — accent background
  const panelTop = 148, panelH = 346;
  x.fillStyle = p.accent;
  x.fillRect(44, panelTop, 552, panelH);

  // Silhouette — head, neck, shoulders in cream
  x.save();
  x.beginPath();
  x.rect(44, panelTop, 552, panelH);
  x.clip();

  x.fillStyle = '#faf8f2';
  // Head
  x.beginPath();
  x.ellipse(320, 280, 76, 90, 0, 0, Math.PI * 2);
  x.fill();
  // Neck
  x.fillRect(296, 362, 48, 66);
  // Shoulders — fan out from neck base to panel bottom edges
  x.beginPath();
  x.moveTo(296, 428);
  x.bezierCurveTo(270, 432, 130, 480, 44, 510);
  x.lineTo(44, 510); x.lineTo(44, 520); x.lineTo(596, 520);
  x.bezierCurveTo(510, 480, 370, 432, 344, 428);
  x.closePath();
  x.fill();
  x.restore();

  // Separator
  x.strokeStyle = '#1a1410';
  x.globalAlpha = 0.1;
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(44, 550); x.lineTo(596, 550); x.stroke();
  x.globalAlpha = 1;

  // Name
  x.fillStyle = '#1a1410';
  x.font = 'bold 42px "Bricolage Grotesque", sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('Hong Zhang', 320, 592);

  // Role
  x.fillStyle = p.accent;
  x.font = '700 20px "Bricolage Grotesque", sans-serif';
  x.fillText('Full-Stack Developer', 320, 638);

  // Thin rule before skills
  x.strokeStyle = p.accent;
  x.globalAlpha = 0.3;
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(120, 666); x.lineTo(520, 666); x.stroke();
  x.globalAlpha = 1;

  // Skills
  x.fillStyle = '#7a6858';
  x.font = '15px "Bricolage Grotesque", sans-serif';
  x.fillText('React  ·  Three.js  ·  Node.js', 320, 694);
  x.fillText('Firebase  ·  Python  ·  AI', 320, 720);

  // Bottom corner (rotated 180°)
  x.save();
  x.translate(640, 896);
  x.rotate(Math.PI);
  x.fillStyle = p.accent;
  x.font = 'bold 52px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText('HZ', 32, 28);
  pip(50, 112, 14);
  x.restore();

  return new THREE.CanvasTexture(c);
}

// Public factory — call this from SceneManager when switching styles
export function buildCardBackTexture(style = 'geometric') {
  switch (style) {
    case 'icarus':  return buildStyleIcarus();
    case 'arbre':   return buildStyleArbre();
    default:        return buildStyleGeometric();
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function buildCardTexture(p, i, screenshotImg = null) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 896;
  const x = c.getContext('2d');

  const grad = x.createLinearGradient(0, 0, 0, 896);
  grad.addColorStop(0, '#faf8f2');
  grad.addColorStop(1, '#ede6d4');
  x.fillStyle = grad;
  x.fillRect(0, 0, 640, 896);

  x.strokeStyle = '#1a1410';
  x.lineWidth = 10;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2.5;
  x.strokeRect(22, 22, 596, 852);

  function pip(cx, cy, r) {
    x.beginPath();
    x.moveTo(cx, cy - r);
    x.lineTo(cx + r * 0.7, cy);
    x.lineTo(cx, cy + r);
    x.lineTo(cx - r * 0.7, cy);
    x.closePath();
    x.fill();
  }

  x.fillStyle = p.accent;
  x.font = 'bold 64px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText(String(i + 1).padStart(2, '0'), 30, 26);
  pip(48, 122, 16);

  if (screenshotImg) {
    const sx = 552 / screenshotImg.naturalWidth;
    const sy = 372 / screenshotImg.naturalHeight;
    const scale = Math.max(sx, sy);
    const drawW = screenshotImg.naturalWidth * scale;
    const drawH = screenshotImg.naturalHeight * scale;
    const drawX = 44 + (552 - drawW) / 2;
    const drawY = 168 + (372 - drawH) / 2;
    x.save();
    x.beginPath();
    x.rect(44, 168, 552, 372);
    x.clip();
    x.drawImage(screenshotImg, drawX, drawY, drawW, drawH);
    x.restore();
    x.fillStyle = p.accent + '18';
    x.fillRect(44, 168, 552, 372);
  } else {
    x.fillStyle = p.accent + '1a';
    x.fillRect(44, 168, 552, 372);
    x.strokeStyle = p.accent + '50';
    x.lineWidth = 1.5;
    x.strokeRect(44, 168, 552, 372);
    x.fillStyle = p.accent;
    x.font = 'bold 50px "Bricolage Grotesque", sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(p.title, 320, 362);
    x.fillStyle = '#9a8a78';
    x.font = '19px "Bricolage Grotesque", sans-serif';
    x.fillText('screenshot goes here', 320, 418);
  }

  x.strokeStyle = '#1a1410';
  x.globalAlpha = 0.1;
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(44, 576);
  x.lineTo(596, 576);
  x.stroke();
  x.globalAlpha = 1;

  x.fillStyle = '#1a1410';
  x.font = 'bold 36px "Bricolage Grotesque", sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(p.title, 320, 622);
  x.fillStyle = '#7a6858';
  x.font = '16px "Bricolage Grotesque", sans-serif';
  const words = p.subtitle.split(' ');
  let line = '';
  const lines = [];
  for (const w of words) {
    if ((line + w).length > 44) { lines.push(line.trim()); line = ''; }
    line += w + ' ';
  }
  lines.push(line.trim());
  lines.slice(0, 3).forEach((l, k) => x.fillText(l, 320, 666 + k * 24));

  x.save();
  x.translate(640, 896);
  x.rotate(Math.PI);
  x.fillStyle = p.accent;
  x.font = 'bold 64px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText(String(i + 1).padStart(2, '0'), 30, 26);
  function pip2(cx, cy, r) {
    x.beginPath();
    x.moveTo(cx, cy - r);
    x.lineTo(cx + r * 0.7, cy);
    x.lineTo(cx, cy + r);
    x.lineTo(cx - r * 0.7, cy);
    x.closePath();
    x.fill();
  }
  pip2(48, 122, 16);
  x.restore();

  return new THREE.CanvasTexture(c);
}

// createFrames returns { frames, haloGroup }.
// Rotate haloGroup.rotation.y to spin the ring.
export function createFrames(scene, cardBackStyle = 'geometric') {
  const loader = new THREE.TextureLoader();
  const frames = [];

  const haloGroup = new THREE.Group();
  scene.add(haloGroup);

  const allCards = [
    ...PROJECTS,
    ...Array.from(
      { length: Math.max(0, CARD_TOTAL - PROJECTS.length) },
      () => ({ title: '', type: 'placeholder', accent: '#c8b89a' })
    ),
  ].slice(0, CARD_TOTAL);

  const backTex = buildCardBackTexture(cardBackStyle);

  const W = 3.2;
  const H = W * 1.4;

  allCards.forEach((p, i) => {
    const grp = new THREE.Group();

    const θ = (i / CARD_TOTAL) * Math.PI * 2;
    grp.position.set(RING_R * Math.sin(θ), 0, RING_R * Math.cos(θ));
    grp.rotation.y = θ;

    const isPlaceholder = p.type === 'placeholder';

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 0.2, H + 0.2),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    shadow.position.set(0.18, -0.22, -0.06);

    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 0.06, H + 0.06),
      new THREE.MeshBasicMaterial({ color: 0x1a1410, side: THREE.DoubleSide })
    );

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 1.6, H + 1.6),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(isPlaceholder ? '#c8b89a' : p.accent),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    glow.position.z = -0.04;

    // Front face — card artwork, FrontSide (visible when facing viewer)
    const frontTex = isPlaceholder     ? backTex
      : p.type === 'about'             ? buildAboutCardTexture(p)
      : p.image                        ? loader.load(p.image)
      :                                  buildCardTexture(p, i);
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: frontTex })
    );
    card.position.z = 0.01;

    // Back face — card back design, faces the opposite direction
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: backTex })
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.01;

    grp.add(shadow, glow, border, back, card);
    grp.userData = {
      pic:         card,
      back,                          // stored so SceneManager can swap back texture
      glow,
      index:       i,
      baseY:       14,               // starts off-screen above; animated to 0 during intro
      ph:          i * 2.1,
      placeholder: isPlaceholder,
      ringX:       RING_R * Math.sin(θ),
      ringZ:       RING_R * Math.cos(θ),
      ringRotY:    θ,
    };

    haloGroup.add(grp);
    frames.push(grp);

    if (!isPlaceholder && p.screenshot) {
      const img = new Image();
      img.onload = () => {
        card.material.map = buildCardTexture(p, i, img);
        card.material.needsUpdate = true;
      };
      img.src = p.screenshot;
    }

    if (p.type === 'about') {
      // Rebuild after web fonts are loaded so text renders with the right typeface
      document.fonts.ready.then(() => {
        card.material.map = buildAboutCardTexture(p);
        card.material.needsUpdate = true;
      });
    }
  });

  return { frames, haloGroup };
}

export function tickFrames(frames, t, hover, focused, lerp) {
  frames.forEach((f, i) => {
    const u = f.userData;
    f.position.y = u.baseY + Math.sin(t * 0.4 + u.ph) * 0.08;
    const targetOpacity = i === hover || i === focused ? 0.5 : 0;
    u.glow.material.opacity = lerp(u.glow.material.opacity, targetOpacity, 0.08);
  });
}
