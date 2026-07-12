// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import PracticeSession from './PracticeSession'

afterEach(cleanup)

describe('<PracticeSession />', () => {
  it('shows the current chord big and the next chord as preview (home default)', () => {
    const { container } = render(<PracticeSession />)
    expect(container.querySelector('.pr-nowname')?.textContent).toBe('Dsus2')
    expect(container.querySelector('.pr-nextname')?.textContent).toBe('Bm7')
  })

  it('stepping advances the now-playing chord', () => {
    const { container } = render(<PracticeSession />)
    fireEvent.click(screen.getByRole('button', { name: 'Next chord' }))
    // Dsus2 -> Bm7
    expect(container.querySelector('.pr-nowname')?.textContent).toBe('Bm7')
  })

  it('custom builder adds and removes chords', () => {
    const { container } = render(<PracticeSession />)
    fireEvent.change(container.querySelector('#pr-src')!, { target: { value: 'custom' } })
    // default custom is vi–IV–V → now shows Bm (vi in D)
    expect(container.querySelector('.pr-nowname')?.textContent).toBe('Bm')
    const builder = container.querySelector('.pr-builder') as HTMLElement
    const before = builder.querySelectorAll('.pr-remove').length
    // add a chord from the palette (the "Add chord" row's I button)
    const addRow = builder.querySelector('.pr-builderrow') as HTMLElement
    const iButton = within(addRow)
      .getAllByRole('button')
      .find((b) => b.querySelector('small')?.textContent === 'I')!
    fireEvent.click(iButton)
    const after = builder.querySelectorAll('.pr-remove').length
    expect(after).toBe(before + 1)
  })
})
