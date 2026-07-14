# Build Spec Addendum (rev. 2) — Mobile: Capacitor-first + Planner Rulings

*Extends 03-BUILD-SPEC.md. Supersedes rev. 1 of this addendum. Read alongside
the implementation report (`fret_app.md`). All original guardrails remain in
force: music math only in `theory.ts`, degrees primary, no analytics, no
backend.*

**Sequencing decision (user):** Capacitor first. Rationale: (a) landscape lock
in Practice mode is essential, and only a native shell guarantees it; (b) MIDI
clock input for BPM sync is on the roadmap, and that requires native code the
shell provides. The PWA drops to an optional later milestone for browser-side
convenience. Audio/MIDI *implementation* remains out of scope through M8 — but
M7 includes the timing-architecture prep that makes it a drop-in later.

---

## 0. Planner rulings on the report's open items

1. **Harmonic-minor ♯5 cameo → promoted to a real feature (M9, v2).**
   Do not fake it inside the diatonic note model. Extend the model deliberately:
   add a `chromatic` note state rendered distinctly (hollow/dashed, `--tension`
   family), a `SPECIALS`-style entry for the minor-lens V (major-map `3·♯5·7`,
   optionally `+2` for V7), and a resolution cue (♯5→6 arrow or paired pulse on
   release). One off-map tone, one resolution — small surface, high value.
   Gate behind the minor lens; impossible to encounter in major-lens UI.
2. **Default colour mode → `function`.** It teaches the framework's central
   claim (3rd and 7th do different jobs) on first contact. Keep `current` one
   tap away; persist the user's last choice so the default applies only to
   first visits.
3. **Custom progressions → persist to localStorage now; URL-share as stretch.**
   Serialize as roman-numeral arrays + key + lens
   (`?p=Isus2.vi7.IV.V&k=D&lens=maj`) — human-readable and key-agnostic.
4. **Spaced repetition / progress tracking → still v2.** Unchanged.

---

## M7 — Capacitor Android shell (primary milestone)

**Goal:** the existing `dist/` running as a real Android app on the user's own
device, landscape-locked Practice with a layout designed for it, correct
system-UI treatment, and the clock architecture prepped for MIDI. Zero changes
to theory or lesson content. iOS deferred (see M8b).

### 7.1 Shell

- `@capacitor/core` + `@capacitor/cli`; `npx cap init` (appId e.g.
  `dev.alejandro.degreelens`), `webDir: 'dist'`, `npx cap add android`.
- npm scripts: `mobile:sync` (build + `cap sync`), `mobile:android`
  (`cap open android`).
- Self-host the two font families (Bricolage Grotesque, JetBrains Mono) so the
  shell is fully self-contained and first paint never depends on a CDN. This
  also makes the web deploy offline-clean for free.
- `@capacitor/status-bar`: dark style over `#0f141b`. Handle display cutouts
  with `env(safe-area-inset-*)` on the app shell.
- Android back button (`@capacitor/app` listener): back navigates lesson
  history / exits Practice before it exits the app.
