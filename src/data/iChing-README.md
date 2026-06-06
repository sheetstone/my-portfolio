# 易经算卦 · I Ching Divination

A mobile-first web app for I Ching (Yi Jing / 易经) divination using the traditional three-coin method. Built with React 19, TypeScript, and Vite.

**Live demo:** [yi-jing-tool on Firebase Hosting](.firebaserc)

---

## Screenshots

### Start Screen
| Mobile | Desktop |
|--------|---------|
| ![Start Screen Mobile](docs/screenshots/01-start-screen-mobile.png) | ![Start Screen Desktop](docs/screenshots/01-start-screen-desktop.png) |

### Divination Screen
| Initial (1/6) | After First Toss (2/6) | All 6 Tosses Complete |
|---------------|------------------------|----------------------|
| ![Divination Initial](docs/screenshots/02-divination-initial-mobile.png) | ![After Toss 1](docs/screenshots/03-divination-after-toss1-mobile.png) | ![Complete](docs/screenshots/04-divination-complete-mobile.png) |

### Result Screen
| Mobile (Top) | Desktop |
|--------------|---------|
| ![Result Top](docs/screenshots/05-result-screen-top-mobile.png) | ![Result Desktop](docs/screenshots/07-result-screen-desktop.png) |

---

## Features

- **Three-coin simulation** — Each of the 6 line tosses flips three coins; the sum (6–9) determines the line type
- **Shake-to-toss** — On mobile, shake the device to toss (iOS requires a one-time permission tap)
- **All 64 hexagrams** — Full King Wen sequence with Chinese name, pinyin, English name, and bilingual judgment (卦辞)
- **Changing lines (变爻)** — Old Yin (6) and Old Yang (9) lines are highlighted with their individual line texts (爻辞) in Chinese and English
- **Transformed hexagram (变卦)** — When changing lines exist, the resulting hexagram is derived and displayed with its own judgment
- **Live hexagram builder** — The hexagram SVG diagram updates in real time as each line is tossed
- **Bilingual UI** — Chinese-primary interface with English subtitles throughout
- **Dark gold theme** — Deep navy background with gold accents designed to evoke traditional Chinese aesthetics

---

## App Screens

### 1 · Start Screen (`StartScreen`)

The landing page. Displays a spinning Taiji (Yin-Yang) symbol surrounded by the eight trigrams (八卦) in a rotating ring. After an 800 ms fade-in, the title and start button appear.

- Tap **开始算卦** or shake the device to begin
- `useShakeDetector` hook listens for `devicemotion` events (threshold: 18 m/s², cooldown: 1 500 ms)

### 2 · Divination Screen (`DivinationScreen`)

Step-by-step coin tossing for all 6 lines. A progress counter (e.g. **2/6**) tracks the current position.

| Area | Description |
|------|-------------|
| **Coin animation** | Three gold coins (乾/坤) flip during each toss (800 ms animation) |
| **Toss result** | Shows line type in Chinese (少阴, 少阳, 老阴, 老阳) and English with numeric value (6–9) |
| **Hexagram builder** | Left panel — SVG diagram fills in from bottom (初爻) to top (上爻) |
| **爻象记录 (history)** | Right panel — lists each completed toss; changing lines are highlighted in red |

When the 6th toss completes, the app automatically transitions to the Result screen after 500 ms.

### 3 · Result Screen (`ResultScreen`)

Displays the complete divination reading.

| Section | Description |
|---------|-------------|
| **本卦 (Primary hexagram)** | King Wen number, Chinese name, pinyin, English name, hexagram SVG, and bilingual judgment |
| **变爻 (Changing lines)** | Card for each changing line showing its label (e.g. 上九), transition direction (老阳 → 阴), and bilingual line text |
| **变卦 (Transformed hexagram)** | Only shown when changing lines exist — the hexagram after all changing lines flip, with its own judgment |
| **重新占卜** | Button to start a new reading |

