/**
 * A beat source for the metronome. The hook owns bar/chord-boundary math; a
 * ClockSource owns only the raw beat stream. This is the seam where a
 * `MidiClockSource` (external MIDI clock, M10) plugs in later without touching
 * Practice or the hook's consumers.
 */
export interface ClockSource {
  /** Current tempo in BPM (readable). */
  readonly bpm: number
  /** Begin emitting beats. */
  start(): void
  /** Stop emitting beats. */
  stop(): void
  /** Subscribe to beat events; returns an unsubscribe function. */
  onBeat(cb: () => void): () => void
  /** Set tempo, on sources that support it (internal does; MIDI won't). */
  setBpm?(bpm: number): void
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** The default self-driven clock: a `setInterval` at the given BPM (30–300). */
export class InternalClock implements ClockSource {
  private _bpm: number
  private listeners = new Set<() => void>()
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(bpm: number) {
    this._bpm = clamp(bpm, 30, 300)
  }

  get bpm(): number {
    return this._bpm
  }

  onBeat(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private emit(): void {
    for (const cb of this.listeners) cb()
  }

  private period(): number {
    return 60000 / this._bpm
  }

  start(): void {
    this.stop()
    this.emit() // first beat lands immediately
    this.timer = setInterval(() => this.emit(), this.period())
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Change tempo without resetting position; no extra beat is emitted. */
  setBpm(bpm: number): void {
    this._bpm = clamp(bpm, 30, 300)
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = setInterval(() => this.emit(), this.period())
    }
  }
}
