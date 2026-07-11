/**
 * theory.ts — the ONLY place music math lives.
 *
 * Everything is expressed in scale degrees of the parent major scale (1..7).
 * Note names are a secondary, derived label. Components must never compute
 * intervals inline; they call these pure functions.
 *
 * See 01-VISION-AND-FRAMEWORK.md §2 (the seven overlays) and §3 (minor lens).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Chromatic note names, sharp spelling, indexed by pitch class 0..11. */
export const NOTES = [
  'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B',
] as const

/** Semitone offsets of the major scale from the tonic. */
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11] as const

/**
 * Open-string pitch classes by guitar string NUMBER (1 = high e ... 6 = low E),
 * standard tuning EADGBE. Index 0 is unused so the array is 1-indexed.
 */
const OPEN_PC_BY_STRING = [
  /* 0 unused */ -1,
  4, // 1: high e
  11, // 2: B
  7, // 3: G
  2, // 4: D
  9, // 5: A
  4, // 6: low E
] as const

/** Display name of each string by number (1 = high e). */
export const STRING_NAME_BY_NUMBER = [
  '', 'e', 'B', 'G', 'D', 'A', 'E',
] as const

/** Number of frets modelled on the neck (0 = open .. 15). */
export const FRETS = 15

export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Chord quality by scale degree (triads of the major scale). */
export const QUALITY: Record<Degree, string> = {
  1: '', 2: 'm', 3: 'm', 4: '', 5: '', 6: 'm', 7: '°',
}

/** Seventh-chord quality by scale degree. */
export const QUALITY7: Record<Degree, string> = {
  1: 'maj7', 2: 'm7', 3: 'm7', 4: 'maj7', 5: '7', 6: 'm7', 7: 'm7♭5',
}

/** Canonical roman numeral for each diatonic degree. */
export const ROMAN: Record<Degree, string> = {
  1: 'I', 2: 'ii', 3: 'iii', 4: 'IV', 5: 'V', 6: 'vi', 7: 'vii°',
}

/**
 * The minor-lens relabeling dictionary (01 §3). The minor tonic lives on
 * major-map degree 6; every other label falls out from that anchor.
 */
const MINOR_LENS: Record<Degree, string> = {
  1: '♭3', 2: '4', 3: '5', 4: '♭6', 5: '♭7', 6: '1', 7: '2',
}

// ---------------------------------------------------------------------------
// Degree arithmetic
// ---------------------------------------------------------------------------

/** Wrap an integer degree back into 1..7 (diatonic, wrapping after 7). */
export function wrap(d: number): Degree {
  return (((d - 1) % 7 + 7) % 7 + 1) as Degree
}

// ---------------------------------------------------------------------------
// Keys, scales, note names
// ---------------------------------------------------------------------------

/** Pitch class of a key name, e.g. "D" -> 2. Accepts ASCII "#"/"b" or "♯"/"♭". */
export function pcOf(key: string): number {
  const norm = key.trim().replace('♯', '#').replace('♭', 'b')
  const letter = norm[0].toUpperCase()
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  let pc = base[letter]
  if (pc === undefined) throw new Error(`Unrecognized key: ${key}`)
  for (const accidental of norm.slice(1)) {
    if (accidental === '#') pc += 1
    else if (accidental === 'b') pc -= 1
  }
  return ((pc % 12) + 12) % 12
}

/** Pitch classes of the major scale of `key`, degree 1..7 in order. */
export function majorScalePcs(key: string): number[] {
  const root = pcOf(key)
  return MAJOR_STEPS.map((s) => (root + s) % 12)
}

/** Pitch class of a scale degree in a key. */
export function pcOfDegree(key: string, degree: Degree): number {
  return majorScalePcs(key)[degree - 1]
}

/** Note name of a pitch class, sharp spelling. */
export function noteNameOfPc(pc: number): string {
  return NOTES[((pc % 12) + 12) % 12]
}

/** Note name of a scale degree in a key, e.g. degree 4 of D -> "G". */
export function noteNameOfDegree(key: string, degree: Degree): string {
  return noteNameOfPc(pcOfDegree(key, degree))
}

/**
 * Scale degree sounding at (string, fret) in `key`, or null if the note is
 * outside the parent major scale.
 *
 * @param stringNumber 1 = high e, 6 = low E (standard guitar numbering).
 */
