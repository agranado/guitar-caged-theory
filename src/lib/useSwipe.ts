import { useRef } from 'react'

/**
 * Horizontal swipe detection for touch devices. Returns touch handlers to spread
 * onto an element. A mostly-horizontal drag past `threshold` px fires the
 * matching callback. Keyboard/mouse users are unaffected (touch events only).
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 40,
) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current
      start.current = null
      if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) onSwipeLeft()
        else onSwipeRight()
      }
    },
  }
}
