import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fretboard from './Fretboard'
import OverlayControls from './OverlayControls'
import ProgressionStepper from './ProgressionStepper'
import {
  FRETS,
  freshNotes,
  minorLensLabel,
  noteNameOfDegree,
  resolveOverlay,
} from '../lib/theory'
import type { Degree, Overlay } from '../lib/theory'
import { PROGRESSION_BY_ID } from '../lib/progressions'
import { TIPS } from '../lib/tips'
import './degree-lens.css'

const ZONE_SPAN = 3 // a 4-fret CAGED position (start .. start+3)
const BEATS_PER_BAR = 4
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface DegreeLensProps {
  initialKey?: string
  initialRoman?: string
  initialZoneStart?: number
  initialSeventh?: boolean
  initialMinor?: boolean
  initialGuides?: boolean
  /** Show the progression stepper (default true). */
  showStepper?: boolean
  initialProgId?: string
}

export default function DegreeLens({
  initialKey = 'D',
  initialRoman = 'Isus2',
  initialZoneStart = 7,
  initialSeventh = false,
  initialMinor = false,
  initialGuides = false,
  showStepper = true,
  initialProgId = 'home',
}: DegreeLensProps) {
  const [keyName, setKeyName] = useState(initialKey)
  const [roman, setRoman] = useState(initialRoman)
  const [seventh, setSeventh] = useState(initialSeventh)
  const [guides, setGuides] = useState(initialGuides)
  const [minor, setMinor] = useState(initialMinor)
  const [names, setNames] = useState(false)
  const [zoneStart, setZoneStart] = useState(initialZoneStart)
  const [zoom, setZoom] = useState(false)

  // Progression / metronome state.
  const [progId, setProgId] = useState(initialProgId)
  const [progIdx, setProgIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [bpm, setBpm] = useState(90)
  const [barsPerChord, setBarsPerChord] = useState(2)
  const [beatTick, setBeatTick] = useState(0)

  const [freshSet, setFreshSet] = useState<Set<Degree> | null>(null)
  const [pulseId, setPulseId] = useState(0)
  const prevDegrees = useRef<Degree[]>(resolveOverlay(initialKey, initialRoman, initialSeventh).degrees)

  const progression = PROGRESSION_BY_ID[progId]

  const overlay: Overlay = useMemo(
    () => resolveOverlay(keyName, roman, seventh),
    [keyName, roman, seventh],
  )

  const degLabel = useCallback(
    (d: Degree): string =>
      names ? noteNameOfDegree(keyName, d) : minor ? minorLensLabel(d) : String(d),
    [names, minor, keyName],
  )

  // --- chord selection ---------------------------------------------------
  const selectRoman = useCallback(
    (nextRoman: string, idx: number, pulse = true) => {
      const next = resolveOverlay(keyName, nextRoman, seventh).degrees
      if (pulse) {
        setFreshSet(new Set(freshNotes(prevDegrees.current, next)))
        setPulseId((p) => p + 1)
      } else {
        setFreshSet(null)
      }
      prevDegrees.current = next
      setRoman(nextRoman)
      setProgIdx(idx)
    },
    [keyName, seventh],
  )

  // Pick a diatonic/free chord: mark the matching progression index if any.
  const selectChord = (nextRoman: string) => {
    const idx = progression.chords.findIndex((c) => c.roman === nextRoman)
    selectRoman(nextRoman, idx)
  }

  const stepTo = useCallback(
    (idx: number) => {
      const n = progression.chords.length
      const wrapped = ((idx % n) + n) % n
      selectRoman(progression.chords[wrapped].roman, wrapped)
    },
    [progression, selectRoman],
  )

  // Keep a ref of the current index for the metronome closure.
  const progIdxRef = useRef(progIdx)
  progIdxRef.current = progIdx
  const stepToRef = useRef(stepTo)
  stepToRef.current = stepTo

  // --- metronome (silent, visual) ---------------------------------------
  useEffect(() => {
    if (!playing) return
    const beatMs = 60000 / clamp(bpm, 30, 240)
    let beats = 0
    const id = setInterval(() => {
      beats += 1
      setBeatTick((t) => t + 1)
      if (beats >= clamp(barsPerChord, 1, 8) * BEATS_PER_BAR) {
        beats = 0
        stepToRef.current(progIdxRef.current + 1)
      }
    }, beatMs)
    return () => clearInterval(id)
  }, [playing, bpm, barsPerChord])

  const selectProg = (id: string) => {
    const p = PROGRESSION_BY_ID[id]
    setProgId(id)
    if (p.autoMinor) setMinor(true)
    // load first chord without a pulse
    const first = p.chords[0].roman
    prevDegrees.current = resolveOverlay(keyName, first, seventh).degrees
    setFreshSet(null)
    setRoman(first)
    setProgIdx(0)
  }

  // --- toggles / key -----------------------------------------------------
  const onToggle = (which: 'seventh' | 'guides' | 'minor' | 'names') => {
    setFreshSet(null)
    if (which === 'seventh') setSeventh((v) => !v)
    if (which === 'guides') setGuides((v) => !v)
    if (which === 'minor') setMinor((v) => !v)
    if (which === 'names') setNames((v) => !v)
  }

  const onKey = (k: string) => {
    setFreshSet(null)
    setKeyName(k)
    prevDegrees.current = resolveOverlay(k, roman, seventh).degrees
  }

  // --- keyboard nav ------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      stepTo(progIdx + 1)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      stepTo(progIdx - 1)
      e.preventDefault()
    } else if (e.key === ' ' && showStepper) {
      setPlaying((p) => !p)
      e.preventDefault()
    }
  }

  // --- derived render data ----------------------------------------------
  const zone = { start: zoneStart, end: Math.min(FRETS, zoneStart + ZONE_SPAN) }
  const view = zoom
    ? { start: clamp(zoneStart - 1, 0, FRETS), end: clamp(zoneStart + 5, 0, FRETS) }
    : { start: 0, end: FRETS }

  const activeChord = progIdx >= 0 ? progression.chords[progIdx] : undefined
  const tip = TIPS[roman] ?? ''
  const targetText =
    activeChord?.target && activeChord.roman === roman
      ? ` <span class="f">Target:</span> ${activeChord.target}.`
      : ''
  const freshText =
    freshSet && freshSet.size
      ? ` Fresh vs. previous chord: <span class="f">${[...freshSet].map(degLabel).join(', ')}</span>.`
      : ''
  const guideText = overlay.guides.map((g) => `<span class="g">${degLabel(g)}</span>`).join(' & ')
  const infoHTML =
    `<b>${overlay.name}</b> (${overlay.roman}) → glow <b>${overlay.degrees.map(degLabel).join(' · ')}</b>. ` +
    `Guide tones: ${guideText}.${targetText} ${tip}${freshText}`

  return (
    <section className="dl" tabIndex={0} onKeyDown={onKeyDown} aria-label="Degree Lens interactive fretboard">
      <OverlayControls
        keyName={keyName}
        onKey={onKey}
        seventh={seventh}
        guides={guides}
        minor={minor}
        names={names}
        onToggle={onToggle}
        currentRoman={roman}
        onSelectChord={selectChord}
        zoneStart={zoneStart}
        onZone={setZoneStart}
        zoom={zoom}
        onZoom={setZoom}
        label={(o) => o.degrees.map(degLabel).join(' · ')}
      />

      <div className="dl-boardwrap">
        <Fretboard
          keyName={keyName}
          chord={overlay}
          showGuides={guides}
          showNames={names}
          minorLens={minor}
          freshSet={freshSet ?? undefined}
          pulseId={pulseId}
          zone={zone}
          view={view}
        />
        <div className="dl-legend">
          <span>
            <span className="dl-dot" style={{ background: 'var(--root)' }} />
            chord root
          </span>
          <span>
            <span className="dl-dot" style={{ background: 'var(--tone)' }} />
            chord tone
          </span>
          <span>
            <span
              className="dl-dot"
              style={{ background: 'var(--panel-2)', boxShadow: '0 0 0 2.5px var(--guide)' }}
            />
            guide tone (3rd &amp; 7th)
          </span>
          <span>
            <span className="dl-dot" style={{ background: 'var(--scale-dot)' }} />
            scale tone
          </span>
          {minor && (
            <span>
              <span className="dl-dot" style={{ background: 'var(--minor)' }} />
              minor tonic (deg 6)
            </span>
          )}
        </div>
      </div>

      {showStepper && (
        <ProgressionStepper
          progId={progId}
          onSelectProg={selectProg}
          progression={progression}
          keyName={keyName}
          seventh={seventh}
          activeIdx={progIdx}
          onStep={(i) => stepTo(i)}
          onPrev={() => stepTo(progIdx - 1)}
          onNext={() => stepTo(progIdx + 1)}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          bpm={bpm}
          onBpm={setBpm}
          barsPerChord={barsPerChord}
          onBars={setBarsPerChord}
          beatTick={beatTick}
          label={degLabel}
        />
      )}

      <div className="dl-info" dangerouslySetInnerHTML={{ __html: infoHTML }} />

      {progression.note && (
        <p style={{ color: 'var(--ink-dim)', fontSize: 12, margin: '8px 4px 0', lineHeight: 1.5 }}>
          {progression.note}
        </p>
      )}
    </section>
  )
}
