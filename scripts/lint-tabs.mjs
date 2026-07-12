/**
 * Number-honesty linter. Verifies that every `fret--(degree)` annotation in the
 * triad tabs of the source markdown agrees with theory.ts's degreeAt(). Fret
 * numbers in this material are non-negotiable for this user, so CI-check them.
 *
 * Parses lines like:   e|--3--(4)------|--7--(6)------|--10--(1)-----|
 * where the leading letter names the string and each `<fret>--(<deg>)` pair
 * asserts "in D major, this string at this fret is this degree".
 *
 * Run: npm run lint:tabs   (node >= 23 strips the TS types on import)
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { degreeAt } from '../src/lib/theory.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const KEY = 'D'
const FILES = ['01-VISION-AND-FRAMEWORK.md', '02-CURRICULUM.md']

// string letter -> guitar string number (1 = high e ... 6 = low E)
const STRING_NUMBER = { e: 1, B: 2, G: 3, D: 4, A: 5, E: 6 }

// a `<fret>--(<degree>)` annotation
const PAIR = /(\d+)-*\((\d+)\)/g

let checked = 0
const errors = []

for (const file of FILES) {
  const text = await readFile(join(ROOT, file), 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const m = line.match(/^([eBGDAE])\|/)
    if (!m) return
    const stringNumber = STRING_NUMBER[m[1]]
    for (const pair of line.matchAll(PAIR)) {
      const fret = Number(pair[1])
      const claimed = Number(pair[2])
      const actual = degreeAt(KEY, stringNumber, fret)
      checked++
      if (actual !== claimed) {
        errors.push(
          `${file}:${i + 1}  string ${m[1]} fret ${fret}: tab says degree ${claimed}, ` +
            `theory.ts says ${actual === null ? 'not in scale' : actual}`,
        )
      }
    }
  })
}

if (errors.length) {
  console.error(`✗ tab lint: ${errors.length} mismatch(es) of ${checked} checked\n`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}
console.log(`✓ tab lint: ${checked} fret/degree annotations verified against theory.ts`)
