/**
 * Pedagogical tip lines for each chord overlay, keyed by roman numeral / id.
 * Prose only — all numbers here are degrees, consistent with the framework.
 * (Content, not math; the fretboard truth still comes from theory.ts.)
 */
export const TIPS: Record<string, string> = {
  Isus2:
    'No 3rd — the chord floats. Your melody can supply <b>3</b> and *be* the resolution, or rest on <b>1</b>.',
  I: 'Home. <b>3</b> announces major; <b>1</b> is full rest. Ending phrases on <b>5</b> keeps things open.',
  ii: "Sub-dominant motion. Guide tones <span class='g'>4</span> and <span class='g'>1</span>: the 1 will fall to 7 when V arrives.",
  iii: 'Dreamy middle ground — shares two tones with I. <b>7</b> gives it its color.',
  IV: 'The pentatonic-forbidden <b>4</b> is now the root of the harmony. Land on <b>4</b>, or on <b>6</b> (shared with the previous chord — silky voice leading).',
  V: "Tension engine. <b>7</b> is the leading tone — sit on it, then resolve 7→1 as the loop restarts. That half step is the sound of 'following the changes'.",
  vi: 'The minor home. Under the minor lens this is your tonic (minor 1 = major 6).',
  'vii°':
    "Rare as a landing zone; great as a passing sound. Its tones (7·2·4) are exactly V7's upper structure.",
}
