// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import PracticeSession from './PracticeSession'

afterEach(cleanup)
beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
})

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

  it('hydrates a custom progression from a share URL', () => {
    window.history.replaceState({}, '', '/?p=IV.V&k=D&lens=maj#practice')
    const { container } = render(<PracticeSession />)
    // p=IV.V → starts on G (IV in D), custom source
    expect(container.querySelector('.pr-nowname')?.textContent).toBe('G')
    expect((container.querySelector('#pr-src') as HTMLSelectElement).value).toBe('custom')
  })

  it('persists the custom progression to storage', () => {
    const { container } = render(<PracticeSession />)
    fireEvent.change(container.querySelector('#pr-src')!, { target: { value: 'custom' } })
    const builder = container.querySelector('.pr-builder') as HTMLElement
    const addRow = builder.querySelector('.pr-builderrow') as HTMLElement
    const iButton = within(addRow)
      .getAllByRole('button')
      .find((b) => b.querySelector('small')?.textContent === 'I')!
    fireEvent.click(iButton)
    const saved = JSON.parse(window.localStorage.getItem('dl:customProg')!)
    expect(saved).toEqual([{ roman: 'vi' }, { roman: 'IV' }, { roman: 'V' }, { roman: 'I' }])
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
