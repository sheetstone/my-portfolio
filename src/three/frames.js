import * as THREE from 'three';
import { PROJECTS } from '../data/projects.js';

function buildCardTexture(p, i, screenshotImg = null) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 896;
  const x = c.getContext('2d');

  // Background
  const grad = x.createLinearGradient(0, 0, 0, 896);
  grad.addColorStop(0, '#faf8f2');
  grad.addColorStop(1, '#ede6d4');
  x.fillStyle = grad;
  x.fillRect(0, 0, 640, 896);

  // Double border
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

  // Top-left corner index
  x.fillStyle = p.accent;
  x.font = 'bold 64px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText(String(i + 1).padStart(2, '0'), 30, 26);
  pip(48, 122, 16);

  // Screenshot area (44, 168, 552, 372)
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
    // Subtle accent tint
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

  // Divider
  x.strokeStyle = '#1a1410';
  x.globalAlpha = 0.1;
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(44, 576);
  x.lineTo(596, 576);
  x.stroke();
  x.globalAlpha = 1;

  // Title + subtitle
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

  // Bottom-right corner (mirrored)
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

export function createFrames(scene) {
  const loader = new THREE.TextureLoader();
  const frames = [];

  PROJECTS.forEach((p, i) => {
    const W = 3.2;
    const H = W * 1.4;
    const grp = new THREE.Group();
    grp.position.set((i - 1) * 5.6, 0, -8);
    grp.rotation.z = (i - 1) * 0.07;

    const tex = p.image ? loader.load(p.image) : buildCardTexture(p, i);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 0.2, H + 0.2),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    shadow.position.set(0.18, -0.22, -0.06);

    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 0.06, H + 0.06),
      new THREE.MeshBasicMaterial({ color: 0x1a1410 })
    );

    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    card.position.z = 0.01;

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 1.6, H + 1.6),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.accent),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.position.z = -0.04;

    grp.add(shadow, glow, border, card);
    grp.userData = {
      pic: card,
      glow,
      index: i,
      baseX: grp.position.x,
      baseY: grp.position.y,
      ph: i * 2.1,
    };

    scene.add(grp);
    frames.push(grp);

    if (p.screenshot) {
      const img = new Image();
      img.onload = () => {
        const updatedTex = buildCardTexture(p, i, img);
        card.material.map = updatedTex;
        card.material.needsUpdate = true;
      };
      img.src = p.screenshot;
    }
  });

  return frames;
}

export function tickFrames(frames, t, hover, focused, lerp) {
  frames.forEach((f, i) => {
    const u = f.userData;
    f.position.x = u.baseX + Math.sin(t * 0.3 + u.ph) * 0.12;
    f.position.y = u.baseY + Math.sin(t * 0.4 + u.ph) * 0.12;
    const targetOpacity = i === hover || i === focused ? 0.5 : 0;
    u.glow.material.opacity = lerp(u.glow.material.opacity, targetOpacity, 0.08);
  });
}
