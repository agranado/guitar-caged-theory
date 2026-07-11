import { DIATONIC_ROMANS, NOTES, resolveOverlay } from '../lib/theory'
import type { Overlay } from '../lib/theory'

export interface OverlayControlsProps {
  keyName: string
  onKey: (k: string) => void
  seventh: boolean
  guides: boolean
  minor: boolean
  names: boolean
  onToggle: (which: 'seventh' | 'guides' | 'minor' | 'names') => void
  currentRoman: string
  onSelectChord: (roman: string) => void
  /** Position band controls. */
  zoneStart: number
  onZone: (start: number) => void
  zoom: boolean
  onZoom: (v: boolean) => void
  label: (o: Overlay) => React.ReactNode
}

export default function OverlayControls(props: OverlayControlsProps) {
  const {
    keyName,
    onKey,
    seventh,
    guides,
    minor,
    names,
    onToggle,
    currentRoman,
    onSelectChord,
    zoneStart,
    onZone,
    zoom,
    onZoom,
    label,
  } = props

  return (
    <>
      <div className="dl-bar">
        <label htmlFor="dl-key">Key</label>
        <select id="dl-key" value={keyName} onChange={(e) => onKey(e.target.value)}>
          {NOTES.map((n) => (
            <option key={n} value={n}>
              {n} major
            </option>
          ))}
        </select>

        <button className="dl-tog" aria-pressed={names} onClick={() => onToggle('names')}>
          note names
        </button>
        <button className="dl-tog" aria-pressed={seventh} onClick={() => onToggle('seventh')}>
          add 7ths
        </button>
        <button className="dl-tog guide" aria-pressed={guides} onClick={() => onToggle('guides')}>
          guide tones
        </button>
        <button className="dl-tog minor" aria-pressed={minor} onClick={() => onToggle('minor')}>
          minor lens
        </button>

        <span className="dl-spacer" />

        <label htmlFor="dl-pos">Position</label>
        <input
          id="dl-pos"
          type="range"
          min={0}
          max={12}
          value={zoneStart}
          onChange={(e) => onZone(Number(e.target.value))}
          aria-label="Fretboard position (CAGED zone start fret)"
          style={{ width: 120 }}
        />
        <button className="dl-tog" aria-pressed={zoom} onClick={() => onZoom(!zoom)}>
          zoom to zone
        </button>
      </div>

      <div className="dl-chips" role="group" aria-label="Diatonic chords">
        <span className="dl-tag">All chords</span>
        {DIATONIC_ROMANS.map((roman) => {
          const overlay = resolveOverlay(keyName, roman, seventh)
          return (
            <button
              key={roman}
              className={'dl-chip' + (currentRoman === roman ? ' active' : '')}
              aria-pressed={currentRoman === roman}
              onClick={() => onSelectChord(roman)}
            >
              {overlay.name}
              <small>
                {roman} · {label(overlay)}
              </small>
            </button>
          )
        })}
      </div>
    </>
  )
}
