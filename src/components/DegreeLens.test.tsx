// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DegreeLens from './DegreeLens'

afterEach(cleanup)

describe('<DegreeLens />', () => {
  it('mounts with a given overlay in D and renders the board', () => {
    const { container } = render(<DegreeLens initialRoman="I" initialProgId="I-V-vi-IV" />)
    // Info line reflects the resolved overlay.
    expect(container.querySelector('.dl-info')?.textContent).toContain('D (I) → glow 1 · 3 · 5')
    // The SVG board actually rendered dots (degree labels as <text>).
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    const labels = [...svg!.querySelectorAll('text')].map((t) => t.textContent)
    expect(labels).toContain('1') // the tonic dot is on the board
  })

  it('defaults to the home progression starting on Dsus2', () => {
    const { container } = render(<DegreeLens />)
    expect(container.querySelector('.dl-info')?.textContent).toContain('Dsus2 (Isus2) → glow 1 · 2 · 5')
  })

  it('switching to IV updates the glow and announces the fresh notes', () => {
    const { container } = render(<DegreeLens showStepper={false} />)
    // The "All chords" IV chip.
    fireEvent.click(screen.getByRole('button', { name: /IV/ }))
    const info = container.querySelector('.dl-info')?.textContent ?? ''
    expect(info).toContain('G (IV) → glow 4 · 6 · 1')
    // I(1·3·5) -> IV(4·6·1): fresh notes are 4 and 6.
    expect(info).toContain('Fresh vs. previous chord: 4, 6')
  })

  it('stepping the progression advances the chord and pulses the fresh note', () => {
    const { container } = render(<DegreeLens />)
    // Home prog: Dsus2 -> Bm7. Advance one chord.
    fireEvent.click(screen.getByRole('button', { name: 'Next chord' }))
    const info = container.querySelector('.dl-info')?.textContent ?? ''
    expect(info).toContain('Bm7 (vi7) → glow 6 · 1 · 3 · 5')
    // Isus2(1·2·5) -> vi7(6·1·3·5): fresh notes are 6 and 3.
    expect(info).toContain('Fresh vs. previous chord: 6, 3')
  })

  it('arrow keys step the progression', () => {
    const { container } = render(<DegreeLens />)
    const widget = container.querySelector('.dl') as HTMLElement
    fireEvent.keyDown(widget, { key: 'ArrowRight' })
    fireEvent.keyDown(widget, { key: 'ArrowRight' })
    // Dsus2 -> Bm7 -> G
    expect(container.querySelector('.dl-info')?.textContent).toContain('G (IV) → glow 4 · 6 · 1')
  })

  it('function colour mode paints the 3rd cyan, root gold, and the 5th furniture', () => {
    const { container } = render(
      <DegreeLens initialRoman="IV" showStepper={false} initialColorMode="function" />,
    )
    const fillOf = (cls: string) =>
      (container.querySelector(`circle.${cls}`) as SVGCircleElement | null)?.getAttribute('fill')
    expect(fillOf('dl-role-3rd')).toBe('var(--guide)')
    expect(fillOf('dl-role-root')).toBe('var(--root)')
    expect(fillOf('dl-role-5th')).toBe('var(--furniture)')
  })

  it('people colour mode makes root furniture and guides bright', () => {
    const { container } = render(
      <DegreeLens initialRoman="IV" showStepper={false} initialColorMode="people" />,
    )
    const fillOf = (cls: string) =>
      (container.querySelector(`circle.${cls}`) as SVGCircleElement | null)?.getAttribute('fill')
    expect(fillOf('dl-role-root')).toBe('var(--furniture)')
    expect(fillOf('dl-role-3rd')).toBe('var(--guide)')
  })

  it('the colour toggle switches modes', () => {
    const { container } = render(<DegreeLens initialRoman="IV" showStepper={false} />)
    // default 'current': 3rd has no special fill (it's a plain tone)
    expect((container.querySelector('circle.dl-role-3rd') as SVGCircleElement).getAttribute('fill')).toBe(
      'var(--tone)',
    )
    fireEvent.click(screen.getByRole('button', { name: 'function' }))
    expect((container.querySelector('circle.dl-role-3rd') as SVGCircleElement).getAttribute('fill')).toBe(
      'var(--guide)',
    )
  })

  it('the minor lens relabels degrees without moving the map (6 -> 1)', () => {
    const { container } = render(<DegreeLens showStepper={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'minor lens' }))
    // Under the minor lens, the vi chip (Bm in D) should read its tonic as "1".
    fireEvent.click(screen.getByRole('button', { name: /Bm/ }))
    const info = container.querySelector('.dl-info')?.textContent ?? ''
    // vi = 6·1·3 -> minor-lens labels 1 · ♭3 · 5
    expect(info).toContain('glow 1 · ♭3 · 5')
  })
})
