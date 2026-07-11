# Degree Lens — One Map, Seven Overlays

An interactive chord-tone soloing workbook. The full parent-scale map stays lit
on a fretboard; pick a chord and its degree-trio glows — *same map, different
glow*. Everything is expressed in **scale degrees** (note names are a toggleable
secondary label), built for a CAGED-fluent, number-thinking, minor-leaning
player.

A static single-page app: **Vite + React + TypeScript**, no backend, no audio,
no accounts. You supply the sound with an actual guitar.

## Content source of truth

- `01-VISION-AND-FRAMEWORK.md` — the framework (the seven overlays, the minor lens)
- `02-CURRICULUM.md` — the 8-module curriculum
- `03-BUILD-SPEC.md` — the build spec these files implement
- `degree-lens-demo.html` — original single-file reference implementation

## Develop

```sh
npm install
npm run dev        # dev server
npm test           # vitest (the theory.ts acceptance suite)
npm run build      # typecheck + production build to dist/
npm run lint:tabs  # verify fret numbers in lesson content against theory.ts
```

## Architecture

All music math lives in `src/lib/theory.ts` (pure, unit-tested). Components
never compute intervals inline. Degrees are the primary label everywhere; note
names are a secondary, derived label.

## Milestones

- **M1** — `theory.ts` + tests ✅
- **M2** — Fretboard + OverlayControls
- **M3** — ProgressionStepper
- **M4** — TriadWindows + BoxView
- **M5** — Lesson content + module nav
- **M6** — polish (mobile, print, motion)
