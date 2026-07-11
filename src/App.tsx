import { useEffect, useState } from 'react'
import { MODULES } from './content/curriculum'
import './components/lesson.css'

function currentIdFromHash(): string {
  const h = window.location.hash.replace(/^#/, '')
  return MODULES.some((m) => m.id === h) ? h : 'overview'
}

export default function App() {
  const [currentId, setCurrentId] = useState<string>(currentIdFromHash)

  useEffect(() => {
    const onHash = () => setCurrentId(currentIdFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (id: string) => {
    window.location.hash = id
    setCurrentId(id)
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // jsdom / unsupported: no-op
    }
  }

  const idx = MODULES.findIndex((m) => m.id === currentId)
  const mod = MODULES[idx]
  const prev = idx > 0 ? MODULES[idx - 1] : null
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null
  const navNum = (m: (typeof MODULES)[number]) => (m.num === 'overview' ? '◆' : String(m.num))

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          Degree Lens
          <span className="thin">one map, seven overlays</span>
        </div>
        <nav className="app-nav" aria-label="Modules">
          {MODULES.map((m) => (
            <button
              key={m.id}
              className={'app-navitem' + (m.id === currentId ? ' active' : '')}
              aria-current={m.id === currentId ? 'page' : undefined}
              onClick={() => go(m.id)}
            >
              <span className="app-navnum">{navNum(m)}</span>
              <span className="app-navtitle">{m.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="lesson">
        <header className="lesson-head">
          <div className="lesson-eyebrow">
            {mod.num === 'overview' ? 'Framework' : `Module ${mod.num}`}
          </div>
          <h1 className="lesson-title">{mod.title}</h1>
          <div className="lesson-sub">{mod.subtitle}</div>
        </header>

        <mod.Body />

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
