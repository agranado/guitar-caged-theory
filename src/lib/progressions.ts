/**
 * Named progressions, in roman numerals. Minor-world progressions are stored as
 * the *major-map overlays you actually play* (01 §3), with the minor-world label
 * kept alongside for display — because in the degree lens you never leave the
 * major map; you just relabel.
 */

export interface ProgChord {
  /** The major-map overlay roman to light up (I..vii°, or a special id). */
  roman: string
  /** Optional minor-world label to show above the chip (e.g. "i", "♭VI"). */
  minorLabel?: string
  /** Optional one-line targeting hint shown when this chord is active. */
  target?: string
}

export interface Progression {
  id: string
  name: string
  lens: 'major' | 'minor'
  /** Turn the minor lens on automatically when this progression is chosen. */
  autoMinor?: boolean
  chords: ProgChord[]
  note?: string
}

export const PROGRESSIONS: Progression[] = [
  {
    id: 'home',
    name: 'Dsus2 – Bm7 – G – A',
    lens: 'major',
    note: 'Your home progression (Isus2 – vi7 – IV – V). The story is 6 → 4 → 7 → 1.',
    chords: [
      { roman: 'Isus2', target: 'no 3rd — rest on 1, or tease 3' },
      { roman: 'vi7', target: 'land on 6 to announce the minor turn' },
      { roman: 'IV', target: 'land on 4 (now the root) or 6' },
      { roman: 'V', target: 'sit on 7, resolve 7→1 as it loops' },
    ],
  },
  {
    id: 'I-V-vi-IV',
    name: 'I – V – vi – IV',
    lens: 'major',
    note: 'The four-chord pop loop.',
    chords: [{ roman: 'I' }, { roman: 'V' }, { roman: 'vi' }, { roman: 'IV' }],
  },
  {
    id: 'ii-V-I',
    name: 'ii – V – I',
    lens: 'major',
    note: 'The core jazz cadence. Guide tones: (4,1) → (7,4) → (3,7).',
    chords: [{ roman: 'ii' }, { roman: 'V' }, { roman: 'I' }],
  },
  {
    id: 'i-bVI-bVII',
    name: 'i – ♭VI – ♭VII  (minor)',
    lens: 'minor',
    autoMinor: true,
    note: 'Minor world → play vi – IV – V on the major map. Same three overlays as the home loop, minus the sus.',
    chords: [
      { roman: 'vi', minorLabel: 'i' },
      { roman: 'IV', minorLabel: '♭VI' },
      { roman: 'V', minorLabel: '♭VII' },
    ],
  },
  {
    id: 'i-iv-v',
    name: 'i – iv – v  (minor)',
    lens: 'minor',
    autoMinor: true,
    note: 'Minor world → play vi – ii – iii on the major map.',
    chords: [
      { roman: 'vi', minorLabel: 'i' },
      { roman: 'ii', minorLabel: 'iv' },
      { roman: 'iii', minorLabel: 'v' },
    ],
  },
  {
    id: 'zombie',
    name: 'i – ♭III – ♭VII – ♭VI  ("Zombie")',
    lens: 'minor',
    autoMinor: true,
    note: 'Minor world → play vi – I – V – IV on the major map.',
    chords: [
      { roman: 'vi', minorLabel: 'i' },
      { roman: 'I', minorLabel: '♭III' },
      { roman: 'V', minorLabel: '♭VII' },
      { roman: 'IV', minorLabel: '♭VI' },
    ],
  },
]

export const PROGRESSION_BY_ID: Record<string, Progression> = Object.fromEntries(
  PROGRESSIONS.map((p) => [p.id, p]),
)
