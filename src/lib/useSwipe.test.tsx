// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { useSwipe } from './useSwipe'

afterEach(cleanup)

function Swipeable({ left, right }: { left: () => void; right: () => void }) {
  const handlers = useSwipe(left, right)
  return <div data-testid="pad" {...handlers} style={{ width: 300, height: 100 }} />
}

const touch = (x: number, y = 0) => [{ clientX: x, clientY: y }]

describe('useSwipe', () => {
  it('fires left on a leftward drag and right on a rightward drag', () => {
    const left = vi.fn()
    const right = vi.fn()
    const { getByTestId } = render(<Swipeable left={left} right={right} />)
    const pad = getByTestId('pad')

    fireEvent.touchStart(pad, { touches: touch(200) })
    fireEvent.touchEnd(pad, { changedTouches: touch(100) })
    expect(left).toHaveBeenCalledTimes(1)
    expect(right).not.toHaveBeenCalled()

    fireEvent.touchStart(pad, { touches: touch(100) })
    fireEvent.touchEnd(pad, { changedTouches: touch(220) })
    expect(right).toHaveBeenCalledTimes(1)
  })

  it('ignores small drags and mostly-vertical drags', () => {
    const left = vi.fn()
    const right = vi.fn()
    const { getByTestId } = render(<Swipeable left={left} right={right} />)
    const pad = getByTestId('pad')

    // too small
    fireEvent.touchStart(pad, { touches: touch(200) })
    fireEvent.touchEnd(pad, { changedTouches: touch(180) })
    // mostly vertical
    fireEvent.touchStart(pad, { touches: touch(200, 0) })
    fireEvent.touchEnd(pad, { changedTouches: touch(160, 200) })

    expect(left).not.toHaveBeenCalled()
    expect(right).not.toHaveBeenCalled()
  })
})
