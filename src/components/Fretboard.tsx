import { useMemo } from 'react'
import {
  FRETS,
  STRING_NAME_BY_NUMBER,
  degreeAt,
  minorLensLabel,
  noteNameOfDegree,
} from '../lib/theory'
import type { Degree, Overlay } from '../lib/theory'

export interface FretboardProps {
  keyName: string
  chord: Overlay
  showGuides: boolean
  showNames: boolean
  minorLens: boolean
  /** Degrees to pulse as "fresh" when the overlay just changed. */
  freshSet?: Set<Degree>
  /** Bumped on each overlay change so the fresh-note pulse replays. */
  pulseId?: number
  /** Highlighted position band (CAGED zone), inclusive fret range. */
  zone?: { start: number; end: number } | null
  /** Visible fret window (inclusive). Defaults to the whole neck. */
  view?: { start: number; end: number }
}

// Board geometry (ported from degree-lens-demo.html).
const L = 56 // x of the nut
const FW = 58 // fret width
const TOP = 26 // y of the top string
const SS = 32 // string spacing
const STRINGS = [1, 2, 3, 4, 5, 6] // string numbers, 1 = high e (top row)
const INLAY_SINGLE = [3, 5, 7, 9, 15]
const FRET_NUMBERS = [3, 5, 7, 9, 12, 15]

export default function Fretboard({
  keyName,
  chord,
  showGuides,
  showNames,
  minorLens,
  freshSet,
  pulseId = 0,
  zone = null,
  view = { start: 0, end: FRETS },
}: FretboardProps) {
  const first = Math.max(0, view.start)
  const last = Math.min(FRETS, view.end)
  const showOpen = first === 0

  // x of a fret wire; x of a fretted note's centre (half a fret to the left).
  const wireX = (f: number) => L + (f - first) * FW
  const noteX = (f: number) => (f === 0 ? L - 18 : wireX(f) - FW / 2)

  const W = wireX(last) + 16
  const H = TOP + 5 * SS + 44

  const tones = useMemo(() => new Set(chord.degrees), [chord])
  const guides = useMemo(() => new Set(chord.guides), [chord])

  const label = (d: Degree) =>
    showNames ? noteNameOfDegree(keyName, d) : minorLens ? minorLensLabel(d) : String(d)

  // Build the dots.
  const dots: React.ReactNode[] = []
  for (let si = 0; si < STRINGS.length; si++) {
    const stringNumber = STRINGS[si]
    const cy = TOP + si * SS
    for (let f = first; f <= last; f++) {
      const d = degreeAt(keyName, stringNumber, f)
      if (d === null) continue
      const cx = noteX(f)
      const isTone = tones.has(d)
      const isRoot = d === chord.root
      const isGuide = showGuides && isTone && guides.has(d)
      const isFresh = !!freshSet && isTone && freshSet.has(d)
      const minorTonic = minorLens && d === 6 && isTone
      const r = isTone ? 13 : 8.5
      let fill = isTone ? (isRoot ? 'var(--root)' : 'var(--tone)') : 'var(--scale-dot)'
      if (minorTonic) fill = 'var(--minor)'
      const key = isFresh ? `${stringNumber}-${f}-p${pulseId}` : `${stringNumber}-${f}`
      dots.push(
        <g key={key}>
          {isFresh && (
            <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke="var(--fresh)" strokeWidth={1.6} opacity={0.8} />
          )}
          <circle
            className={isFresh ? 'dl-fresh' : undefined}
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            opacity={isTone ? 1 : 0.85}
          />
          {isGuide && (
            <circle cx={cx} cy={cy} r={r + 3.5} fill="none" stroke="var(--guide)" strokeWidth={2.4} />
          )}
          <text
            x={cx}
            y={cy + (isTone ? 4.4 : 3.4)}
            textAnchor="middle"
            fill={isTone ? 'var(--tone-txt)' : 'var(--scale-txt)'}
            fontSize={isTone ? 12 : 9}
            fontWeight={isTone ? 700 : 400}
            fontFamily="'JetBrains Mono', monospace"
          >
            {label(d)}
          </text>
        </g>,
      )
    }
  }

  // Zone band, clamped to the visible window.
  let band: React.ReactNode = null
  if (zone) {
    const zStart = Math.max(zone.start, showOpen ? 1 : first)
    const zEnd = Math.min(zone.end, last)
    if (zEnd >= zStart) {
      const bx = wireX(zStart - 1)
      const bw = (zEnd - zStart + 1) * FW
      band = <rect x={bx} y={TOP - 16} width={bw} height={5 * SS + 32} rx={5} fill="var(--tone)" opacity={0.06} />
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', height: 'auto', minWidth: last - first > 9 ? 780 : undefined }}
      role="img"
      aria-label={`Fretboard in ${keyName} major, ${chord.name} overlay glowing`}
    >
      {/* board wood */}
      <rect x={L} y={TOP - 14} width={wireX(last) - L} height={5 * SS + 28} rx={4} fill="var(--board)" />
      {band}
      {/* fret wires */}
      {Array.from({ length: last - first + 1 }, (_, i) => {
        const f = first + i
        const x = wireX(f)
        const isNut = f === 0
        return (
          <rect
            key={`wire-${f}`}
            x={x - (isNut ? 3 : 1)}
            y={TOP - 14}
            width={isNut ? 5 : 2}
            height={5 * SS + 28}
            fill={isNut ? '#c9cfd6' : 'var(--fretwire)'}
          />
        )
      })}
      {/* inlays */}
      {INLAY_SINGLE.filter((f) => f >= first && f <= last).map((f) => (
        <circle key={`inlay-${f}`} cx={wireX(f) - FW / 2} cy={TOP + 2.5 * SS} r={5} fill="#332a20" />
      ))}
      {12 >= first && 12 <= last && (
        <>
          <circle cx={wireX(12) - FW / 2} cy={TOP + 1.5 * SS} r={5} fill="#332a20" />
          <circle cx={wireX(12) - FW / 2} cy={TOP + 3.5 * SS} r={5} fill="#332a20" />
        </>
      )}
      {/* strings + labels */}
      {STRINGS.map((sn, si) => {
        const y = TOP + si * SS
        return (
          <g key={`string-${sn}`}>
            <rect x={L} y={y - 0.4 - si * 0.18} width={wireX(last) - L} height={1 + si * 0.45} fill="var(--string)" opacity={0.8} />
            <text x={L - 40} y={y + 4} fill="var(--ink-faint)" fontSize={11} fontFamily="'JetBrains Mono', monospace">
              {STRING_NAME_BY_NUMBER[sn]}
            </text>
          </g>
        )
      })}
      {/* fret numbers */}
      {FRET_NUMBERS.filter((f) => f >= first && f <= last).map((f) => (
        <text
          key={`num-${f}`}
          x={wireX(f) - FW / 2}
          y={H - 8}
          fill="var(--ink-faint)"
          fontSize={11}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
        >
          {f}
        </text>
      ))}
      {dots}
    </svg>
  )
}
