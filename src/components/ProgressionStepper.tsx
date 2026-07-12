import { PROGRESSIONS, type Progression } from '../lib/progressions'
import { resolveOverlay } from '../lib/theory'
import type { Degree } from '../lib/theory'

export interface ProgressionStepperProps {
  progId: string
  onSelectProg: (id: string) => void
  progression: Progression
  keyName: string
  seventh: boolean
  activeIdx: number
  onStep: (idx: number) => void
  onPrev: () => void
  onNext: () => void
  playing: boolean
  onTogglePlay: () => void
  bpm: number
  onBpm: (n: number) => void
  barsPerChord: number
  onBars: (n: number) => void
  /** Increments each metronome beat, to retrigger the active-chip pulse. */
  beatTick: number
  label: (d: Degree) => string
}

export default function ProgressionStepper(props: ProgressionStepperProps) {
  const {
    progId,
    onSelectProg,
    progression,
    keyName,
    seventh,
    activeIdx,
    onStep,
    onPrev,
    onNext,
    playing,
    onTogglePlay,
    bpm,
    onBpm,
    barsPerChord,
    onBars,
    beatTick,
    label,
  } = props

  return (
    <div className="dl-stepper">
      <div className="dl-bar">
        <label htmlFor="dl-prog">Progression</label>
        <select id="dl-prog" value={progId} onChange={(e) => onSelectProg(e.target.value)}>
          {PROGRESSIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <span className="dl-spacer" />

        <span
          className={'dl-beatlamp' + (playing && beatTick % 2 === 0 ? ' on' : '')}
          aria-hidden="true"
          title="Silent visual metronome"
        />
        <button
          className="dl-tog"
          aria-pressed={playing}
          onClick={onTogglePlay}
          title="Silent visual metronome — no audio"
        >
          {playing ? '❚❚ pause' : '▶ play'}
        </button>
        <label htmlFor="dl-bpm">BPM</label>
        <input
          id="dl-bpm"
          type="number"
          min={30}
          max={240}
          value={bpm}
          onChange={(e) => onBpm(Number(e.target.value))}
          style={{ width: 62 }}
        />
        <label htmlFor="dl-bars">bars/chord</label>
        <input
          id="dl-bars"
          type="number"
          min={1}
          max={8}
          value={barsPerChord}
          onChange={(e) => onBars(Number(e.target.value))}
          style={{ width: 52 }}
        />
      </div>

      <div className="dl-chips" role="group" aria-label={`Progression: ${progression.name}`}>
        <button className="dl-stepbtn" onClick={onPrev} aria-label="Previous chord">
          ←
        </button>
        {progression.chords.map((c, i) => {
          const overlay = resolveOverlay(keyName, c.roman, seventh)
          const active = i === activeIdx
          return (
            <button
              key={`${c.roman}-${i}`}
              className={'dl-chip dl-progchip' + (active ? ' active' : '')}
              aria-pressed={active}
              onClick={() => onStep(i)}
            >
              {c.minorLabel && <span className="dl-minorlabel">{c.minorLabel}</span>}
              {overlay.name}
              <small>
                {c.roman} · {overlay.degrees.map(label).join('·')}
              </small>
            </button>
          )
        })}
        <button className="dl-stepbtn" onClick={onNext} aria-label="Next chord">
          →
        </button>
      </div>
    </div>
  )
}
