import { useState } from 'react'
import {
  DIATONIC_ROMANS,
  STRING_NAME_BY_NUMBER,
  minorLensLabel,
  resolveOverlay,
  triadWindows,
} from '../lib/theory'
import type { Degree, StringSetId, TriadWindow } from '../lib/theory'
import './degree-lens.css'

const STRING_SETS: { id: StringSetId; label: string; strings: [number, number, number] }[] = [
  { id: 'top', label: 'e · B · G', strings: [1, 2, 3] },
  { id: 'mid', label: 'B · G · D', strings: [2, 3, 4] },
  { id: 'low', label: 'G · D · A', strings: [3, 4, 5] },
]

export interface TriadWindowsProps {
  keyName?: string
  initialRoman?: string
  minorLens?: boolean
}

/**
 * Module 5 — the nine string-set triad windows for a chord. Each window is the
 * chord's degree-trio clustered in a different stacking; not a new shape.
 */
export default function TriadWindows({
  keyName = 'D',
  initialRoman = 'IV',
  minorLens = false,
}: TriadWindowsProps) {
  const [roman, setRoman] = useState(initialRoman)
  const [minor, setMinor] = useState(minorLens)
  const overlay = resolveOverlay(keyName, roman, false)
  const label = (d: Degree) => (minor ? minorLensLabel(d) : String(d))

  return (
    <section className="dl">
      <div className="dl-bar">
        <label htmlFor="tw-chord">Chord</label>
        <select id="tw-chord" value={roman} onChange={(e) => setRoman(e.target.value)}>
          {DIATONIC_ROMANS.map((r) => (
            <option key={r} value={r}>
              {resolveOverlay(keyName, r, false).name} — {r}
            </option>
          ))}
        </select>
        <button className="dl-tog minor" aria-pressed={minor} onClick={() => setMinor((v) => !v)}>
          minor lens
        </button>
        <span className="dl-spacer" />
        <span style={{ color: 'var(--ink-dim)', fontSize: 12 }}>
          {overlay.name} = trio <b style={{ color: 'var(--tone)' }}>{overlay.degrees.map(label).join(' · ')}</b>,
          nine windows
        </span>
      </div>

      <div className="tw-grid">
        {STRING_SETS.map((set) => {
          const windows = triadWindows(keyName, roman, set.id)
          return (
            <div key={set.id} className="tw-setrow">
              <div className="tw-setlabel">{set.label}</div>
              <div className="tw-windows">
                {windows.map((w) => (
                  <MiniTriad key={w.inversion} window={w} strings={set.strings} label={label} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MiniTriad({
  window: w,
  strings,
  label,
}: {
  window: TriadWindow
  strings: [number, number, number] // low->high pitch
  label: (d: Degree) => string
}) {
  const frets = w.notes.map((n) => n.fret)
  const lo = Math.max(0, Math.min(...frets) - 1)
  const hi = Math.max(...frets) + 1
  const cols = hi - lo + 1

  const CW = 28 // column width
  const RH = 24 // row height
  const PADL = 26 // left pad for string names
  const PADT = 6
  const width = PADL + cols * CW + 6
  const height = PADT + 3 * RH + 20

  // Display order: high pitch on top. strings is low->high, so reverse.
  const rows = [...strings].reverse() // [e, B, G]-ish (high->low)

  const noteByString = new Map(w.notes.map((n) => [n.stringNumber, n]))

  const colX = (f: number) => PADL + (f - lo) * CW + CW / 2

  return (
    <figure className="tw-fig">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} role="img" aria-label={`${w.inversion} inversion`}>
        {/* fret grid lines */}
        {Array.from({ length: cols + 1 }, (_, i) => {
          const x = PADL + i * CW
          return <line key={`f-${i}`} x1={x} y1={PADT} x2={x} y2={PADT + 3 * RH} stroke="var(--line)" strokeWidth={1} />
        })}
        {/* strings */}
        {rows.map((sn, ri) => {
          const y = PADT + ri * RH + RH / 2
          return (
            <g key={`s-${sn}`}>
              <line x1={PADL} y1={y} x2={PADL + cols * CW} y2={y} stroke="var(--string)" strokeWidth={1} opacity={0.5} />
              <text x={6} y={y + 4} fill="var(--ink-faint)" fontSize={11} fontFamily="'JetBrains Mono', monospace">
                {STRING_NAME_BY_NUMBER[sn]}
              </text>
            </g>
          )
        })}
        {/* dots */}
        {rows.map((sn, ri) => {
          const n = noteByString.get(sn)
          if (!n) return null
          const y = PADT + ri * RH + RH / 2
          const x = colX(n.fret)
          return (
            <g key={`d-${sn}`}>
              <circle cx={x} cy={y} r={10} fill="var(--tone)" />
              <text className="tw-dotlabel" x={x} y={y + 4} textAnchor="middle" fill="var(--tone-txt)" fontSize={11} fontWeight={700} fontFamily="'JetBrains Mono', monospace">
                {label(n.degree)}
              </text>
            </g>
          )
        })}
        {/* fret numbers */}
        {Array.from({ length: cols }, (_, i) => {
          const f = lo + i
          if (f === 0) return null
          return (
            <text key={`n-${f}`} x={colX(f)} y={height - 6} textAnchor="middle" fill="var(--ink-faint)" fontSize={10} fontFamily="'JetBrains Mono', monospace">
              {f}
            </text>
          )
        })}
      </svg>
      <figcaption className="tw-cap">{w.inversion === 'root' ? 'root pos' : `${w.inversion} inv`}</figcaption>
    </figure>
  )
}
