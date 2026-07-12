import type { ColorMode } from './Fretboard'

const MODES: { id: ColorMode; label: string }[] = [
  { id: 'current', label: 'current' },
  { id: 'function', label: 'function' },
  { id: 'people', label: 'people' },
]

export default function ColorModeToggle({
  mode,
  onChange,
}: {
  mode: ColorMode
  onChange: (m: ColorMode) => void
}) {
  return (
    <div className="dl-seg" role="group" aria-label="Dot colour mode">
      <span className="dl-seglabel">colour</span>
      {MODES.map((m) => (
        <button
          key={m.id}
          className={'dl-segbtn' + (mode === m.id ? ' active' : '')}
          aria-pressed={mode === m.id}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

function Dot({ color, ring }: { color: string; ring?: string }) {
  return (
    <span
      className="dl-dot"
      style={{
        background: `var(${color})`,
        boxShadow: ring ? `0 0 0 2px var(${ring})` : undefined,
      }}
    />
  )
}

/** Legend that explains whatever colour mode is active. */
export function LegendForMode({ mode, minor }: { mode: ColorMode; minor: boolean }) {
  if (mode === 'function') {
    return (
      <div className="dl-legend">
        <span>
          <Dot color="--root" />
          root
        </span>
        <span>
          <Dot color="--guide" />
          3rd — quality
        </span>
        <span>
          <Dot color="--tension" />
          7th — tension
        </span>
        <span>
          <Dot color="--furniture" />
          5th — furniture
        </span>
        <span>
          <Dot color="--tone" ring="--fresh" />
          character note
        </span>
      </div>
    )
  }
  if (mode === 'people') {
    return (
      <div className="dl-legend">
        <span>
          <Dot color="--guide" />
          3rd &amp; 7th — the “people” (the harmony)
        </span>
        <span>
          <Dot color="--furniture" />
          root &amp; 5th — furniture
        </span>
        <span>
          <Dot color="--scale-dot" />
          scale tone
        </span>
      </div>
    )
  }
  // current
  return (
    <div className="dl-legend">
      <span>
        <Dot color="--root" />
        chord root
      </span>
      <span>
        <Dot color="--tone" />
        chord tone
      </span>
      <span>
        <Dot color="--panel-2" ring="--guide" />
        guide tone (3rd &amp; 7th)
      </span>
      <span>
        <Dot color="--scale-dot" />
        scale tone
      </span>
      {minor && (
        <span>
          <Dot color="--minor" />
          minor tonic (deg 6)
        </span>
      )}
    </div>
  )
}
