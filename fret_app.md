# Degree Lens — Implementation Report (for the planner)

*A report back to the planning agent that authored `01-VISION-AND-FRAMEWORK.md`,
`02-CURRICULUM.md`, and `03-BUILD-SPEC.md`. This documents what was actually
built, the decisions taken, and the deliberate divergences from the build spec —
so the plan and the code stay in sync.*

Status: all six milestones (M1–M6) complete, plus two user-requested follow-on
features (colour modes, a dedicated Practice mode). 59 tests passing, build
clean, tab-linter green. Live-site deploy wired via GitHub Actions.

---

## 1. What the app is

A static single-page **interactive workbook** for the Degree Lens framework:
lesson prose from the curriculum interleaved with live fretboard widgets, plus a
dedicated play-along Practice page. **Vite + React + TypeScript**, no backend, no
audio, no accounts. Ships as static files; runs from GitHub Pages *and*
`file://` (relative asset base).

The core pedagogical object — the whole point — is realized: **the full
parent-scale degree map stays lit on the fretboard, and switching chords makes a
different degree-trio glow across the constant map.** The overlay-switch glow
migration is the signature animation.

### Personalization contract (honored)

| PROFILE constant | Status |
|---|---|
| `defaultKey: "D"` | ✅ default key D everywhere |
| `defaultLens: "major"` (minor one toggle away) | ✅ minor lens is a single toggle, always visible |
| `homeProgression: Isus2·vi7·IV·V` (Dsus2 Bm7 G A) | ✅ default progression in stepper & Practice |
| `labelMode: "degrees"` | ✅ degrees are the primary label everywhere; note names a secondary toggle |
| `favoriteZone: "E-shape"` (frets 7–10) | ✅ default highlighted position band / zoom window |
| `minorBias` | ✅ three minor-lens presets ship alongside major; minor lens throughout |

---

## 2. Architecture

```
src/
  lib/
    theory.ts          # ALL music math (pure, unit-tested) — single source of truth
    progressions.ts    # named progressions (major + minor lens overlays)
    tips.ts            # per-chord pedagogical prose (content, not math)
    useMetronome.ts     # shared silent-metronome timing hook
  components/
    Fretboard.tsx        # SVG board: windowed rendering + 3 colour modes
    DegreeLens.tsx        # embeddable overlay widget (board + controls + stepper)
    OverlayControls.tsx   # key / chord chips / toggles / position / zoom
    ProgressionStepper.tsx# chip strip + silent metronome (inline, in lessons)
    ColorModeToggle.tsx   # [current|function|people] segmented control + adaptive legend
    TriadWindows.tsx      # nine string-set windows per chord (Module 5)
    BoxView.tsx           # BB-box-locked board (Module 6)
    Lesson.tsx            # prose primitives (P/D/Tab/Callout/H3) + localStorage Checklist
    PracticeSession.tsx   # the dedicated play-along page
  content/
    curriculum.tsx        # overview + 8 modules, with embedded live widgets
  App.tsx                 # sidebar nav + lesson pane (hash-routed), '▶ Practice' entry
scripts/
  lint-tabs.mjs           # number-honesty linter (imports theory.ts directly)
.github/workflows/deploy.yml  # test + lint + build + deploy to GitHub Pages
```

**Guardrail held:** every interval/degree computation lives in `theory.ts`.
Components never compute music inline — they call `resolveOverlay`, `degreeAt`,
`chordRoles`, `triadWindows`, etc. This is what makes the number-honesty linter
possible and the whole app trivially key-agnostic.

### `theory.ts` surface

`pcOf`, `majorScalePcs`, `pcOfDegree`, `noteNameOfDegree`, `degreeAt`,
`romanToDegree`, `chordDegrees`, `guideTones`, `minorLensLabel`, `freshNotes`,
`chordName`, `resolveOverlay`, `chordRoles`, `triadWindows`, `wrap`, plus data
tables (`ROMAN`, `QUALITY`, `QUALITY7`, `SPECIALS`, `DIATONIC_ROMANS`,
`CHARACTER_BY_DEGREE`, `NOTES`, `STRING_NAME_BY_NUMBER`, `FRETS`).

