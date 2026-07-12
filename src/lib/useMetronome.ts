import { useEffect, useRef, useState } from 'react'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface MetronomeState {
  phase: 'idle' | 'countin' | 'play'
  beatInBar: number // 0..beatsPerBar-1
  barInChord: number // 0..barsPerChord-1
  beatsUntilChange: number // beats remaining on the current chord
  countInRemaining: number // beats of count-in left (0 when playing)
}

const IDLE: MetronomeState = {
  phase: 'idle',
  beatInBar: 0,
  barInChord: 0,
  beatsUntilChange: 0,
  countInRemaining: 0,
}

export interface MetronomeOpts {
  playing: boolean
  bpm: number
  barsPerChord: number
  beatsPerBar?: number
  countInBars?: number
  /** Called once each time a chord boundary passes (consumer advances index). */
  onChordAdvance?: () => void
  /** Called on every beat (for a visual/haptic tick). */
  onBeat?: (beatInBar: number, phase: MetronomeState['phase']) => void
}

/**
 * A silent, visual metronome. Owns beat/bar timing; the consumer owns the chord
 * index and advances it in onChordAdvance. No audio — the guitar is the sound.
 */
export function useMetronome({
  playing,
  bpm,
  barsPerChord,
  beatsPerBar = 4,
  countInBars = 0,
  onChordAdvance,
  onBeat,
}: MetronomeOpts): MetronomeState {
  const [state, setState] = useState<MetronomeState>(IDLE)
  const advanceRef = useRef(onChordAdvance)
  advanceRef.current = onChordAdvance
  const beatRef = useRef(onBeat)
  beatRef.current = onBeat

  useEffect(() => {
    if (!playing) {
      setState(IDLE)
      return
    }
    const bpb = Math.max(1, beatsPerBar)
    const perChord = Math.max(1, barsPerChord) * bpb
    const countIn = Math.max(0, countInBars) * bpb
    let n = 0 // beats elapsed since play started

    const tick = () => {
      if (n < countIn) {
        setState({
          phase: 'countin',
          beatInBar: n % bpb,
          barInChord: 0,
          beatsUntilChange: perChord,
          countInRemaining: countIn - n,
        })
        beatRef.current?.(n % bpb, 'countin')
      } else {
        const m = n - countIn
        const inChord = m % perChord
        if (m > 0 && inChord === 0) advanceRef.current?.()
        setState({
          phase: 'play',
          beatInBar: m % bpb,
          barInChord: Math.floor(inChord / bpb),
          beatsUntilChange: perChord - inChord,
          countInRemaining: 0,
        })
        beatRef.current?.(m % bpb, 'play')
      }
      n += 1
    }

    tick() // fire the first beat immediately
    const id = setInterval(tick, 60000 / clamp(bpm, 30, 300))
    return () => clearInterval(id)
  }, [playing, bpm, barsPerChord, beatsPerBar, countInBars])

  return state
}
