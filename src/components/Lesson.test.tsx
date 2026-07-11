// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Checklist } from './Lesson'
import App from '../App'

afterEach(cleanup)
beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ''
})

describe('<Checklist />', () => {
  it('persists checkbox state to localStorage', () => {
    const { unmount } = render(
      <Checklist id="tst" items={['drill a', 'drill b']} doneWhen="you can do it" />,
    )
    const boxes = screen.getAllByRole('checkbox')
    expect(screen.getByText('0/2')).toBeTruthy()
    fireEvent.click(boxes[0])
    expect(screen.getByText('1/2')).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem('dl-check-tst')!)).toEqual([true, false])

    // Remount: state restored from storage.
    unmount()
    render(<Checklist id="tst" items={['drill a', 'drill b']} doneWhen="you can do it" />)
    expect(screen.getByText('1/2')).toBeTruthy()
  })
})

describe('<App /> navigation', () => {
  it('renders all nine nav entries and the overview by default', () => {
    render(<App />)
    // 9 modules (overview + 8)
    expect(screen.getAllByRole('button').filter((b) => b.className.includes('app-navitem'))).toHaveLength(9)
    expect(screen.getByText('Framework')).toBeTruthy()
    // overview overlays table has the IV roman
    expect(screen.getByRole('heading', { name: 'The Degree Lens' })).toBeTruthy()
  })

  it('navigates to a module and updates the hash', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Triads on string sets/ }))
    expect(window.location.hash).toBe('#m5')
    expect(screen.getByRole('heading', { name: 'Triads on string sets' })).toBeTruthy()
  })
})
