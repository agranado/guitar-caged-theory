// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMetronome } from './useMetronome'

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
})