---

## Architecture

```
src/
├── App.tsx                  # Root: screen state machine (start → divining → result)
├── App.css                  # Global design tokens (CSS variables) and shared styles
│
├── types/index.ts           # All TypeScript interfaces and union types
│
├── data/
│   └── hexagrams.ts         # All 64 hexagrams (King Wen order) with bilingual text
│
├── utils/
│   ├── divination.ts        # Coin logic, line type mapping, hexagram lookup
│   └── shake.ts             # useShakeDetector hook (DeviceMotionEvent)
│
└── components/
    ├── StartScreen.tsx/.css
    ├── DivinationScreen.tsx/.css
    ├── ResultScreen.tsx/.css
    ├── HexagramBuilder.tsx   # Live mini-diagram during tossing
    ├── CoinToss.tsx/.css     # Animated three-coin display
    └── HexagramDiagram.tsx   # SVG hexagram (yang = solid bar, yin = split bar)
```

### State Flow

```
App (screen: 'start' | 'divining' | 'result')
  │
  ├─ StartScreen         onStart() → screen = 'divining'
  │
  ├─ DivinationScreen    onComplete(tossLines[]) → screen = 'result'
  │   └─ tossLines: TossLine[]  (built up one per click/shake)
  │
  └─ ResultScreen        onNewReading() → screen = 'start', tossLines = null
      └─ computeDivinationResult(tossLines) → { primaryHexagram, transformedHexagram }
```

### Divination Logic (`utils/divination.ts`)

1. **`tossCoins()`** — Simulates 3 coins (each 2 or 3 with equal probability). Sum ∈ {6, 7, 8, 9}
2. **`getLineType(result)`** — Maps sum to `old_yin | young_yang | young_yin | old_yang`
3. **`resultToYangLine(result)`** — Returns `1` (yang) for 7/9, `0` (yin) for 6/8
4. **`computeDivinationResult(tossLines)`**
   - Lower trigram = lines 0–2, upper trigram = lines 3–5
   - Trigram index = binary encoding of the three line values (line[0] × 1 + line[1] × 2 + line[2] × 4)
   - Maps index → trigram name via `indexToTrigram` array (King Wen/Fu Xi encoding)
   - Looks up hexagram by `(upperTrigram, lowerTrigram)` pair
   - Derives transformed hexagram by flipping all changing lines (6 ↔ 9 → yin/yang swap)

### Line Types

| Coin sum | Name | Type | Yin/Yang | Changes? |
|----------|------|------|----------|---------|
| 6 | 老阴 Old Yin | `old_yin` | Yin | Yes → becomes Yang |
| 7 | 少阳 Young Yang | `young_yang` | Yang | No |
| 8 | 少阴 Young Yin | `young_yin` | Yin | No |
| 9 | 老阳 Old Yang | `old_yang` | Yang | Yes → becomes Yin |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript ~6.0 |
| Bundler | Vite 8 |
| Styling | Plain CSS with CSS custom properties |
| Motion API | `DeviceMotionEvent` (Web API) |
| Hosting | Firebase Hosting |
| Linting | ESLint 10 + typescript-eslint |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Firebase

```bash
npm run build
firebase deploy
```

---

## Data

`src/data/hexagrams.ts` contains all 64 hexagrams in King Wen sequence order. Each entry includes:

```ts
{
  number: number;       // King Wen number 1–64
  nameZh: string;       // Chinese name e.g. "乾"
  pinyin: string;       // Romanization e.g. "qián"
  nameEn: string;       // English name e.g. "The Creative"
  upperTrigram: TrigramName;
  lowerTrigram: TrigramName;
  judgmentZh: string;   // 卦辞 in Chinese
  judgmentEn: string;   // Judgment in English
  lines: HexagramLine[]; // 6 line statements (index 0 = line 1 / 初爻)
}
```

The eight trigrams used are: 乾 坤 震 巽 坎 离 艮 兑
