// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import TriadWindows from './TriadWindows'
import BoxView from './BoxView'

afterEach(cleanup)

describe('<TriadWindows />', () => {
  it('renders nine windows (3 string sets × 3 inversions) for IV in D', () => {
    const { container } = render(<TriadWindows />)
    const caps = [...container.querySelectorAll('.tw-cap')].map((c) => c.textContent)
    expect(caps).toHaveLength(9)
    expect(caps.filter((c) => c === 'root pos')).toHaveLength(3)
    expect(caps.filter((c) => c === '2nd inv')).toHaveLength(3)
  })

  it('the IV trio (4·6·1) is the only degrees shown on the dots', () => {
    const { container } = render(<TriadWindows />)
    const dotLabels = [...container.querySelectorAll('.tw-dotlabel')].map((t) => t.textContent)
    // 9 windows × 3 dots
    expect(dotLabels).toHaveLength(27)
    expect(dotLabels.every((d) => ['4', '6', '1'].includes(d ?? ''))).toBe(true)
  })
})

describe('<BoxView />', () => {
  it('renders the box-locked board with chord chips', () => {
    const { container } = render(<BoxView />)
    expect(container.querySelector('svg')).toBeTruthy()
    // The default vi chord (Bm) chip should be present and active.
    const active = container.querySelector('.dl-chip.active')
    expect(active?.textContent).toContain('Bm')
  })
})
