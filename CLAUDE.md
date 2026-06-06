# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-file HTML/JS portfolio: `portfolio-gallery.html`. No build step, no package manager, no framework. Open directly in a browser or serve with any static file server.

```bash
# Serve locally (pick any):
python3 -m http.server 8080
npx serve .
```

## Architecture

Everything lives in one file with three sections:

1. **`<style>`** — CSS-only layout. Uses CSS custom properties (`--bg`, `--ink`, `--muted`, `--line`, `--accent`). The `.card` info panel and `.hud` overlay are fixed-position elements that sit above the canvas.

2. **HTML** — Minimal shell: `#app` (canvas mount), `.hud` (top-left brand + hints), `#card` (right-side project panel), `#loading` overlay.

3. **`<script>`** — Pure vanilla JS + Three.js r128 (loaded from CDN). Key globals:
   - `PROJECTS` array at the top — the only thing meant to be edited
   - `scene`, `camera`, `renderer` — standard Three.js setup
   - `screens[]` — array of `THREE.Group`s, one per project; each holds `glow`, `bezel`, `screen` meshes
   - `state` / `want` — current vs. target camera state; lerped every frame in `tick()`
   - `focused` — index of the currently zoomed-in project (-1 = free orbit)

## Customization

Edit the `PROJECTS` array (marked `EDIT HERE`):

```js
const PROJECTS = [
  { title:"...", subtitle:"...", url:"https://...", image:"screenshot-url-or-null", accent:"#hexcolor" },
];
```

Current live projects in the gallery:
| Title | URL | Accent |
|---|---|---|
| Restaurant Menu | https://restaurant-api--restaurant-menu-poc-2026.us-central1.hosted.app/ | #f4845f |
| Yi Jing Oracle | https://yi-jing-tool.web.app/ | #c9a84c |
| AI Role Player | https://ai-role-player.web.app/ | #7eb8f7 |

- `image: null` generates a canvas placeholder with the project title and accent color.
- `accent` drives the screen glow, card header color, and "Visit site" button background.
- The arc layout (`ARC` array) and screen spacing (`R=7.5`) need manual adjustment if you add more than 3 projects.

## Interaction model

- **Drag** — orbits camera (disabled while focused)
- **Scroll** — zooms radius between 7–26 units (disabled while focused)
- **Click a screen** — calls `focus(i)`: snaps `want` camera to the screen's position/angle, shows `#card`
- **Back button / click again** — calls `unfocus()`: restores free-orbit defaults
- Hover detection uses `THREE.Raycaster` against the inner `screen` mesh only

## Visual components

- **Sky** — `THREE.SphereGeometry` with a custom GLSL `ShaderMaterial` (inverted normals). Animated via `uTime` uniform. Edit the fragment shader to change sky colors/aurora.
- **Stars** — `THREE.Points` with 1600 random positions on a sphere.
- **Grid** — `THREE.GridHelper` at y = -4.5, semi-transparent, fades into exponential fog.
- **Screen frames** — each is a `THREE.Group`: glow plane (additive blending) → bezel plane → textured screen plane.
