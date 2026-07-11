import { useState } from 'react'
import Fretboard from './Fretboard'
import { DIATONIC_ROMANS, resolveOverlay } from '../lib/theory'
import './degree-lens.css'

export interface BoxViewProps {
  keyName?: string
  /** Inclusive fret range of the box (default B-minor box / D E-shape zone). */
  box?: { start: number; end: number }
  initialRoman?: string
  initialMinor?: boolean
}

/**
 * Module 6 — the BB box as home base. The board is locked to one position; the
 * constraint is the point. Every overlay leaves 2–4 tones inside the box, and
 * that's all a melody needs.
 */
export default function BoxView({
  keyName = 'D',
  box = { start: 7, end: 10 },
  initialRoman = 'vi',
  initialMinor = true,
}: BoxViewProps) {
  const [roman, setRoman] = useState(initialRoman)
  const [minor, setMinor] = useState(initialMinor)
  const [names, setNames] = useState(false)
  const overlay = resolveOverlay(keyName, roman, false)

  return (
    <section className="dl">
      <div className="dl-chips" role="group" aria-label="Chords available in the box">
        <span className="dl-tag">In the box</span>
        {DIATONIC_ROMANS.map((r) => {
          const o = resolveOverlay(keyName, r, false)
          return (
            <button
              key={r}
              className={'dl-chip' + (roman === r ? ' active' : '')}
              aria-pressed={roman === r}
              onClick={() => setRoman(r)}
            >
              {o.name}
              <small>{r}</small>
            </button>
          )
        })}
        <span className="dl-spacer" />
        <button className="dl-tog minor" aria-pressed={minor} onClick={() => setMinor((v) => !v)}>
          minor lens
        </button>
        <button className="dl-tog" aria-pressed={names} onClick={() => setNames((v) => !v)}>
          note names
        </button>
      </div>

      <div className="dl-boardwrap">
        <Fretboard
          keyName={keyName}
          chord={overlay}
          showGuides={false}
          showNames={names}
          minorLens={minor}
          zone={box}
          view={box}
        />
      </div>
      <p style={{ color: 'var(--ink-dim)', fontSize: 12, margin: '4px 4px 0', lineHeight: 1.5 }}>
        {overlay.name} inside the box: the glowing dots are every tone of this overlay you can reach
        without leaving position. The 4 over G and the 7 over A are both in here — find them.
      </p>
    </section>
  )
}