export function degreeAt(key: string, stringNumber: number, fret: number): Degree | null {
  const openPc = OPEN_PC_BY_STRING[stringNumber]
  if (openPc === undefined || openPc < 0) throw new Error(`Bad string number: ${stringNumber}`)
  const pc = (openPc + fret) % 12
  const idx = majorScalePcs(key).indexOf(pc)
  return idx === -1 ? null : ((idx + 1) as Degree)
}

// ---------------------------------------------------------------------------
// Roman numeral parsing & the seven overlays
// ---------------------------------------------------------------------------

/**
 * A "special" (non-diatonic-triad) chord referenced by id, with its degree
 * trio and guide tones precomputed. Extendable — add entries here, never
 * inline in components.
 */
export const SPECIALS: Record<string, { degrees: Degree[]; guides: Degree[] }> = {
  // I sus2 — no 3rd; the melody can supply degree 3 and *be* the resolution.
  Isus2: { degrees: [1, 2, 5], guides: [2] },
}

/** Parse the degree out of a roman numeral, ignoring accidentals and quality. */
export function romanToDegree(roman: string): Degree {
  const s = roman.replace(/^[b♭#♯]+/, '').toUpperCase()
  const order: [string, Degree][] = [
    ['VII', 7], ['VI', 6], ['IV', 4], ['III', 3], ['II', 2], ['V', 5], ['I', 1],
  ]
  for (const [token, deg] of order) if (s.startsWith(token)) return deg
  throw new Error(`Unrecognized roman numeral: ${roman}`)
}

/** True if the roman numeral carries a diatonic 7th (contains an arabic 7). */
function hasSeventh(roman: string): boolean {
  return /7/.test(roman)
}

/** True if the roman numeral is a suspended-2nd chord. */
function isSus2(roman: string): boolean {
  return /sus2/i.test(roman)
}

/**
 * Degree trio (or tetrad with the 7th) that glows for a chord.
 *
 * Triad rule: root degree, skip one, skip one -> n, n+2, n+4 (wrap after 7).
 * 7th rule: the diatonic 7th of any chord is one degree below its root (n+6).
 * "IV" -> [4,6,1]; "V7" -> [5,7,2,4]; "vii°" -> [7,2,4]; "vi7" -> [6,1,3,5].
 */
export function chordDegrees(roman: string): Degree[] {
  if (SPECIALS[roman]) return [...SPECIALS[roman].degrees]
  const n = romanToDegree(roman)
  if (isSus2(roman)) return [n, wrap(n + 1), wrap(n + 4)]
  const degs: Degree[] = [n, wrap(n + 2), wrap(n + 4)]
  if (hasSeventh(roman)) degs.push(wrap(n + 6))
  return degs
}

/**
 * Guide tones — the 3rd and 7th, the notes that *are* the harmony.
 * Rule: guide tones = n+2 and n-1 (01 §2). A sus2 chord has no 3rd/7th, so
 * its single "tension" note (the 2) is returned instead.
 */
export function guideTones(roman: string): Degree[] {
  if (SPECIALS[roman]) return [...SPECIALS[roman].guides]
  const n = romanToDegree(roman)
  if (isSus2(roman)) return [wrap(n + 1)]
  return [wrap(n + 2), wrap(n - 1)]
}

/** Minor-lens relabel of a major-map degree (6 -> "1", 1 -> "♭3", ...). */
export function minorLensLabel(d: Degree): string {
  return MINOR_LENS[d]
}

/** Human-readable chord name in a key, e.g. ("D","IV",false) -> "G". */
export function chordName(key: string, roman: string, seventh = false): string {
  const n = romanToDegree(roman)
  const base = noteNameOfDegree(key, n)
  if (SPECIALS[roman] || /sus2/i.test(roman)) return base + 'sus2'
  const wantSeventh = seventh || /7/.test(roman)
  return base + (wantSeventh ? QUALITY7[n] : QUALITY[n])
}

/** A fully-resolved chord overlay: what glows, the guide tones, the name. */
export interface Overlay {
  roman: string
  root: Degree
  degrees: Degree[]
  guides: Degree[]
  name: string
}

/**
 * Resolve a roman numeral (optionally with the 7th toggled on) into everything
 * a component needs to render its overlay. The single entry point components
 * use — they never assemble chords by hand.
 */
export function resolveOverlay(key: string, roman: string, seventh: boolean): Overlay {
  const isSpecial = !!SPECIALS[roman]
  const alreadyHasQuality = /7|sus/i.test(roman)
  const withSeventh = seventh && !isSpecial && !alreadyHasQuality ? roman + '7' : roman
  return {
    roman,
    root: romanToDegree(roman),
    degrees: chordDegrees(withSeventh),
    guides: guideTones(roman),
    name: chordName(key, roman, seventh),
  }
}

/** The seven diatonic roman numerals, I..vii°. */
export const DIATONIC_ROMANS: string[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ROMAN[n as Degree])

/** Degrees present in `next` that were not in `prev` — the change-announcers. */
export function freshNotes(prev: Degree[], next: Degree[]): Degree[] {
  const prevSet = new Set(prev)
  return next.filter((d) => !prevSet.has(d))
}

// ---------------------------------------------------------------------------
// String-set triad windows (Module 5)
// ---------------------------------------------------------------------------

export type StringSetId = 'top' | 'mid' | 'low'
export type Inversion = 'root' | '1st' | '2nd'

export interface TriadNote {
  stringNumber: number
  stringName: string
  fret: number
  degree: Degree
}

export interface TriadWindow {
  inversion: Inversion
  /** low-pitch string first. */
  notes: TriadNote[]
}

/**
 * The three adjacent strings of each set, ordered LOW pitch -> HIGH pitch
 * (by string number, higher number = lower pitch).
 */
const STRING_SETS: Record<StringSetId, [number, number, number]> = {
  top: [3, 2, 1], // G, B, e
  mid: [4, 3, 2], // D, G, B
  low: [5, 4, 3], // A, D, G
}

/** Low->high degree stack for each inversion of a triad rooted on degree n. */
function inversionStack(n: Degree, inv: Inversion): [Degree, Degree, Degree] {
  const third = wrap(n + 2)
  const fifth = wrap(n + 4)
  switch (inv) {
    case 'root':
      return [n, third, fifth]
    case '1st':
      return [third, fifth, n]
    case '2nd':
      return [fifth, n, third]
  }
}

/** All frets (0..FRETS) on a string that sound `degree` in `key`. */
function fretsForDegree(key: string, stringNumber: number, degree: Degree): number[] {
  const pc = pcOfDegree(key, degree)
  const openPc = OPEN_PC_BY_STRING[stringNumber]
  const lowest = (((pc - openPc) % 12) + 12) % 12
  const out: number[] = []
  for (let f = lowest; f <= FRETS; f += 12) out.push(f)
  return out
}

/**
 * The three inversions of a chord's triad on one string set, each returned as
 * the most compact voicing (minimal fret span; ties resolved lower on the neck).
 *
 * Every window is just the chord's degree-trio clustered — a "constellation",
 * not a new shape (01 §4).
 */
export function triadWindows(
  key: string,
  roman: string,
  stringSet: StringSetId,
): TriadWindow[] {
  const trio = chordDegrees(roman).slice(0, 3) as [Degree, Degree, Degree]
  const n = trio[0]
  const strings = STRING_SETS[stringSet] // low -> high pitch

  const inversions: Inversion[] = ['root', '1st', '2nd']
  return inversions.map((inv) => {
    const stack = inversionStack(n, inv) // low -> high pitch degrees
    // Candidate frets per string for its assigned degree.
    const candidates = strings.map((s, i) => fretsForDegree(key, s, stack[i]))

    // Brute-force the most compact voicing across candidate frets.
    let best: number[] | null = null
    let bestSpan = Infinity
    let bestMax = Infinity
    for (const a of candidates[0]) {
      for (const b of candidates[1]) {
        for (const c of candidates[2]) {
          const span = Math.max(a, b, c) - Math.min(a, b, c)
          const max = Math.max(a, b, c)
          if (span < bestSpan || (span === bestSpan && max < bestMax)) {
            best = [a, b, c]
            bestSpan = span
            bestMax = max
          }
        }
      }
    }

    const frets = best as number[]
    const notes: TriadNote[] = strings.map((s, i) => ({
      stringNumber: s,
      stringName: STRING_NAME_BY_NUMBER[s],
      fret: frets[i],
      degree: stack[i],
    }))
    return { inversion: inv, notes }
  })
}
