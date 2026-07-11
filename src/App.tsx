import DegreeLens from './components/DegreeLens'

export default function App() {
  return (
    <main style={{ padding: '28px clamp(12px, 4vw, 48px) 60px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 34px)', fontWeight: 700 }}>
        Degree Lens <span style={{ fontWeight: 300, color: 'var(--ink-dim)' }}>— one map, seven overlays</span>
      </h1>
      <p style={{ color: 'var(--ink-dim)', margin: '6px 0 22px', maxWidth: '70ch', lineHeight: 1.5 }}>
        The full parent-scale map stays lit. Pick a chord and its degree-trio glows — same map,
        different glow. Everything is a scale <b>degree</b>; note names are one toggle away.
      </p>
      <DegreeLens />
    </main>
  )
}
