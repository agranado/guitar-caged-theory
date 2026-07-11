import { useCallback, useMemo, useRef, useState } from 'react'
import Fretboard from './Fretboard'
import OverlayControls from './OverlayControls'
import {
  FRETS,
  freshNotes,
  minorLensLabel,
  noteNameOfDegree,
  resolveOverlay,
} from '../lib/theory'
import type { Degree, Overlay } from '../lib/theory'
import { TIPS } from '../lib/tips'
import './degree-lens.css'

const ZONE_SPAN = 3 // a 4-fret CAGED position (start .. start+3)
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface DegreeLensProps {
  initialKey?: string
  initialRoman?: string
  /** Start fret of the highlighted CAGED zone (E-shape in D = 7). */
  initialZoneStart?: number
  initialSeventh?: boolean
  initialMinor?: boolean
}

export default function DegreeLens({
  initialKey = 'D',
  initialRoman = 'I',
  initialZoneStart = 7,
  initialSeventh = false,
  initialMinor = false,
}: DegreeLensProps) {
  const [keyName, setKeyName] = useState(initialKey)
  const [roman, setRoman] = useState(initialRoman)
  const [seventh, setSeventh] = useState(initialSeventh)
  const [guides, setGuides] = useState(false)
  const [minor, setMinor] = useState(initialMinor)
  const [names, setNames] = useState(false)
  const [zoneStart, setZoneStart] = useState(initialZoneStart)
  const [zoom, setZoom] = useState(false)

  const [freshSet, setFreshSet] = useState<Set<Degree> | null>(null)
  const [pulseId, setPulseId] = useState(0)
  const prevDegrees = useRef<Degree[]>(resolveOverlay(initialKey, initialRoman, initialSeventh).degrees)

  const overlay: Overlay = useMemo(
    () => resolveOverlay(keyName, roman, seventh),
    [keyName, roman, seventh],
  )

  const label = useCallback(
    (o: Overlay) => o.degrees.map((d) => degLabel(d)).join(' · '),
    // degLabel captured below; recompute when lens changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minor, names, keyName],
  )

  function degLabel(d: Degree): string {
    return names ? noteNameOfDegree(keyName, d) : minor ? minorLensLabel(d) : String(d)
  }

  const selectChord = useCallback(
    (nextRoman: string) => {
      const next = resolveOverlay(keyName, nextRoman, seventh).degrees
      setFreshSet(new Set(freshNotes(prevDegrees.current, next)))
      setPulseId((p) => p + 1)
      prevDegrees.current = next
      setRoman(nextRoman)
    },
    [keyName, seventh],
  )

  const clearFresh = () => setFreshSet(null)

  const onToggle = (which: 'seventh' | 'guides' | 'minor' | 'names') => {
    clearFresh()
    if (which === 'seventh') setSeventh((v) => !v)
    if (which === 'guides') setGuides((v) => !v)
    if (which === 'minor') setMinor((v) => !v)
    if (which === 'names') setNames((v) => !v)
  }

  const onKey = (k: string) => {
    clearFresh()
    setKeyName(k)
    prevDegrees.current = resolveOverlay(k, roman, seventh).degrees
  }

  const zone = { start: zoneStart, end: Math.min(FRETS, zoneStart + ZONE_SPAN) }
  const view = zoom
    ? { start: clamp(zoneStart - 1, 0, FRETS), end: clamp(zoneStart + 5, 0, FRETS) }
    : { start: 0, end: FRETS }

  const tip = TIPS[roman] ?? ''
  const freshText =
    freshSet && freshSet.size
      ? ` Fresh vs. previous chord: <span class="f">${[...freshSet].map(degLabel).join(', ')}</span>.`
      : ''
  const guideText = overlay.guides.map((g) => `<span class="g">${degLabel(g)}</span>`).join(' & ')
  const infoHTML =
    `<b>${overlay.name}</b> (${overlay.roman}) → glow <b>${overlay.degrees.map(degLabel).join(' · ')}</b>. ` +
    `Guide tones: ${guideText}. ${tip}${freshText}`

  return (
    <section className="dl">
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
        label={label}
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

      <div className="dl-info" dangerouslySetInnerHTML={{ __html: infoHTML }} />
    </section>
  )
}
