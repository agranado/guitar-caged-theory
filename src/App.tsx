import DegreeLens from './components/DegreeLens'
import TriadWindows from './components/TriadWindows'
import BoxView from './components/BoxView'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 'clamp(17px, 2vw, 22px)', margin: '38px 0 4px' }}>{children}</h2>
  )
}

export default function App() {
  return (
    <main style={{ padding: '28px clamp(12px, 4vw, 48px) 80px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 34px)', fontWeight: 700 }}>
        Degree Lens <span style={{ fontWeight: 300, color: 'var(--ink-dim)' }}>— one map, seven overlays</span>
      </h1>
      <p style={{ color: 'var(--ink-dim)', margin: '6px 0 22px', maxWidth: '70ch', lineHeight: 1.5 }}>
        The full parent-scale map stays lit. Pick a chord and its degree-trio glows — same map,
        different glow. Step the progression with <kbd>←</kbd> <kbd>→</kbd> (or <kbd>space</kbd> for
        the silent metronome) and watch the <span style={{ color: 'var(--fresh)' }}>fresh note</span>{' '}
        announce each change. Everything is a scale <b>degree</b>; note names are one toggle away.
      </p>

      <DegreeLens />

      <SectionTitle>Triad windows — nine places to play any chord</SectionTitle>
      <p style={{ color: 'var(--ink-dim)', margin: '0 0 14px', maxWidth: '70ch', lineHeight: 1.5 }}>
        Every window is just the chord's degree-trio clustered — three string sets × three
        inversions. Not new shapes; the same constellation, closer or farther.
      </p>
      <TriadWindows />

      <SectionTitle>The box — home base</SectionTitle>
      <p style={{ color: 'var(--ink-dim)', margin: '0 0 14px', maxWidth: '70ch', lineHeight: 1.5 }}>
        One position, seven overlays. With nowhere to run you make the changes with note choice,
        not position shifts — which is precisely the skill.
      </p>
      <BoxView />
    </main>
  )
}