- Storage: keep localStorage (persistent within the app's WebView), but route
  reads/writes through the existing storage helper so a later swap to
  `@capacitor/preferences` is a one-file change.

### 7.2 Landscape Practice (the point of this milestone)

- `@capacitor/screen-orientation`: lock `landscape` on entering Practice,
  `unlock()` on leaving. Everywhere else free-rotation.
- **Landscape-first Practice layout** — not the portrait layout rotated:
  - Fretboard = full-width hero, vertically centered, largest possible while
    keeping all six strings and the active zone window readable from a couple
    of meters away.
  - Side rail (right, thumb-reachable): now-playing chord (name · roman ·
    trio · target hint), next-chord preview with last-bar change cue, beat/bar
    dots, play/pause.
  - Second-level transport (BPM, bars-per-chord, key, lens, 7ths, colour mode,
    progression select/builder) collapses behind a settings sheet — playing
    state shows only what a player mid-take needs.
  - Safe-area audit specifically around the cutout and gesture bar in
    landscape (insets flip sides depending on rotation direction — test both).
- Touch affordances (whole app): swipe left/right on board or chip strip =
  stepper back/advance (parity with ←/→); all hit targets ≥ 44px; keyboard nav
  preserved for desktop.

### 7.3 Clock architecture prep (MIDI-readiness, no MIDI yet)

- Refactor `useMetronome` to consume a **`ClockSource`** interface:
  `start()`, `stop()`, `onBeat(cb)`, `bpm` (readable; settable only on sources
  that support it). Ship one implementation: `InternalClock` (current timer
  logic, unchanged behavior, BPM 30–300, count-in preserved).
- The hook keeps owning bars/chord-boundary math; the source owns only beats.
  This is the seam where `MidiClockSource` plugs in later (M10) without
  touching Practice or the hook's consumers.
- Tests: existing metronome tests (fake timers) pass against `InternalClock`
  through the interface; add one test with a scripted `FakeClockSource`
  proving the hook is source-agnostic.

### 7.4 Distribution reality (README)

- Personal use: debug APK from Android Studio, sideload. Minutes, free.
- Play Store (only if ever sharing): $25 one-time; **new personal accounts must
  run a closed test (12 testers / 14 days) before production** — not worth it
  for a single-user app.
- CI: web deploy unchanged. Add a workflow-dispatch job that builds an
  unsigned debug APK as an artifact (no signing secrets in the repo).

### Acceptance

- `npm run mobile:sync && cap open android` → runs on a physical device.
- Practice locks to landscape on entry, unlocks on exit; rest of app rotates.
- Landscape Practice layout matches 7.2 (board hero + side rail + settings
  sheet); nothing hidden under status bar / cutout / gesture bar in either
  landscape rotation.
- App fully functional in airplane mode (assets local to the shell; fonts
  self-hosted).
- All existing tests pass; new `ClockSource` tests green; orientation-lock
  call sites unit-tested with mocks.

---

## M8 — PWA (optional, demoted)

For browser-side install/offline on desktop or a spare device. Unchanged in
content from rev. 1, summarized: `vite-plugin-pwa` (autoUpdate, precache all —
fonts already self-hosted by M7), manifest (`display: standalone`,
theme `#0f141b`, maskable 192/512 icons from the overlay-dot motif), GitHub
Pages scope/start_url nuance, update-ready chip, Lighthouse installability +
airplane-mode acceptance. Skip entirely if the Capacitor app covers all real
usage.

**M8b — iOS via Capacitor (optional):** `npx cap add ios`; requires Mac +
Xcode. Free-team provisioning installs on a personal iPhone with 7-day
re-signing; $99/yr only for TestFlight/App Store. Screen-orientation plugin
supports iOS, so landscape lock carries over. Do only if an iPhone/iPad enters
the picture.

---

## M10 (v2 sketch) — MIDI clock in, audible click

Not scheduled; documented so M7's prep is aimed correctly.

- **Why native:** the Web MIDI API is a Chrome-browser feature and is not
  reliably available inside Android's WebView — do not plan on it. The path is
  a thin Capacitor plugin bridging **`android.media.midi`** (covers USB-OTG
  and BLE MIDI devices) to JS.
- **Plugin surface (minimal):** list MIDI inputs, subscribe to clock messages
  (0xF8 tick ×24/quarter, 0xFA start, 0xFC stop), emit beat events to JS.
  JS side implements `MidiClockSource` over it: derives BPM from tick spacing
  (smoothed), maps start/stop to transport. Practice gains a clock-source
  picker: Internal | MIDI in.
- **Audible click (separate decision):** if wanted, native audio via a
  Capacitor audio plugin with a pre-scheduled click buffer — never JS
  `setInterval`-driven WebView audio, which drifts. The `ClockSource` seam
  serves this too: the click renderer subscribes to the same beat events.
- Use case to design against: Ableton (or a drum machine) sends clock; the app
  follows tempo and advances chords in sync, so practice loops and the DAW
  session share one groove.

---

## Sequencing

M7 → live with it on the phone for a couple of weeks of real practice →
M9 (♯5) when Module 7 work resumes → M10 when the DAW-sync itch becomes real.
M8/M8b only on demand.
