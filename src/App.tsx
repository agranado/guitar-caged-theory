import { useEffect, useRef, useState } from 'react'
import { MODULES } from './content/curriculum'
import PracticeSession from './components/PracticeSession'
import { initNativeShell, lockLandscape, unlockOrientation } from './lib/native'
import './components/lesson.css'

interface NavEntry {
  id: string
  badge: string
  title: string
  eyebrow: string
}

const NAV: NavEntry[] = [
  { id: 'practice', badge: '▶', title: 'Practice', eyebrow: 'Play-along' },
  ...MODULES.map((m) => ({
    id: m.id,
    badge: m.num === 'overview' ? '◆' : String(m.num),
    title: m.title,
    eyebrow: m.num === 'overview' ? 'Framework' : `Module ${m.num}`,
  })),
]

function validId(id: string): string {
  return NAV.some((n) => n.id === id) ? id : 'overview'
}

function currentIdFromHash(): string {
  return validId(window.location.hash.replace(/^#/, ''))
}

export default function App() {
  const [currentId, setCurrentId] = useState<string>(currentIdFromHash)

  useEffect(() => {
    const onHash = () => setCurrentId(currentIdFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Native shell: hardware back navigates to the overview before exiting.
  const currentIdRef = useRef(currentId)
  currentIdRef.current = currentId
  useEffect(() => {
    initNativeShell(() => {
      if (currentIdRef.current !== 'overview') {
        window.location.hash = 'overview'
        return true
      }
      return false
    })
  }, [])

  // Lock Practice to landscape on native; free rotation elsewhere.
  useEffect(() => {
    if (currentId === 'practice') void lockLandscape()
    else void unlockOrientation()
  }, [currentId])

  const go = (id: string) => {
    window.location.hash = id
    setCurrentId(id)
    try {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    } catch {
      // jsdom / unsupported: no-op
    }
  }

  const idx = NAV.findIndex((n) => n.id === currentId)
  const entry = NAV[idx]
  const prev = idx > 0 ? NAV[idx - 1] : null
  const next = idx < NAV.length - 1 ? NAV[idx + 1] : null
  const mod = MODULES.find((m) => m.id === currentId)

  return (
    <div className={'app-shell' + (currentId === 'practice' ? ' practice-route' : '')}>
      <aside className="app-sidebar">
        <div className="app-brand">
          Degree Lens
          <span className="thin">one map, seven overlays</span>
        </div>
        <nav className="app-nav" aria-label="Sections">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={'app-navitem' + (n.id === currentId ? ' active' : '') + (n.id === 'practice' ? ' practice' : '')}
              aria-current={n.id === currentId ? 'page' : undefined}
              onClick={() => go(n.id)}
            >
              <span className="app-navnum">{n.badge}</span>
              <span className="app-navtitle">{n.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="lesson">
        <header className="lesson-head">
          <div className="lesson-eyebrow">{entry.eyebrow}</div>
          <h1 className="lesson-title">{entry.title}</h1>
          {mod && <div className="lesson-sub">{mod.subtitle}</div>}
          {currentId === 'practice' && (
            <div className="lesson-sub">
              Pick a progression, set the tempo, hit play — the board switches chords so you can watch
              and play at once. No audio; your guitar is the sound.
            </div>
          )}
        </header>

        {currentId === 'practice' ? <PracticeSession /> : mod ? <mod.Body /> : null}

        <div className="app-pager">
          {prev ? (
            <button className="app-pagerbtn" onClick={() => go(prev.id)}>
              <small>← previous</small>
              {prev.title}
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button className="app-pagerbtn next" onClick={() => go(next.id)}>
              <small>next →</small>
              {next.title}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
