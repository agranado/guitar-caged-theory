import { describe, it, expect } from 'vitest'
import { encodeChords, decodeChords, parseShareParams, buildShareUrl } from './share'

describe('share encode/decode', () => {
  it('round-trips a progression as a dot-joined roman list', () => {
    const chords = [{ roman: 'Isus2' }, { roman: 'vi7' }, { roman: 'IV' }, { roman: 'V' }]
    expect(encodeChords(chords)).toBe('Isus2.vi7.IV.V')
    expect(decodeChords('Isus2.vi7.IV.V')).toEqual(chords)
  })
  it('drops tokens outside the known vocabulary', () => {
    expect(decodeChords('IV.XYZ.V.drop table')).toEqual([{ roman: 'IV' }, { roman: 'V' }])
  })
})

describe('parseShareParams', () => {
  it('parses p/k/lens', () => {
    expect(parseShareParams('?p=IV.V&k=D&lens=min')).toEqual({
      chords: [{ roman: 'IV' }, { roman: 'V' }],
      key: 'D',
      lens: 'min',
    })
  })
  it('defaults key to D and lens to maj', () => {
    expect(parseShareParams('?p=I.IV.V')).toEqual({
      chords: [{ roman: 'I' }, { roman: 'IV' }, { roman: 'V' }],
      key: 'D',
      lens: 'maj',
    })
  })
  it('returns null without a progression param', () => {
    expect(parseShareParams('')).toBeNull()
    expect(parseShareParams('?k=D')).toBeNull()
    expect(parseShareParams('?p=nonsense')).toBeNull()
  })
})

describe('buildShareUrl', () => {
  it('builds an absolute link that reopens Practice', () => {
    const url = buildShareUrl(
      { chords: [{ roman: 'IV' }, { roman: 'V' }], key: 'D', lens: 'maj' },
      'https://example.com',
      '/app/',
    )
    expect(url).toBe('https://example.com/app/?p=IV.V&k=D&lens=maj#practice')
  })
})
