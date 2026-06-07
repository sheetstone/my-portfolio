import * as THREE from 'three';
import { PROJECTS } from '../data/projects.js';

// ─── Ring parameters ──────────────────────────────────────────────────────────
export const RING_R     = 10;   // ring radius — increase to spread cards apart
const        CARD_TOTAL = 12;   // total slots; extras auto-fill as placeholders

// ─── CARD BACK DESIGN ────────────────────────────────────────────────────────
// Edit this function freely — it controls every placeholder card's appearance.
// Canvas: 640 × 896, same proportions as the card face.
function buildCardBackTexture() {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 896;
  const x = c.getContext('2d');

  // Background gradient
  const grad = x.createLinearGradient(0, 0, 0, 896);
  grad.addColorStop(0, '#faf8f2');
  grad.addColorStop(1, '#ede6d4');
  x.fillStyle = grad;
  x.fillRect(0, 0, 640, 896);

  // Double border — identical to card face
  x.strokeStyle = '#1a1410';
  x.lineWidth = 10;
  x.strokeRect(6, 6, 628, 884);
  x.lineWidth = 2.5;
  x.strokeRect(22, 22, 596, 852);

  // Diagonal crosshatch inside inner border
  x.save();
  x.beginPath();
  x.rect(26, 26, 588, 844);
  x.clip();
  x.strokeStyle = '#c8b89a';
  x.globalAlpha = 0.55;
  x.lineWidth = 1.2;
  const sp = 36; // spacing — 24 for finer, 48 for coarser
  for (let d = -960; d < 1600; d += sp) {
    x.beginPath(); x.moveTo(d, 0); x.lineTo(d + 960, 960); x.stroke();
    x.beginPath(); x.moveTo(d + 960, 0); x.lineTo(d, 960); x.stroke();
  }
  x.globalAlpha = 1;
  x.restore();

  // Diamond helper
  function diamond(cx, cy, w, h) {
    x.beginPath();
    x.moveTo(cx, cy - h);
    x.lineTo(cx + w, cy);
    x.lineTo(cx, cy + h);
    x.lineTo(cx - w, cy);
    x.closePath();
  }

  const mx = 320, my = 448;

  // Ghost outer ring
  x.strokeStyle = '#1a1410';
  x.globalAlpha = 0.07;
  x.lineWidth = 28;
  diamond(mx, my, 82, 126);
  x.stroke();
  x.globalAlpha = 1;

  // Filled diamond
  x.fillStyle = '#1a1410';
  x.globalAlpha = 0.70;
  diamond(mx, my, 52, 80);
  x.fill();
  x.globalAlpha = 1;

  // White cutout
  x.fillStyle = '#faf8f2';
  diamond(mx, my, 26, 40);
  x.fill();

  // Centre dot
  x.fillStyle = '#1a1410';
  x.globalAlpha = 0.60;
  x.beginPath();
  x.arc(mx, my, 5, 0, Math.PI * 2);
  x.fill();
  x.globalAlpha = 1;

  // Corner pips (matching card face style)
  function pip(px, py, r) {
    x.fillStyle = '#a89880';
    x.beginPath();
    x.moveTo(px, py - r);
    x.lineTo(px + r * 0.7, py);
    x.lineTo(px, py + r);
    x.lineTo(px - r * 0.7, py);
    x.closePath();
    x.fill();
  }
  pip(50, 90,  13);
  pip(50, 806, 13);
  pip(590, 90,  13);
  pip(590, 806, 13);

  return new THREE.CanvasTexture(c);
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
  pip(48, 122, 16);
  x.restore();

  return new THREE.CanvasTexture(c);
}

// createFrames returns { frames, haloGroup }
// Rotate haloGroup.rotation.y to spin the ring.
export function createFrames(scene) {
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

  const backTex = buildCardBackTexture(); // shared by all back faces

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

    // DoubleSide so the border outline appears from both front and back
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

    // Front face — card face, FrontSide (visible when card faces viewer)
    const frontTex = isPlaceholder
      ? backTex
      : (p.image ? loader.load(p.image) : buildCardTexture(p, i));
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: frontTex })
    );
    card.position.z = 0.01;

    // Back face — card back, rotated 180° around Y so it faces the opposite direction
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: backTex })
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.01;

    grp.add(shadow, glow, border, back, card);
    grp.userData = {
      pic:         card,
      glow,
      index:       i,
      baseY:       14,  // starts off-screen above; animated to 0 during intro
      ph:          i * 2.1,
      placeholder: isPlaceholder,
      // Ring position — used by SceneManager intro animation to restore card after flight
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
  });

  return { frames, haloGroup };
}

export function tickFrames(frames, t, hover, focused, lerp) {
  frames.forEach((f, i) => {
    const u = f.userData;
    // Gentle vertical bob only — ring position fixes x/z
    f.position.y = u.baseY + Math.sin(t * 0.4 + u.ph) * 0.08;
    const targetOpacity = i === hover || i === focused ? 0.5 : 0;
    u.glow.material.opacity = lerp(u.glow.material.opacity, targetOpacity, 0.08);
  });
}
