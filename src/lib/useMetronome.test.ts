// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMetronome } from './useMetronome'
import type { ClockSource } from './clock'

/** A hand-cranked clock — beats fire only when the test calls tick(). */
class FakeClockSource implements ClockSource {
  bpm = 100
  private cb: (() => void) | null = null
  private running = false
  onBeat(cb: () => void) {
    this.cb = cb
    return () => {
      this.cb = null
    }
  }
  start() {
    this.running = true
  }
  stop() {
    this.running = false
  }
  tick() {
    if (this.running && this.cb) this.cb()
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useMetronome', () => {
  // BPM is clamped to a max of 300 → 200ms per beat.
  it('advances one chord after barsPerChord × beatsPerBar beats', () => {
    vi.useFakeTimers()
    const onChordAdvance = vi.fn()
    renderHook(() =>
      useMetronome({
        playing: true,
        bpm: 300, // 200ms per beat
        barsPerChord: 1,
        beatsPerBar: 4,
        countInBars: 0,
        onChordAdvance,
      }),
    )
    // 4 beats (800ms) → one chord boundary
    act(() => {
      vi.advanceTimersByTime(850)
    })
    expect(onChordAdvance).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(onChordAdvance).toHaveBeenCalledTimes(2)
  })

  it('holds for the count-in before the first advance', () => {
    vi.useFakeTimers()
    const onChordAdvance = vi.fn()
    const { result } = renderHook(() =>
      useMetronome({
        playing: true,
        bpm: 300, // 200ms/beat
        barsPerChord: 1,
        beatsPerBar: 4,
        countInBars: 1, // one bar of count-in = 4 beats = 800ms
        onChordAdvance,
      }),
    )
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.phase).toBe('countin')
    // through the count-in bar, no chord advance yet
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(onChordAdvance).not.toHaveBeenCalled()
    // after count-in + one chord's worth of beats, it advances
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(onChordAdvance).toHaveBeenCalledTimes(1)
  })

  it('is idle when not playing', () => {
    const { result } = renderHook(() =>
      useMetronome({ playing: false, bpm: 90, barsPerChord: 2, onChordAdvance: () => {} }),
    )
    expect(result.current.phase).toBe('idle')
  })

  it('is source-agnostic: a hand-cranked ClockSource drives it with no timers', () => {
    const fake = new FakeClockSource()
    const onChordAdvance = vi.fn()
    renderHook(() =>
      useMetronome({
        playing: true,
        bpm: 100,
        barsPerChord: 1,
        beatsPerBar: 2, // perChord = 2 beats
        countInBars: 0,
        onChordAdvance,
        clock: fake,
      }),
    )
    // beat 0 (m=0, no advance), beat 1 (m=1), beat 2 (m=2 → boundary → advance)
    act(() => {
      fake.tick()
      fake.tick()
      fake.tick()
    })
    expect(onChordAdvance).toHaveBeenCalledTimes(1)
  })
})
