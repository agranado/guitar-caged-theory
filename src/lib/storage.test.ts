// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { getItem, setItem, removeItem, getJSON, setJSON } from './storage'

beforeEach(() => window.localStorage.clear())

describe('storage helper', () => {
  it('round-trips strings', () => {
    setItem('k', 'v')
    expect(getItem('k')).toBe('v')
    removeItem('k')
    expect(getItem('k')).toBeNull()
  })

  it('round-trips JSON and falls back on absence/malformed', () => {
    setJSON('obj', { a: 1, b: [2, 3] })
    expect(getJSON('obj', null)).toEqual({ a: 1, b: [2, 3] })
    expect(getJSON('missing', 'fallback')).toBe('fallback')
    window.localStorage.setItem('bad', '{not json')
    expect(getJSON('bad', 42)).toBe(42)
  })
})
