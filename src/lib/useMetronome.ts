import { useEffect, useRef, useState } from 'react'
import { InternalClock, type ClockSource } from './clock'

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
  /**
   * Beat source. Defaults to an {@link InternalClock} driven by `bpm`. Pass a
   * different source (e.g. a MIDI clock) to follow an external tempo — the hook
   * is source-agnostic; only the boundary math lives here.
   */
  clock?: ClockSource
}

/**
 * A silent, visual metronome. Owns beat/bar timing; the consumer owns the chord
 * index and advances it in onChordAdvance. No audio — the guitar is the sound.
 * Beats come from a {@link ClockSource}, so an external MIDI clock can drive it
 * unchanged.
 */
export function useMetronome({
  playing,
  bpm,
  barsPerChord,
  beatsPerBar = 4,
  countInBars = 0,
  onChordAdvance,
  onBeat,
  clock,
}: MetronomeOpts): MetronomeState {
  const [state, setState] = useState<MetronomeState>(IDLE)
  const advanceRef = useRef(onChordAdvance)
  advanceRef.current = onChordAdvance
  const beatRef = useRef(onBeat)
  beatRef.current = onBeat

  // One clock instance for the lifetime of the hook (provided, or internal).
  const clockRef = useRef<ClockSource | null>(null)
  if (clockRef.current === null) clockRef.current = clock ?? new InternalClock(bpm)

  // Keep an internal clock's tempo in sync with the prop (no-op for sources
  // that derive their own tempo, e.g. MIDI).
  useEffect(() => {
    clockRef.current?.setBpm?.(bpm)
  }, [bpm])

  useEffect(() => {
    if (!playing) {
      setState(IDLE)
      return
    }
    const src = clockRef.current!
    const bpb = Math.max(1, beatsPerBar)
    const perChord = Math.max(1, barsPerChord) * bpb
    const countIn = Math.max(0, countInBars) * bpb
    let n = 0 // beats elapsed since play started

    const onBeatTick = () => {
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

    const unsubscribe = src.onBeat(onBeatTick)
    src.start()
    return () => {
      src.stop()
      unsubscribe()
    }
  }, [playing, barsPerChord, beatsPerBar, countInBars])

  return state
}
