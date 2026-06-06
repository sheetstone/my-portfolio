# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Role Player** is a voice-first web application for sales training. Learners practice customer conversations with AI-simulated personas; admins configure scenarios, personas, and scoring rubrics. This is a case study / MVP — prioritize functional correctness and voice UX quality over visual polish.

## Tech Stack

- **Frontend:** React (TypeScript), Vite, Vanilla CSS
- **State Management:** React Context for session state
- **Voice/Audio:** Web Audio API (recording + playback), integrated with STT and TTS via Gemini
- **Backend:** Node.js + Express (TypeScript), running on Firebase App Hosting (Cloud Run)
- **Database:** Firestore (scenarios + personas collections)
- **Hosting:** Firebase Hosting (frontend SPA) + Firebase App Hosting (backend, scales to zero)
- **AI:** Google Gemini (`gemini-2.5-flash`) for STT, chat, TTS, and feedback generation
- **Secrets:** Google Secret Manager (`GEMINI_API_KEY`)

## Architecture

### Deployment

```
Browser
├── Firebase Hosting CDN  (React SPA — frontend/dist/)
└── Firebase App Hosting  (Express on Cloud Run — backend/)
      └── Firestore       (scenarios + personas collections)
```

### Core User Flows

1. **Learner Dashboard** → select scenario + persona + difficulty → "Start Role Play"
2. **Role Play Session** → voice input → STT → LLM → TTS → voice output (looped until session ends)
3. **Feedback Summary** → AI-generated coaching, highlighted transcript moments, export
4. **Admin Console** → CRUD for scenarios/personas, live-reflected in learner dashboard (no rebuild)

### Voice Pipeline

```
[Mic] → [Web Audio API] → [STT service] → [LLM with persona/scenario context] → [TTS service] → [Audio playback]
```

- Show response indicator within **300ms** of recording stop
- First partial transcript within **1.5s**
- Audio playback start within **2.5s**
- UI must never freeze; keep scrolling and cancel actions responsive throughout

### Session State Machine

States: `Idle → Listening → Processing → Speaking → Paused → Ended`

Each state needs a visible indicator in the UI.

### Admin Data Model

Scenarios and personas stored in Firestore — live updates without app rebuild. Key scenario fields: persona compatibility list, success criteria, scoring weights (e.g., Discovery 40% / Closing 30%), voice behavior config (interrupt frequency, pace, tone).

## Key Requirements to Keep in Mind

- Voice input: support both **push-to-talk** (hold) and **tap-to-record** (toggle) modes
- Recording UI: timer + mic icon + live input level meter/waveform
- Must handle mic permission denial with recovery guidance
- AI response playback controls: mute/unmute, volume, stop/skip
- Transcript: real-time streaming, user vs. persona clearly distinguished with timestamps
- Feedback page: ≥3 highlighted "key moments" (good practice + needs improvement), session metadata (scenario, persona, duration, turns), export as .txt/.json
- Robust error handling: service errors, timeouts, empty/malformed responses, audio codec failures

## Development Commands

```bash
# 1. Start Firestore emulator (terminal 1)
firebase emulators:start --only firestore

# 2. Start backend (terminal 2)
cd backend && npm run dev        # tsx watch — hot reload, hits local emulator

# 3. Start frontend (terminal 3)
cd frontend && npm run dev       # Vite dev server at localhost:5173

# Other backend commands
cd backend
npm run typecheck                # tsc --noEmit
npm run build                    # no-op in prod (tsx runs TS directly)

# Other frontend commands
cd frontend
npm run build                    # Vite production build → frontend/dist/
npm run lint                     # ESLint
npm run preview                  # preview production build locally
```

## Deploying

Deployments are triggered by pushing to the `production` branch:

```
main ──► release/x.x ──► PR to production ──► your approval ──► merge
```

- **Frontend:** GitHub Actions (`deploy.yml`) builds React and deploys to Firebase Hosting
- **Backend:** Firebase App Hosting auto-deploys on every push to `production`

Never push directly to `production` — only PRs from `release/*` branches are allowed.

## Branch Protection

- **`main`** — direct commits allowed (you + Claude); no force-push; no deletion
- **`production`** — PRs only; source branch must be `release/*`; requires 1 approval; no bypass

## Useful Firebase CLI Commands

```bash
# View backend logs
firebase apphosting:backends:list --project ai-role-player

# Re-seed Firestore (if data is lost)
cd backend
GOOGLE_APPLICATION_CREDENTIALS=../serviceAccount.json npx tsx scripts/seedFirestore.ts

# Deploy frontend manually (if CI is down)
cd frontend && npm run build
firebase deploy --only hosting --project ai-role-player
```
