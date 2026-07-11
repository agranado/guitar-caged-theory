# Build Spec — "Degree Lens" Interactive Workbook

*Instructions for Claude Code. Read 01-VISION-AND-FRAMEWORK.md and 02-CURRICULUM.md first; they are the content source of truth. A single-file reference implementation of the core visualizer exists at `degree-lens-demo.html` — reuse its fretboard math and interaction model.*

---

## 1. Decision: what we are building (and why)

**Build: a static single-page React app (Vite + React, no backend, no audio, no accounts).**

Rationale, given the options considered:

- *Plain HTML/MD lesson pages* — rejected as the whole product: the framework's core value is **seeing overlays switch on a fretboard**. Static diagrams can't show "same map, different glow," which is the entire pedagogical point.
- *Full app with audio playback* — rejected: audio is explicitly out of scope per the user, and sound synthesis/timing is where guitar-app projects go to die. The progression stepper is visual-only (chord chips advance on click or on a silent metronome interval); the user supplies sound with an actual guitar, which is pedagogically better anyway.
- *Static SPA "interactive workbook"* — chosen: lesson prose (from the MD files) interleaved with live fretboard widgets. Ships as static files, runs from `file://` or GitHub Pages, zero maintenance.

**Non-goals:** audio, user accounts, spaced-repetition tracking (v2 candidate), alternate tunings, non-diatonic harmony beyond the harmonic-minor ♯5 cameo.

---

## 2. Personalization constants (hardcode these defaults)

```ts
export const PROFILE = {
  defaultKey: "D",            // major-map root
  defaultLens: "major",       // but minor lens is one toggle away, always visible
  homeProgression: ["Isus2", "vi7", "IV", "V"],  // Dsus2 Bm7 G A
  labelMode: "degrees",       // degrees primary; note names an optional secondary label
  favoriteZone: "E-shape",    // frets 7–10 in D; used as default viewport highlight
  minorBias: true,            // minor-lens examples appear alongside major ones in lessons
};
```

Degrees are ALWAYS the primary label everywhere in the UI. Note names are a toggleable subtitle. This is the user's stated cognitive style; do not invert it.

---

## 3. Architecture

```
src/
  lib/
    theory.ts        // pure functions, unit-tested — the only place music math lives
    progressions.ts  // named progressions in roman numerals, major & minor lens
  components/
    Fretboard.tsx    // SVG, 6 strings × 0–15 frets, renders a NoteState[] grid
    OverlayControls  // chord chips (I..vii° + specials), lens toggle, 7ths toggle,
                     // guide-tone toggle, key selector, CAGED-zone highlighter
    ProgressionStepper // chip strip; click/space advances; optional silent interval timer
    TriadWindows.tsx // string-set triad explorer (Module 5)
    BoxView.tsx      // BB-box constrained fretboard (Module 6)
    Lesson.tsx       // renders lesson MDX/markdown with embedded live widgets
  content/
    module-1.md ... module-8.md   // ported from 02-CURRICULUM.md, with widget shortcodes
  App.tsx            // module nav sidebar + lesson pane
```

### 3.1 `theory.ts` — required pure functions (write unit tests FIRST)

```ts
type Degree = 1|2|3|4|5|6|7;
pcOf(key: string): number                          // "D" -> 2
majorScalePcs(key): number[]                       // [2,4,6,7,9,11,1] for D
degreeAt(key, stringIdx, fret): Degree | null      // standard tuning EADGBE
chordDegrees(roman: string): Degree[]              // "IV" -> [4,6,1]; "vi7" -> [6,1,3,5]
                                                   // rule-based: n, n+2, n+4 (+n+6), wrap 7
guideTones(roman): Degree[]                        // [n+2 wrap, n-1 wrap]; sus2 -> [2]
minorLensLabel(d: Degree): string                  // 6->"1", 1->"♭3", 4->"♭6", ...
freshNotes(prev: Degree[], next: Degree[]): Degree[]
triadWindows(roman, stringSet): Window[]           // 3 inversions with frets, for Module 5
specials: { "Isus2": [1,2,5], ... }                // extendable map
```

