import { ROMAN, chordDegrees, guideTones, noteNameOfDegree } from './lib/theory'
import type { Degree } from './lib/theory'

/**
 * M1 proof-of-life: the seven overlays, computed live from theory.ts in key D.
 * Replaced by the real Fretboard UI in M2.
 */
export default function App() {
  const key = 'D'
  const degrees: Degree[] = [1, 2, 3, 4, 5, 6, 7]

  return (
    <main style={{ padding: 'clamp(20px, 4vw, 48px)', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 34px)' }}>
        Degree Lens <span style={{ color: 'var(--ink-dim)', fontWeight: 300 }}>— M1 · theory.ts</span>
      </h1>
      <p style={{ color: 'var(--ink-dim)', margin: '8px 0 24px', maxWidth: '60ch', lineHeight: 1.5 }}>
        The seven overlays in {key} major, generated from the rules — not a table. Every
        number below comes from <code>theory.ts</code>. Fretboard UI arrives in M2.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--ink-faint)' }}>
            <th style={cell}>Chord</th>
            <th style={cell}>Degrees</th>
            <th style={cell}>+7th</th>
            <th style={cell}>Guide tones</th>
            <th style={cell}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {degrees.map((n) => {
            const roman = ROMAN[n]
            const trio = chordDegrees(roman)
            const seventh = chordDegrees(roman + '7')
            const guides = guideTones(roman)
            return (
              <tr key={n} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ ...cell, color: 'var(--tone)' }}>{roman}</td>
                <td style={cell}>{trio.join(' · ')}</td>
                <td style={{ ...cell, color: 'var(--ink-dim)' }}>{seventh.join(' · ')}</td>
                <td style={{ ...cell, color: 'var(--guide)' }}>{guides.join(' & ')}</td>
                <td style={{ ...cell, color: 'var(--ink-dim)' }}>
                  {trio.map((d) => noteNameOfDegree(key, d)).join(' ')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}

const cell: React.CSSProperties = { padding: '8px 12px' }
