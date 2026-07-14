import { useEffect, useMemo, useRef, useState } from 'react'
import Fretboard, { type ColorMode } from './Fretboard'
import ColorModeToggle from './ColorModeToggle'
import {
  DIATONIC_ROMANS,
  FRETS,
  NOTES,
  freshNotes,
  minorLensLabel,
  resolveOverlay,
} from '../lib/theory'
import type { Degree } from '../lib/theory'
import { PROGRESSIONS, PROGRESSION_BY_ID, type ProgChord } from '../lib/progressions'
import { TIPS } from '../lib/tips'
import { useMetronome } from '../lib/useMetronome'
import { useSwipe } from '../lib/useSwipe'
import { loadColorMode, saveColorMode } from '../lib/prefs'
import { getJSON, setJSON } from '../lib/storage'
import { buildShareUrl, parseShareParams } from '../lib/share'
import './degree-lens.css'
import './practice.css'

const BEATS_PER_BAR = 4
const ZONE_SPAN = 3
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const BUILDER_CHORDS = ['Isus2', ...DIATONIC_ROMANS]
const CUSTOM_KEY = 'dl:customProg'
const DEFAULT_CUSTOM: ProgChord[] = [{ roman: 'vi' }, { roman: 'IV' }, { roman: 'V' }]

