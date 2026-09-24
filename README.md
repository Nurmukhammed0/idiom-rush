# Idiom Rush

> Don't just learn idioms. Use them.

A production-quality English idiom learning platform: 1,000 real idioms, active-recall practice games, spaced repetition, browser-based speaking practice, and progress analytics — built with React, TypeScript, Vite, Tailwind CSS v4, Zustand, and Recharts.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Zustand (with `localStorage` persistence — demo mode, no backend required)
- React Router v7
- Recharts for analytics charts
- Web Speech API (`SpeechSynthesis` for pronunciation, `SpeechRecognition` for speaking practice)

## Project structure

```
src/
  components/   reusable UI (buttons, cards, nav, mic button, charts helpers)
  pages/        route-level screens (Dashboard, Practice, Idioms, Speaking, ...)
  features/     feature logic: practice exercises, speaking challenge, smart engine
  hooks/        useSpeechRecognition, useAudioRecorder, useExerciseTimer
  services/     spacedRepetition, xp, achievements, speechService, aiService
  store/        Zustand app store (progress, stats, review log, speaking attempts)
  data/         idioms.json (1000 idioms) + repository/search helpers
  database/     seed.ts — demo data generator
  types/        Idiom, progress, and app-level types
scripts/
  generate-idioms.mjs   builds src/data/idioms.json from src/data/raw/*.ts
```

## Development

```bash
npm install
npm run dev
```

## Rebuilding the idiom dataset

The 1,000-idiom dataset is authored as compact per-category source files in
`src/data/raw/*.ts` and compiled into `src/data/idioms.json`:

```bash
npm run seed
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app
and publishes it to GitHub Pages automatically.

## Notes on scope

- **Speaking evaluation** is transcript-based (via the browser's `SpeechRecognition`
  API), not true phoneme-level pronunciation analysis — the UI is explicit about this.
  `src/services/aiService.ts` is a provider-agnostic abstraction so a professional
  speech/LLM API can be swapped in later without touching UI code.
- **Persistence** is `localStorage`-based demo mode (per the product spec's fallback
  requirement) — no backend is required to try the full app.
