import { describe, it, expect } from 'vitest'
import {
  pcOf,
  majorScalePcs,
  degreeAt,
  chordDegrees,
  guideTones,
  minorLensLabel,
  freshNotes,
  triadWindows,
  noteNameOfDegree,
  chordName,
  resolveOverlay,
  SPECIALS,
} from './theory'
import type { Degree } from './theory'

describe('pcOf / majorScalePcs', () => {
  it('pcOf maps note names to pitch classes', () => {
    expect(pcOf('C')).toBe(0)
    expect(pcOf('D')).toBe(2)
    expect(pcOf('F#')).toBe(6)
    expect(pcOf('F♯')).toBe(6)
    expect(pcOf('B')).toBe(11)
  })

  it('majorScalePcs("D") == [2,4,6,7,9,11,1]', () => {
    expect(majorScalePcs('D')).toEqual([2, 4, 6, 7, 9, 11, 1])
  })
})

describe('degreeAt (standard tuning, string 1 = high e)', () => {
  it('in key D: high-e fret 10 == degree 1 (D)', () => {
    expect(degreeAt('D', 1, 10)).toBe(1)
  })
  it('in key D: high-e fret 9 == degree 7 (C♯)', () => {
    expect(degreeAt('D', 1, 9)).toBe(7)
  })
  it('in key D: high-e fret 8 == null (C natural, not in scale)', () => {
    expect(degreeAt('D', 1, 8)).toBe(null)
  })
  it('open low-E (string 6) in D is degree 2 (E)', () => {
    expect(degreeAt('D', 6, 0)).toBe(2)
  })
})

describe('chordDegrees', () => {
  it('IV -> [4,6,1]', () => {
    expect(chordDegrees('IV')).toEqual([4, 6, 1])
  })
  it('V7 -> [5,7,2,4]', () => {
    expect(chordDegrees('V7')).toEqual([5, 7, 2, 4])
  })
  it('vii° -> [7,2,4]', () => {
    expect(chordDegrees('vii°')).toEqual([7, 2, 4])
  })
  it('vi7 -> [6,1,3,5]', () => {
    expect(chordDegrees('vi7')).toEqual([6, 1, 3, 5])
  })
  it('I -> [1,3,5]', () => {
    expect(chordDegrees('I')).toEqual([1, 3, 5])
  })
  it('Isus2 (special) -> [1,2,5]', () => {
    expect(chordDegrees('Isus2')).toEqual([1, 2, 5])
  })
})

describe('guideTones', () => {
  it('ii -> [4,1]', () => {
    expect(guideTones('ii')).toEqual([4, 1])
  })
  it('IV -> [6,3]', () => {
    expect(guideTones('IV')).toEqual([6, 3])
  })
  it('V -> [7,4]', () => {
    expect(guideTones('V')).toEqual([7, 4])
  })
  it('Isus2 -> [2] (no 3rd/7th; the sus note is the tension)', () => {
    expect(guideTones('Isus2')).toEqual([2])
  })
})

describe('minorLensLabel', () => {
  it('6 -> "1" (minor tonic)', () => {
    expect(minorLensLabel(6)).toBe('1')
  })
  it('1 -> "♭3"', () => {
    expect(minorLensLabel(1)).toBe('♭3')
  })
  it('4 -> "♭6"', () => {
    expect(minorLensLabel(4)).toBe('♭6')
  })
  it('full dictionary', () => {
    const all: Degree[] = [1, 2, 3, 4, 5, 6, 7]
    expect(all.map(minorLensLabel)).toEqual([
      '♭3', '4', '5', '♭6', '♭7', '1', '2',
    ])
  })
})

describe('freshNotes', () => {
  it('I -> IV fresh notes are 4 and 6', () => {
    expect(freshNotes([1, 3, 5], [4, 6, 1])).toEqual([4, 6])
  })
  it('nothing fresh when identical', () => {
    expect(freshNotes([1, 3, 5], [1, 3, 5])).toEqual([])
  })
})

describe('triadWindows (IV, top string set e-B-G, key D)', () => {
  const windows = triadWindows('D', 'IV', 'top')

  const asMap = (inv: string) => {
    const w = windows.find((x) => x.inversion === inv)!
    const m: Record<string, number> = {}
    for (const n of w.notes) m[n.stringName] = n.fret
    return m
  }

  it('2nd inversion includes frets {G:7, B:8, e:7}', () => {
    expect(asMap('2nd')).toMatchObject({ G: 7, B: 8, e: 7 })
  })
  it('root position includes frets {G:12, B:12, e:10}', () => {
    expect(asMap('root')).toMatchObject({ G: 12, B: 12, e: 10 })
  })
  it('1st inversion includes frets {G:4, B:3, e:3}', () => {
    expect(asMap('1st')).toMatchObject({ G: 4, B: 3, e: 3 })
  })
  it('every note in every window is a chord tone of IV (4·6·1)', () => {
    const tones = new Set([4, 6, 1])
    for (const w of windows) for (const n of w.notes) expect(tones.has(n.degree)).toBe(true)
  })
})

describe('noteNameOfDegree', () => {
  it('degree 1 of D is D; degree 4 of D is G', () => {
    expect(noteNameOfDegree('D', 1)).toBe('D')
    expect(noteNameOfDegree('D', 4)).toBe('G')
  })
})

describe('SPECIALS registry', () => {
  it('exposes Isus2 as [1,2,5]', () => {
    expect(SPECIALS.Isus2.degrees).toEqual([1, 2, 5])
  })
})

describe('chordName', () => {
  it('names diatonic chords in D', () => {
    expect(chordName('D', 'I')).toBe('D')
    expect(chordName('D', 'IV')).toBe('G')
    expect(chordName('D', 'V')).toBe('A')
    expect(chordName('D', 'vi')).toBe('Bm')
    expect(chordName('D', 'vii°')).toBe('C♯°')
  })
  it('adds 7th qualities', () => {
    expect(chordName('D', 'V', true)).toBe('A7')
    expect(chordName('D', 'ii', true)).toBe('Em7')
    expect(chordName('D', 'I', true)).toBe('Dmaj7')
  })
  it('names Isus2 as Dsus2 in D', () => {
    expect(chordName('D', 'Isus2')).toBe('Dsus2')
  })
  it('honors a 7th carried in the roman itself (vi7 -> Bm7)', () => {
    expect(chordName('D', 'vi7')).toBe('Bm7')
    expect(chordName('D', 'V7')).toBe('A7')
  })
})

describe('resolveOverlay', () => {
  it('resolves IV in D with no 7th', () => {
    expect(resolveOverlay('D', 'IV', false)).toEqual({
      roman: 'IV',
      root: 4,
      degrees: [4, 6, 1],
      guides: [6, 3],
      name: 'G',
    })
  })
  it('adds the 7th when toggled', () => {
    expect(resolveOverlay('D', 'V', true).degrees).toEqual([5, 7, 2, 4])
  })
  it('never adds a 7th to a special (Isus2)', () => {
    expect(resolveOverlay('D', 'Isus2', true).degrees).toEqual([1, 2, 5])
  })
})