export default function PracticeSession() {
  // A shared URL (?p=…&k=…&lens=…) hydrates a custom setup on first load.
  const urlCfg = useRef(
    typeof window !== 'undefined' ? parseShareParams(window.location.search) : null,
  ).current

  const [keyName, setKeyName] = useState(urlCfg?.key ?? 'D')
  const [sourceId, setSourceId] = useState(urlCfg ? 'custom' : 'home')
  const [customChords, setCustomChords] = useState<ProgChord[]>(() =>
    urlCfg ? urlCfg.chords : getJSON<ProgChord[]>(CUSTOM_KEY, DEFAULT_CUSTOM),
  )
  const [seventh, setSeventh] = useState(false)
  const [minor, setMinor] = useState(urlCfg?.lens === 'min')
  const [colorMode, setColorMode] = useState<ColorMode>(loadColorMode)
  const changeColorMode = (m: ColorMode) => {
    setColorMode(m)
    saveColorMode(m)
  }
  const [zoneStart, setZoneStart] = useState(7)
  const [zoom, setZoom] = useState(false)
  // Settings collapse into a sheet; open by default except on a phone in
  // landscape, where a player mid-take wants only the board + HUD.
  const [settingsOpen, setSettingsOpen] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia?.('(orientation: landscape) and (max-height: 540px)').matches,
  )

  const [bpm, setBpm] = useState(72)
  const [barsPerChord, setBarsPerChord] = useState(2)
  const [countInOn, setCountInOn] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const isCustom = sourceId === 'custom'
  const chords: ProgChord[] = isCustom ? customChords : PROGRESSION_BY_ID[sourceId].chords
  const len = chords.length
  const idx = len ? activeIdx % len : 0
  const current = chords[idx]
  const next = len ? chords[(idx + 1) % len] : undefined

  const overlay = useMemo(
    () => (current ? resolveOverlay(keyName, current.roman, seventh) : null),
    [keyName, current, seventh],
  )
  const nextOverlay = useMemo(
    () => (next ? resolveOverlay(keyName, next.roman, seventh) : null),
    [keyName, next, seventh],
  )

  const degLabel = (d: Degree) => (minor ? minorLensLabel(d) : String(d))

  // Fresh-note pulse whenever the active chord changes.
  const [freshSet, setFreshSet] = useState<Set<Degree> | null>(null)
  const [pulseId, setPulseId] = useState(0)
  const prevDegrees = useRef<Degree[]>(overlay ? overlay.degrees : [])
  useEffect(() => {
    if (!overlay) return
    setFreshSet(new Set(freshNotes(prevDegrees.current, overlay.degrees)))
    setPulseId((p) => p + 1)
    prevDegrees.current = overlay.degrees
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current?.roman, keyName, seventh])

  // Persist the custom progression so it survives a reload.
  useEffect(() => {
    setJSON(CUSTOM_KEY, customChords)
  }, [customChords])

  const [shared, setShared] = useState(false)
  const onShare = () => {
    if (typeof window === 'undefined') return
    const url = buildShareUrl(
      { chords: customChords, key: keyName, lens: minor ? 'min' : 'maj' },
      window.location.origin,
      window.location.pathname,
    )
    try {
      navigator.clipboard?.writeText(url)
    } catch {
      // clipboard unavailable — no-op
    }
    setShared(true)
  }

  const metro = useMetronome({
    playing: playing && len > 0,
    bpm,
    barsPerChord,
    beatsPerBar: BEATS_PER_BAR,
    countInBars: countInOn ? 1 : 0,
    onChordAdvance: () => setActiveIdx((i) => (len ? (i + 1) % len : 0)),
  })

  const changeSource = (id: string) => {
    setSourceId(id)
    setActiveIdx(0)
    if (id !== 'custom') {
      const p = PROGRESSION_BY_ID[id]
      if (p.autoMinor) setMinor(true)
    }
  }

  const step = (dir: number) => {
    if (!len) return
    setActiveIdx((i) => (((i + dir) % len) + len) % len)
  }
  // Swipe left = advance, swipe right = go back (parity with ←/→).
  const swipe = useSwipe(() => step(1), () => step(-1))

  const zone = { start: zoneStart, end: Math.min(FRETS, zoneStart + ZONE_SPAN) }
  const view = zoom
    ? { start: clamp(zoneStart - 1, 0, FRETS), end: clamp(zoneStart + 5, 0, FRETS) }
    : { start: 0, end: FRETS }

  // countdown: highlight the upcoming change during the last bar of the chord
  const showCue = metro.phase === 'play' && metro.beatsUntilChange <= BEATS_PER_BAR
  const target = current?.target
  const tip = current ? TIPS[current.roman] : undefined

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { step(1); e.preventDefault() }
    else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault() }
    else if (e.key === ' ') { setPlaying((p) => !p); e.preventDefault() }
  }

  return (
    <section className="pr dl" tabIndex={0} onKeyDown={onKeyDown} aria-label="Practice session">
      {/* compact transport — always visible: progression, settings, play */}
      <div className="dl-bar pr-transport">
        <label htmlFor="pr-src">Progression</label>
        <select id="pr-src" value={sourceId} onChange={(e) => changeSource(e.target.value)}>
          {PROGRESSIONS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
          <option value="custom">Custom…</option>
        </select>

        <button className="dl-tog" aria-pressed={settingsOpen} onClick={() => setSettingsOpen((v) => !v)}>
          ⚙ settings
        </button>

        <span className="dl-spacer" />
        <button className="pr-play" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}
          disabled={len === 0}>
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
      </div>

      {/* settings sheet — collapses on a phone in landscape */}
      {settingsOpen && (
        <div className="pr-settings">
          <div className="pr-settingsrow">
            <label htmlFor="pr-key">Key</label>
            <select id="pr-key" value={keyName} onChange={(e) => setKeyName(e.target.value)}>
              {NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <label htmlFor="pr-bpm">BPM</label>
            <input id="pr-bpm" type="number" min={30} max={240} value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))} style={{ width: 62 }} />
            <label htmlFor="pr-bars">bars/chord</label>
            <input id="pr-bars" type="number" min={1} max={8} value={barsPerChord}
              onChange={(e) => setBarsPerChord(Number(e.target.value))} style={{ width: 52 }} />
            <button className="dl-tog" aria-pressed={countInOn} onClick={() => setCountInOn((v) => !v)}>count-in</button>
            <button className="dl-tog" aria-pressed={seventh} onClick={() => setSeventh((v) => !v)}>7ths</button>
            <button className="dl-tog minor" aria-pressed={minor} onClick={() => setMinor((v) => !v)}>minor lens</button>
          </div>
          <div className="pr-settingsrow">
            <ColorModeToggle mode={colorMode} onChange={changeColorMode} />
            <span className="dl-spacer" />
            <label htmlFor="pr-pos" style={{ color: 'var(--ink-dim)', fontSize: 12 }}>Position</label>
            <input id="pr-pos" type="range" min={0} max={12} value={zoneStart}
              onChange={(e) => setZoneStart(Number(e.target.value))} style={{ width: 120 }} />
            <button className="dl-tog" aria-pressed={zoom} onClick={() => setZoom((v) => !v)}>zoom</button>
          </div>
          {isCustom && (
            <CustomBuilder
              keyName={keyName}
              seventh={seventh}
              chords={customChords}
              onAdd={(roman) => setCustomChords((c) => [...c, { roman }])}
              onRemove={(i) => setCustomChords((c) => c.filter((_, j) => j !== i))}
              onClear={() => setCustomChords([])}
              onShare={onShare}
              shared={shared}
            />
          )}
        </div>
      )}

      {/* board hero + player HUD (side rail in landscape) */}
      <div className="pr-main">
        <div className="pr-hud">
          <div className="pr-stage">
            <div className={'pr-now' + (metro.phase === 'countin' ? ' countin' : '')}>
              {metro.phase === 'countin' ? (
                <>
                  <div className="pr-nowlabel">count-in</div>
                  <div className="pr-nowname">{metro.countInRemaining}</div>
                  <div className="pr-nowsub">get ready…</div>
                </>
              ) : overlay ? (
                <>
                  <div className="pr-nowlabel">{current?.minorLabel ? `${current.minorLabel} · ` : ''}{overlay.roman}</div>
                  <div className="pr-nowname">{overlay.name}</div>
                  <div className="pr-nowdeg">{overlay.degrees.map(degLabel).join(' · ')}</div>
                  {target && <div className="pr-nowtarget">🎯 {target}</div>}
                  {!target && tip && <div className="pr-nowtarget pr-tip" dangerouslySetInnerHTML={{ __html: tip }} />}
                </>
              ) : (
                <div className="pr-nowsub">Add chords to your custom progression to begin.</div>
              )}
            </div>

            <div className={'pr-next' + (showCue ? ' cue' : '')}>
              <div className="pr-nextlabel">{showCue ? '→ changing to' : 'next'}</div>
              {nextOverlay ? (
                <>
                  <div className="pr-nextname">{nextOverlay.name}</div>
                  <div className="pr-nextdeg">{nextOverlay.degrees.map(degLabel).join(' · ')}</div>
                </>
              ) : (
                <div className="pr-nextname">—</div>
              )}
            </div>
          </div>

          <div className="pr-beats" aria-hidden="true">
            {Array.from({ length: BEATS_PER_BAR }, (_, i) => (
              <span
                key={i}
                className={
                  'pr-beat' +
                  (metro.phase !== 'idle' && i === metro.beatInBar ? ' on' : '') +
                  (metro.phase === 'countin' ? ' countin' : '')
                }
              />
            ))}
            <span className="pr-barcount">
              {metro.phase === 'play' ? `bar ${metro.barInChord + 1}/${barsPerChord}` : metro.phase === 'countin' ? 'count-in' : 'ready'}
            </span>
          </div>
        </div>

        <div className="dl-boardwrap" {...swipe}>
          {overlay && (
            <Fretboard
              keyName={keyName}
              chord={overlay}
              showGuides={false}
              showNames={false}
              minorLens={minor}
              colorMode={colorMode}
              freshSet={freshSet ?? undefined}
              pulseId={pulseId}
              zone={zone}
              view={view}
            />
          )}
        </div>
      </div>

      {/* chord strip */}
      <div className="dl-chips pr-strip" role="group" aria-label="Progression" {...swipe}>
        <button className="dl-stepbtn" onClick={() => step(-1)} aria-label="Previous chord">←</button>
        {chords.map((c, i) => {
          const o = resolveOverlay(keyName, c.roman, seventh)
          return (
            <button key={`${c.roman}-${i}`}
              className={'dl-chip dl-progchip' + (i === idx ? ' active' : '')}
              aria-pressed={i === idx}
              onClick={() => setActiveIdx(i)}>
              {c.minorLabel && <span className="dl-minorlabel">{c.minorLabel}</span>}
              {o.name}
              <small>{c.roman}</small>
            </button>
          )
        })}
        <button className="dl-stepbtn" onClick={() => step(1)} aria-label="Next chord">→</button>
      </div>
    </section>
  )
}