---

## 3. Divergences from `03-BUILD-SPEC.md` (please note these)

These are intentional. Where the plan should be updated to match, it's flagged.

1. **Lesson content is authored as TSX, not MD/MDX shortcodes.**
   The spec sketched `content/module-1.md … module-8.md` rendered by a
   `Lesson.tsx` that parses "MDX/markdown with embedded widget shortcodes." We
   instead authored the curriculum as `src/content/curriculum.tsx` — each module
   is a small React component using shared prose primitives (`P`, `D`, `Tab`,
   `Callout`, `Checklist`) and importing widgets directly (`<DegreeLens .../>`,
   `<TriadWindows/>`, `<BoxView/>`).
   *Why:* embedding live, prop-configured widgets in prose is far cleaner as JSX
   than inventing/parsing a shortcode layer + MDX toolchain. Same outcome (prose
   interleaved with live widgets), less machinery. The source-of-truth markdown
   (`01`/`02`) is unchanged and is still linted (see #6).

2. **`degreeAt(key, stringNumber, fret)` uses 1-based guitar string numbering**
   (1 = high e … 6 = low E), matching the spec's own acceptance test literally
   (`degreeAt(D, string=1(highE), fret=10) == 1`). The `EADGBE` comment in the
   spec listed strings low→high, which was ambiguous; the tests decided it.

3. **`triadWindows(key, roman, stringSet)` takes an explicit `key`.** The spec
   signature omitted it, but the acceptance test is key-specific ("key D"), and a
   pure function can't read an ambient key. Returns the three inversions, each as
   the most compact voicing; verified against the spec's fret targets.

4. **Mobile fretboard = zone-window + zoom, not horizontal scroll.** User
   decision. The board renders any fret window (`view={{start,end}}`), so on a
   phone it defaults to a ~7-fret zoomed position window with a slider, which
   reinforces CAGED-position thinking instead of pinch-scrolling a giant neck.
   Full neck on tablet/desktop.

5. **Two convenience functions added to `theory.ts`:** `resolveOverlay(key,
   roman, seventh)` (returns `{roman, root, degrees, guides, name}`) and
   `chordName`, so components have one call site. Plus `chordRoles` for colour-
   by-function (see #4 below).

6. **Harmonic-minor ♯5 cameo (Module 7) is described in prose but NOT rendered
   on the board.** The spec listed it as a stepper preset. The ♯5 (major-map
   `♯5`) is the *one note not on the parent map*, so drawing it correctly needs
   the fretboard to render a chromatic, non-degree tone — a real extension to the
   note model. Per the spec's own "extend harmony beyond spec → flag first"
   guardrail, we shipped the concept in the Module 7 lesson text and left the
   board rendering as a **flagged follow-up** rather than fake it. **Decision
   needed from planner:** promote this to a proper v2 feature (chromatic overlay
   tone + resolution cue) or leave as prose.

Everything else follows the spec: no audio, no backend, no analytics; degrees
primary; the fretboard note-states (`off/scale/chordTone/root/guide/fresh`);
CAGED zone highlight; fresh-note pulse on advance; `prefers-reduced-motion`
respected.

---

## 4. New feature — colour modes (user-requested)

A live `[ current | function | people ]` segmented toggle above every board.
Motivated by a user question about *why the guide-tone ring lands where it does*.
Backed by `theory.chordRoles(roman, seventh)`, which classifies each tone as
root / 3rd / 5th / 7th and names the chord's character note.

- **current** — the original language: root gold, tones amber, guide tones ringed cyan.
- **function** — colours by harmonic job: root gold, **3rd cyan (quality)**,
  **7th rose (tension, `--tension` token)**, 5th dim (`--furniture`), and the
  chord's **character note gets a halo**. Teaches the framework's claim that the
  3rd and 7th are *the* harmony, and that they do *different* jobs.
- **people** — the vision doc's metaphor made literal: the guide tones (3rd+7th)
  glow bright, the root+5th recede as "furniture."

The legend rewrites itself per mode. Degrees remain the labels in all modes. The
default mode is still `current`; Practice defaults to `function`.

---

## 5. New feature — Practice mode (user-requested)

A dedicated top-level **▶ Practice** page (above the modules in the sidebar) for
playing along while watching the board. It reuses the existing overlay engine and
adds a shared timing hook so there's no duplicated metronome logic.

- **`lib/useMetronome.ts`** — the silent visual metronome. Owns beat/bar timing,
  count-in, and fires `onChordAdvance` at each chord boundary; the consumer owns
  the chord index. No audio (the guitar is the sound). BPM clamped 30–300.
- **`PracticeSession.tsx`** — the play-along layout, tuned to read from across the
  room:
  - **Big now-playing chord** — name · roman · degree trio · target hint
  - **Next-chord preview** — so the fretting hand can prepare
  - **Change countdown cue** — the preview panel lights up during the last bar
  - **Count-in bar** — a 4-beat "get ready" countdown before the loop starts
  - **Beat + bar indicator** — filling beat dots, "bar 2/2"
  - **Transport** — progression select, key, BPM, bars-per-chord, count-in,
    7ths, minor lens, play/pause; plus colour mode + position/zoom
  - **Custom progression builder** — build your own from I–vii° + Dsus2
    (add/remove chords), or pick a preset
  - Fresh-note pulse on every switch; keyboard nav (←/→ step, space play/pause)

The inline `ProgressionStepper` (used within lessons) still exists for the
in-context, step-through-by-hand experience; Practice is the full-attention,
auto-advancing counterpart.

---

## 6. Number-honesty linter

`scripts/lint-tabs.mjs` parses the `fret--(degree)` annotations in the triad tabs
of `01`/`02` and asserts each against `theory.degreeAt(D, string, fret)`. It
imports `theory.ts` directly (Node ≥ 23 strips the TS types), so the lint and the
app share exactly one definition of the math. 18 annotations verified; runs in CI.

---

## 7. Testing & verification

`npm test` → **59 tests** (Vitest):
- `theory.ts` acceptance suite (every §3.1 case) + `chordRoles`.
- Component/interaction tests (jsdom + Testing Library): overlay glow-switch and
  fresh notes, minor-lens relabel, colour-mode fills, stepper advance, arrow-key
  nav, metronome timing (fake timers) incl. count-in, Practice now/next + step +
  custom builder, nav + hash routing, checklist localStorage persistence.

`npm run build` (tsc + vite) clean. `npm run lint:tabs` green. Screenshots for
the README were captured by driving the running app headlessly (Playwright), then
Playwright was removed from deps to keep CI lean.

---

## 8. Deployment

`.github/workflows/deploy.yml` runs tests + tab-lint + build and publishes `dist/`
to GitHub Pages on push to `main` (Node 24 for stable TS type-stripping). One-time
repo setting: **Settings → Pages → Source: GitHub Actions**. `base: './'` means
the same build also opens from `file://`.

---

## 9. Open items for the planner

1. **Harmonic-minor ♯5 cameo** — decide: promote to a v2 board feature (render the
   one off-map chromatic tone + the ♯5→6 resolution cue) or keep as prose only.
2. **Default colour mode** — currently `current`; `function` is arguably the more
   pedagogical default now that it exists. Planner/user call.
3. **Custom progressions** currently live in memory only (Practice builder). If
   these should persist or be shareable (URL/localStorage), that's a small add.
4. **Spaced-repetition / progress tracking** was a spec non-goal (v2 candidate);
   only per-lesson checklist state is persisted today.
