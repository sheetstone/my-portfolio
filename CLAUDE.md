# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A 3D portfolio gallery built with React 18, Three.js r160, and Vite 5. Playing-card style project cards are arranged in a 12-slot halo ring. No CSS framework, no router, no state manager.

```bash
npm run dev      # dev server (default port 5173)
npm run build    # production build + image compression + brotli/gzip
npm run preview  # serve the dist/ folder locally
```

## Architecture

```
src/
  App.jsx                   # root: mounts canvas, wires SceneManager ↔ React state
  three/
    SceneManager.js         # animation loop, camera, input, focus/unfocus state machine
    frames.js               # ring layout + card mesh assembly (createFrames, tickFrames)
    cardBacks.js            # 3 Matisse card back designs + buildCardBackTexture factory
    cardTextures.js         # buildCardTexture, buildAboutCardTexture, canvasTex helper
    utils.js                # shortestAngle, easeOutCubic, easeOutBack
    shapes.js               # floating background shapes (blob/leaf/flower/frond)
    shaders.js              # GLSL: animated sky background, shape opacity
  components/
    HUD.jsx / .css          # top-left brand + drag/click hints
    InfoCard.jsx / .css     # right-side panel shown when a card is focused
    Loading.jsx / .css      # full-screen overlay during 650 ms init
    ShapeControls.jsx / .css# collapsible debug panel (shape layers, card back style)
  data/
    projects.js             # PROJECTS array + ABOUT object — the only content to edit
  styles/global.css         # fonts, CSS custom properties (--cream, --ink, --accent)
```

## Ring system

- `RING_R = 10` — ring radius (frames.js)
- `CARD_TOTAL = 12` — total slots; real cards fill index 0…n, rest are placeholders
- Cards are `THREE.Group` children of `haloGroup`; spinning `haloGroup.rotation.y` rotates the ring
- Position formula: `(RING_R·sin(θ), 0, RING_R·cos(θ))` — card 0 starts at z = +10 (nearest camera)
- After intro, ring settles at **−1.5 steps (−45°)** so the 4 real cards fan symmetrically around front

### Camera
| State | `camWant.z` |
|---|---|
| Free orbit (default) | `RING_R + 16 = 26` |
| Focused on a card | `RING_R + 5  = 15` |

### Lerp factors (per frame at 60 fps)
| Situation | Factor |
|---|---|
| Halo spin — normal | 0.10 |
| Halo spin — active touch drag | 0.28 |
| Camera xyz | 0.06 |
| Parallax | 0.05 |
| Y-tilt | 0.07 |

## Card texture system

All textures are 640 × 896 canvas draws (`THREE.CanvasTexture`). All use `canvasTex()` which sets `colorSpace = SRGBColorSpace` to prevent gamma double-correction.

| Function | File | Used for |
|---|---|---|
| `buildCardTexture(p, i, img?)` | cardTextures.js | Project cards — screenshot panel + title/subtitle text |
| `buildAboutCardTexture(p)` | cardTextures.js | About Me card — silhouette portrait + monogram |
| `buildCardBackTexture(style)` | cardBacks.js | Public factory dispatching the three back styles |
| `buildStyleGeometric()` | cardBacks.js | Card back: Matisse triangle mosaic (default) |
| `buildStyleIcarus()` | cardBacks.js | Card back: navy/black split, Icarus figure |
| `buildStyleArbre()` | cardBacks.js | Card back: magenta, white organic branches |

Each card group stores `{ pic, back, glow, index, placeholder, ringX, ringZ, ringRotY, baseY, ph }` in `userData`.

## Intro animation sequence

1. Loading overlay shown (0–0.65 s) — all cards parked at `(-22, 15, 20)` in haloGroup local space
2. Cards fly in one-by-one (70 ms stagger, 0.60 s each) with `easeOutCubic` for x/z, `easeOutBack` for y
3. **Card 0 lands → haloWant immediately set to −step × 1.5** — ring starts rotating while cards 1–11 are still in flight
4. All cards snap to ring positions; drag unlocked

## Adding a project

Edit `src/data/projects.js`:

```js
{
  title:      'My Project',
  subtitle:   'One or two sentence description.',
  url:        'https://myproject.example.com',
  image:      null,           // or a full URL to load via TextureLoader
  screenshot: '/screenshots/myproject.webp',  // .webp extension (build converts from .png)
  accent:     '#hexcolor',
},
```

Drop a `.png` or `.jpg` into `public/screenshots/` — `npm run build` converts it to WebP automatically (see below).

The `ABOUT` object at the top of the same file holds bio, skills, and social links.

## Screenshot workflow

| Step | What happens |
|---|---|
| Drop `name.png` into `public/screenshots/` | Source file — not committed to git ideally |
| `npm run build` | Sharp converts each `.png/.jpg` → `.webp` (quality 82, max 1440 px wide) in `dist/screenshots/` |
| References use `.webp` extension | In dev the loader falls back to `.png` automatically on 404 |

Settings in `vite.config.js` → `screenshotOptimize({ quality, maxWidth })`.

## Mobile interaction

Touch events are handled via the Pointer Events API (`e.pointerType === 'touch'`):
- Swipe right → ring rotates right (natural carousel direction)
- No parallax updates from touch (mouse-hover concept only)
- No Y-tilt from touch (avoids accidental vertical thumb movement)
- Velocity history (last 8 events) drives momentum snap on lift
- `touch-action: none` on canvas prevents browser scroll interference

## Key constants to adjust

| Constant | File | Effect |
|---|---|---|
| `RING_R` | frames.js | Ring radius — also drives camera defaults in SceneManager |
| `CARD_TOTAL` | frames.js | Total ring slots (real cards + placeholders) |
| `DEFAULT_CAM_Z` | SceneManager.js | Default camera distance |
| `FOCUS_CAM_Z` | SceneManager.js | Camera distance when a card is focused |
| `INTRO_SRC_*` | SceneManager.js | World-space source position for fly-in animation |
| `stagger` / `cardDur` | SceneManager.js `_tickIntro` | Timing of card fly-in |
