import { DIATONIC_ROMANS, SPECIALS } from './theory'
import type { ProgChord } from './progressions'

/**
 * Human-readable, key-agnostic sharing of a Practice setup:
 *   ?p=Isus2.vi7.IV.V&k=D&lens=maj
 * Progression as a dot-joined roman list, plus key and lens. Parsed defensively.
 */

export type Lens = 'maj' | 'min'

// The roman vocabulary we know how to render (guards against junk in a URL).
const VOCAB = new Set<string>([
  ...DIATONIC_ROMANS,
  ...Object.keys(SPECIALS),
  'I7', 'ii7', 'iii7', 'IV7', 'V7', 'vi7', 'vii°7',
])

export function encodeChords(chords: ProgChord[]): string {
  return chords.map((c) => c.roman).join('.')
}

export function decodeChords(s: string): ProgChord[] {
  return s
    .split('.')
    .map((r) => r.trim())
    .filter((r) => VOCAB.has(r))
    .map((roman) => ({ roman }))
}

export interface ShareConfig {
  chords: ProgChord[]
  key: string
  lens: Lens
}

/** Parse a `?p=…&k=…&lens=…` query string; returns null if there's no `p`. */
export function parseShareParams(search: string): ShareConfig | null {
  const params = new URLSearchParams(search)
  const p = params.get('p')
  if (!p) return null
  const chords = decodeChords(p)
  if (chords.length === 0) return null
  const key = params.get('k') || 'D'
  const lens: Lens = params.get('lens') === 'min' ? 'min' : 'maj'
  return { chords, key, lens }
}

/** Build a shareable absolute URL that reopens Practice with this setup. */
export function buildShareUrl(cfg: ShareConfig, origin: string, pathname: string): string {
  const params = new URLSearchParams()
  params.set('p', encodeChords(cfg.chords))
  params.set('k', cfg.key)
  params.set('lens', cfg.lens)
  return `${origin}${pathname}?${params.toString()}#practice`
}
