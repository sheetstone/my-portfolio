import * as THREE from 'three';
import { canvasTex } from './cardTextures.js';

export const CARD_BACK_STYLES = [
  { id: 'gerbe',     label: 'La Gerbe',    color: '#2d7a3a' },
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
      x.fillStyle = colors[(rnd() * colors.length) | 0];
      x.beginPath();
      x.moveTo(bx, by); x.lineTo(bx + tw, by); x.lineTo(bx, by + th);
      x.fill();
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

  return canvasTex(c);
}

// Icare: dark split background + white figure + gold stars after *The Fall of Icarus* 1943
function buildStyleIcarus() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  x.fillStyle = '#0d1f5c';
  x.fillRect(0, 0, 640, 896);

  x.fillStyle = '#090910';
  x.beginPath();
  x.moveTo(370, 0); x.lineTo(640, 0); x.lineTo(640, 896); x.lineTo(300, 896);
  x.closePath();
  x.fill();

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
  ell(fx,       fy - 165, 28, 36,   0   );
  ell(fx,       fy -  45, 32, 90,   0   );
  ell(fx - 105, fy -  82, 20, 75,   1.10);
  ell(fx + 105, fy -  82, 20, 75,  -1.10);
  ell(fx -  50, fy + 100, 18, 72,  -0.22);
  ell(fx +  50, fy + 100, 18, 72,   0.22);

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

  x.strokeStyle = '#f5f2eb';
  x.lineWidth = 9;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2;
  x.strokeRect(21, 21, 598, 854);

  return canvasTex(c);
}

// Arbre: pink field + white organic branching form after *Arbre de neige* 1947
function buildStyleArbre() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
  const x = c.getContext('2d');

  x.fillStyle = '#d4408a';   // tinted warmer pink (was #c4006e)
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

  // Branches use two control points so they droop outward before sweeping up
  // [startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY, lineWidth]
  for (const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, w] of [
    [308, 745, 228, 792,  98, 632, 132, 565, 32],
    [308, 635, 218, 682,  78, 502,  95, 425, 28],
    [312, 525, 212, 572,  82, 415, 110, 325, 24],
    [314, 418, 222, 458, 112, 330, 138, 250, 22],
    [316, 318, 248, 348, 148, 248, 165, 195, 18],
  ]) {
    x.lineWidth = w;
    x.beginPath();
    x.moveTo(sx, sy);
    x.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    x.stroke();
    x.beginPath();
    x.arc(ex, ey, w * 0.72, 0, Math.PI * 2);
    x.fill();
  }

  for (const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, w] of [
    [334, 720, 402, 778, 542, 622, 508, 545, 32],
    [336, 608, 398, 660, 552, 488, 525, 405, 28],
    [332, 498, 392, 548, 542, 392, 512, 318, 24],
    [328, 398, 384, 444, 512, 322, 482, 250, 22],
    [324, 302, 372, 338, 468, 238, 452, 190, 18],
  ]) {
    x.lineWidth = w;
    x.beginPath();
    x.moveTo(sx, sy);
    x.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    x.stroke();
    x.beginPath();
    x.arc(ex, ey, w * 0.72, 0, Math.PI * 2);
    x.fill();
  }

  // Crown tip
  x.beginPath();
  x.arc(320, 165, 28, 0, Math.PI * 2);
  x.fill();

  x.strokeStyle = '#f5f2eb';
  x.lineWidth = 9;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2;
  x.strokeRect(21, 21, 598, 854);

  return canvasTex(c);
}

// La Gerbe: loads the Matisse card-back photograph from public/cardback/
function buildStyleGerbe() {
  const tex = new THREE.TextureLoader().load('/cardback/martise_card_back.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Public factory — call this from SceneManager when switching styles
export function buildCardBackTexture(style = 'gerbe') {
  switch (style) {
    case 'icarus':  return buildStyleIcarus();
    case 'arbre':   return buildStyleArbre();
    case 'gerbe':   return buildStyleGerbe();
    case 'geometric': return buildStyleGeometric();
    default:        return buildStyleGerbe();
  }
}
