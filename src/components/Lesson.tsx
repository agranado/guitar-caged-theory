import { useEffect, useState } from 'react'
import { getJSON, setJSON } from '../lib/storage'
import './lesson.css'

// --- shared prose primitives (used by curriculum content) -----------------

export function P({ children }: { children: React.ReactNode }) {
  return <p className="ls-p">{children}</p>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="ls-h3">{children}</h3>
}

/** A degree, rendered in the tone colour — the primary label everywhere. */
export function D({ children }: { children: React.ReactNode }) {
  return <b className="ls-deg">{children}</b>
}

/** A monospace tab / chart block. */
export function Tab({ children }: { children: React.ReactNode }) {
  return (
    <pre className="ls-tab">
      <code>{children}</code>
    </pre>
  )
}

export function Callout({ children }: { children: React.ReactNode }) {
  return <div className="ls-callout">{children}</div>
}

// --- done-when checklist, persisted to localStorage -----------------------

export function Checklist({ id, items, doneWhen }: { id: string; items: string[]; doneWhen: string }) {
  const storageKey = `dl-check-${id}`
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved = getJSON<boolean[] | null>(storageKey, null)
    if (Array.isArray(saved) && saved.length === items.length) return saved
    return items.map(() => false)
  })

  useEffect(() => {
    setJSON(storageKey, checked)
  }, [storageKey, checked])

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))

  const done = checked.filter(Boolean).length

  return (
    <div className="ls-checklist">
      <div className="ls-checkhead">
        Drills
        <span className="ls-checkcount">
          {done}/{items.length}
        </span>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <label>
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
              <span className={checked[i] ? 'ls-done' : undefined}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="ls-donewhen">
        <span className="ls-donelabel">Done when</span> {doneWhen}
      </p>
    </div>
  )
}