Acceptance tests (minimum):
- `chordDegrees("IV") == [4,6,1]`, `chordDegrees("V7") == [5,7,2,4]`, `chordDegrees("vii°") == [7,2,4]`.
- In key D: `degreeAt(D, string=1(highE), fret=10) == 1` (note D), `fret=9 == 7` (C♯), `fret=8 == null` (C natural, not in scale).
- `guideTones("ii") == [4,1]`; `minorLensLabel(6) == "1"`; `minorLensLabel(1) == "♭3"`.
- Triad windows for IV, top set, key D, include frets {G:7, B:8, e:7} (2nd inversion) and {G:12, B:12, e:10} (root position).

### 3.2 Fretboard rendering rules

- SVG, horizontal, nut left, 15 frets, standard inlay dots (3,5,7,9,12×2,15). High e on top.
- Note states: `off` (non-scale: invisible), `scale` (dim small dot, degree label), `chordTone` (large, lit), `root` (chord's root degree: distinct fill), `guide` (ring around the dot when guide-tone emphasis is on), `fresh` (brief pulse animation when the stepper advances — the "announce the change" note).
- Minor lens ON: relabel all degrees via `minorLensLabel`, recolor the tonic to degree-6 positions. The *map does not move* — only labels change. This visual fact is the lesson.
- CAGED-zone highlighter: subtle background band over the selected position's fret span; the E-shape zone is pre-highlighted on first load (PROFILE.favoriteZone).

### 3.3 ProgressionStepper behavior

- Renders chord chips with their degree trios beneath (e.g., chip "G — IV" with "4·6·1").
- Advance on click, Space, or a silent visual metronome (user sets BPM and bars-per-chord; the active chip pulses on beats). NO AUDIO.
- On advance: fretboard swaps overlay; fresh notes pulse; an info line states the suggested target ("land on 4 or 6").
- Ships with presets: home progression (Dsus2–Bm7–G–A), I–V–vi–IV, ii–V–I, i–♭VI–♭VII (minor lens), i–iv–v, the Module 7 harmonic-minor cameo (i–V7♯5-handling per curriculum).

---

## 4. Milestones (one Claude Code session each; keep them shippable)

1. **M1 — theory.ts + tests.** Nothing visual. All acceptance tests green. *Do not proceed with failing tests; the entire app is downstream of this math.*
2. **M2 — Fretboard + OverlayControls.** Static page: key selector, chord chips I–vii°, 7ths/guide/lens/names toggles. Parity with `degree-lens-demo.html`, better polish.
3. **M3 — ProgressionStepper** with presets and fresh-note pulses.
4. **M4 — TriadWindows + BoxView.**
5. **M5 — Lesson content** ported from 02-CURRICULUM.md with embedded widgets; module nav; done-when checklists (checkbox state in localStorage is acceptable here since it runs as a real site, not a claude.ai artifact).
6. **M6 — polish pass:** keyboard nav, mobile layout (fretboard scrolls horizontally), print stylesheet for the module charts.

Definition of done per milestone: builds clean (`vite build`), tests pass, and a human can use the milestone's feature without reading code.

---

## 5. Design direction (for M2+)

Dark stage aesthetic: deep charcoal-blue ground, fretboard as the luminous hero centered on screen; degree dots in warm amber (chord tones) with the root in a hotter tone; guide-tone rings in a cool contrast color; dim slate for resting scale tones. Typography: a characterful display face for module titles, a mono face for degree labels and tabs (degrees ARE data). One signature element: the overlay-switch moment — the glow migrating across the constant map — should be the most polished animation in the app, because it *is* the framework. Everything else stays quiet. Respect `prefers-reduced-motion`.

---

## 6. Guardrails for Claude Code

- All music math in `theory.ts` only. Components never compute intervals inline.
- Degrees primary, note names secondary, everywhere, no exceptions.
- Tabs and fret numbers in lesson content must be verified against `degreeAt` programmatically (write a small script that lints the MD tabs) — number honesty is non-negotiable for this user.
- No audio libraries, no backend, no analytics.
- If extending harmony beyond the spec (modes, secondary dominants), put it behind a "v2" flag and ask first.
