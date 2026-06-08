import * as THREE from 'three';
import { PROJECTS } from '../data/projects.js';
import { buildCardTexture, buildAboutCardTexture } from './cardTextures.js';
import { buildCardBackTexture } from './cardBacks.js';

export const RING_R     = 10;
const        CARD_TOTAL = 12;

// createFrames returns { frames, haloGroup }.
// Rotate haloGroup.rotation.y to spin the ring.
export function createFrames(scene, cardBackStyle = 'gerbe') {
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
      })
    );
    glow.position.z = -0.12;

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
      const apply = () => {
        card.material.map = buildCardTexture(p, i, img);
        card.material.needsUpdate = true;
      };
      img.onload = apply;
      img.onerror = () => {
        // webp not available (dev mode) — fall back to the original format
        if (p.screenshot.endsWith('.webp')) {
          img.onerror = null;
          img.onload = apply;
          img.src = p.screenshot.replace(/\.webp$/i, '.png');
        }
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
