import * as THREE from 'three';

// Canvas is already sRGB — tell Three.js not to apply an extra gamma pass
export function canvasTex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Diamond pip marker used in card corners
function pip(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.7, cy);
  ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * 0.7, cy);
  ctx.closePath(); ctx.fill();
}

// About Me card — monogram portrait, distinct from project cards
export function buildAboutCardTexture(p) {
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

  // Top-left corner: monogram initials + pip
  x.fillStyle = p.accent;
  x.font = 'bold 52px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText('HZ', 32, 28);
  pip(x, 50, 112, 14);

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
  x.beginPath();
  x.ellipse(320, 280, 76, 90, 0, 0, Math.PI * 2);
  x.fill();
  x.fillRect(296, 362, 48, 66);
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
  pip(x, 50, 112, 14);
  x.restore();

  return canvasTex(c);
}

export function buildCardTexture(p, i, screenshotImg = null) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 896;
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

  x.fillStyle = p.accent;
  x.font = 'bold 64px "Bricolage Grotesque", sans-serif';
  x.textBaseline = 'top';
  x.textAlign = 'left';
  x.fillText(String(i + 1).padStart(2, '0'), 30, 26);
  pip(x, 48, 122, 16);

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
  x.moveTo(44, 576); x.lineTo(596, 576);
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
  pip(x, 48, 122, 16);
  x.restore();

  return canvasTex(c);
}