function CustomBuilder({
  keyName, seventh, chords, onAdd, onRemove, onClear, onShare, shared,
}: {
  keyName: string
  seventh: boolean
  chords: ProgChord[]
  onAdd: (roman: string) => void
  onRemove: (i: number) => void
  onClear: () => void
  onShare: () => void
  shared: boolean
}) {
  return (
    <div className="pr-builder">
      <div className="pr-builderrow">
        <span className="dl-tag">Add chord</span>
        {BUILDER_CHORDS.map((r) => (
          <button key={r} className="dl-chip" onClick={() => onAdd(r)}>
            {resolveOverlay(keyName, r, seventh).name}
            <small>{r}</small>
          </button>
        ))}
      </div>
      <div className="pr-builderrow">
        <span className="dl-tag">Your progression</span>
        {chords.length === 0 && <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>empty — add chords above</span>}
        {chords.map((c, i) => (
          <button key={`${c.roman}-${i}`} className="dl-chip pr-remove" onClick={() => onRemove(i)}
            title="remove">
            {resolveOverlay(keyName, c.roman, seventh).name}
            <small>{c.roman} ✕</small>
          </button>
        ))}
        {chords.length > 0 && (
          <>
            <button className="dl-stepbtn" onClick={onClear} style={{ marginLeft: 8 }}>clear</button>
            <button className="dl-tog" onClick={onShare} title="Copy a shareable link to this progression">
              {shared ? '✓ link copied' : '🔗 share link'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
