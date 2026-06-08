# Hong Zhang — Portfolio Gallery

A 3D portfolio gallery where project cards are arranged in a spinning halo ring. Built with React 18, Three.js, and Vite.

## Tech stack

- **Three.js r160** — 3D ring, card meshes, animated sky shader, floating shapes
- **React 18** — component shell (HUD, InfoCard panel, loading overlay, controls)
- **Vite 5** — dev server, production build, brotli/gzip compression
- **Sharp** — build-time screenshot optimisation (PNG/JPG → WebP)

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
```

Screenshots won't render in dev (they fall back to canvas placeholders) unless you also put `.png` files in `public/screenshots/`.

## Adding a project

1. Edit `src/data/projects.js` and add an entry to the `PROJECTS` array:

```js
{
  title:      'My Project',
  subtitle:   'Short description shown in the info panel.',
  url:        'https://myproject.example.com',
  image:      null,
  screenshot: '/screenshots/myproject.webp',
  accent:     '#f4845f',   // drives glow, header colour, button background
},
```

2. Drop a high-resolution `.png` or `.jpg` into `public/screenshots/` with the matching filename (e.g. `myproject.png`).

3. Run `npm run build` — Sharp converts it to WebP (quality 82, max 1440 px wide) automatically.

## Updating the About Me card

Edit the `ABOUT` object at the top of `src/data/projects.js`:

```js
export const ABOUT = {
  type:   'about',
  title:  'Your Name',
  role:   'Your Role',
  bio:    'Two sentence bio.',
  skills: ['React', 'Three.js', 'Node.js'],
  links: {
    github: 'https://github.com/username',
    email:  'mailto:you@example.com',
  },
  accent: '#6d5b98',
};
```

## Card back designs

Three Matisse-inspired designs are available. Switch in the **Controls** panel (top-right) at runtime, or set the default in `createFrames()` in `src/three/frames.js`.

| ID | Inspiration |
|---|---|
| `geometric` | *Poster Design* 1952 — triangle mosaic |
| `icarus` | *The Fall of Icarus* 1943 — navy/black split, Icarus figure |
| `arbre` | *Arbre de neige* 1947 — magenta, white branches |

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve dist/ locally to verify
```

The build pipeline:
1. Vite bundles JS (Three.js, React, app code into separate cached chunks)
2. Terser minifies with three compression passes
3. Sharp converts screenshots to WebP
4. `vite-plugin-compression` generates `.gz` and `.br` sidecar files for CDN serving

## Deployment (Firebase Hosting)

```bash
firebase login
firebase use <project-id>
firebase deploy --only hosting
```

Ensure `firebase.json` points `public` to `dist/`.

## Project structure

```
public/
  screenshots/       # source images (PNG/JPG) — converted to WebP on build
src/
  three/
    SceneManager.js  # animation loop, input handling, camera state
    frames.js        # ring layout + card mesh assembly
    cardBacks.js     # 3 Matisse card back designs + buildCardBackTexture factory
    cardTextures.js  # buildCardTexture, buildAboutCardTexture, canvasTex helper
    utils.js         # shortestAngle, easeOutCubic, easeOutBack
    shapes.js        # floating background shapes
    shaders.js       # GLSL sky background + shape shaders
  components/        # React UI (HUD, InfoCard, Loading, ShapeControls)
  data/projects.js   # content — edit this to add/update projects
  styles/global.css  # fonts, CSS custom properties
vite.config.js       # build config including screenshot optimisation settings
```
