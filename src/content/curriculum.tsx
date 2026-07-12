import DegreeLens from '../components/DegreeLens'
import TriadWindows from '../components/TriadWindows'
import BoxView from '../components/BoxView'
import { P, D, Tab, Callout, Checklist } from '../components/Lesson'

export interface Module {
  id: string
  num: number | 'overview'
  title: string
  subtitle: string
  Body: () => React.ReactNode
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

const OVERLAYS: [string, string, string, string][] = [
  ['I', '1 · 3 · 5', '3 & 7', '3 announces major home'],
  ['ii', '2 · 4 · 6', '4 & 1', '4'],
  ['iii', '3 · 5 · 7', '5 & 2', '7'],
  ['IV', '4 · 6 · 1', '6 & 3', '4 — the note pentatonic hides'],
  ['V', '5 · 7 · 2', '7 & 4', '7 — leading tone, maximum pull'],
  ['vi', '6 · 1 · 3', '1 & 5', '6 — the minor home'],
  ['vii°', '7 · 2 · 4', '2 & 6', '7'],
]

function Overview() {
  return (
    <>
      <P>
        One map — your CAGED degree map. Seven overlays — one per diatonic chord. Soloing over
        changes is just keeping the whole map lit and switching which trio <em>glows</em>. Three
        rules generate the entire table, so you never memorize rows:
      </P>
      <Callout>
        <b>Triad:</b> root, skip one, skip one → <D>n</D>, <D>n+2</D>, <D>n+4</D> (wrap after 7).{' '}
        <b>7th:</b> one degree below the root (<D>n+6</D>). <b>Guide tones:</b> <D>n+2</D> and{' '}
        <D>n−1</D> — the 3rd & 7th, the notes that <em>are</em> the harmony.
      </Callout>
      <div className="ls-tablewrap">
        <table className="ls-table">
          <thead>
            <tr>
              <th>Chord</th>
              <th>Triad (degrees)</th>
              <th>Guide tones</th>
              <th>Character note</th>
            </tr>
          </thead>
          <tbody>
            {OVERLAYS.map(([r, t, g, c]) => (
              <tr key={r}>
                <td className="ls-roman">{r}</td>
                <td className="ls-mono">{t}</td>
                <td className="ls-mono ls-guide">{g}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        Play with the whole system below: switch chords, step the home progression, flip the minor
        lens (the map never moves — only the labels do).
      </P>
      <DegreeLens />
      <Callout>
        <b>The one-sentence version.</b> Light up the whole parent map; per chord, make its
        degree-trio glow; land phrases on glowing notes — especially the guide tones (<D>n+2</D>,{' '}
        <D>n−1</D>) — and let the fresh note of each chord announce the change.
      </Callout>
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 1
// ---------------------------------------------------------------------------

function Module1() {
  return (
    <>
      <P>
        <b>Goal:</b> see degrees, not shapes or note names, in all five CAGED positions.
      </P>
      <P>
        Your CAGED map currently answers “where are the notes of D major?” It must start answering
        “where is each <D>degree</D>?” This is 90% relabeling work, 10% new information. The board
        already speaks degrees — toggle <em>note names</em> to connect each dot to a name, then turn
        them off again and stay in numbers.
      </P>
      <DegreeLens initialRoman="I" showStepper={false} />
      <Checklist
        id="m1"
        items={[
          'Position audit — for each of the five D-major CAGED positions, say the degree of every note as you play it, slowly, out loud.',
          'Degree sniping — metronome at 60; each click, name a random degree and play it in the current position within one beat. All five positions.',
          'Cross-neck degree runs — play only degree 3 everywhere, low to high. Then only 6. Then only 7.',
        ]}
        doneWhen="given any position and any degree, you can put a finger on it in under a second, without counting from the root."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 2
// ---------------------------------------------------------------------------

function Module2() {
  return (
    <>
      <P>
        <b>Goal:</b> for any diatonic chord, instantly light up its degree-trio inside any position.
      </P>
      <P>
        Regenerate the overlays from the rules (<D>n</D>, <D>n+2</D>, <D>n+4</D>; 7th = <D>n−1</D>)
        rather than memorizing rows. Click each chord and watch which three dots glow — that trio is
        a property of the <em>degree</em>, identical in every key.
      </P>
      <DegreeLens initialRoman="I" showStepper={false} />
      <Callout>
        <b>vi = I plus one note.</b> The vi triad (6·1·3) shares 1 and 3 with your I triad (1·3·5).
        Bm7 literally contains the whole D-major triad — anything that worked over I works over vi;
        just re-aim the landing at <D>6</D>.
      </Callout>
      <Checklist
        id="m2"
        items={[
          'Overlay recitation (no guitar) — shuffle I–vii°; for each, say the trio in under a second. “IV → 4, 6, 1.”',
          'Arpeggio-in-position — pick one CAGED position; play I, then ii, … through vii° as arpeggios, staying in position. Repeat in all five positions over a week.',
          'Fresh-note drill — for each adjacent chord pair, name the degree in the new chord that wasn’t in the old one.',
        ]}
        doneWhen="you can arpeggiate the full diatonic cycle (I ii iii IV V vi vii°) in one position, continuously, at 80 bpm quarter notes, without pausing to think."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 3
// ---------------------------------------------------------------------------

function Module3() {
  return (
    <>
      <P>
        <b>Goal:</b> hear and finger the 3rds-and-7ths skeleton that makes solos sound “inside.”
      </P>
      <P>
        Guide tones = <D>n+2</D> and <D>n−1</D>. Between chords a 4th/5th apart, one guide tone
        resolves by a half or whole step while the other holds. Over ii–V–I: ii’s (4, 1) → V’s
        (7, 4) — the 1 drops to 7, the 4 holds; then V→I, the 7 rises to 1 and the 4 falls to 3. Two
        voices, tiny moves, maximum harmony. Turn <em>guide tones</em> on below (already on) and step
        the ii–V–I preset.
      </P>
      <DegreeLens initialGuides initialProgId="ii-V-I" initialRoman="ii" />
      <Checklist
        id="m3"
        items={[
          'Two-note comping — over a loop, play only the two guide tones of each chord on strings 3–4 or 2–3. Feel which note moves at each change.',
          'Guide-tone melody — improvise using only guide tones plus one neighbor note each.',
          'ii–V–I in all five positions, guide tones only.',
        ]}
        doneWhen="over I–vi–ii–V looped, you can play a continuous quarter-note line using ≥70% guide tones without looking at a chart."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 4
// ---------------------------------------------------------------------------

function Module4() {
  return (
    <>
      <P>
        <b>Goal:</b> phrases that land on a chord tone of the <em>arriving</em> chord, on the
        downbeat of the change.
      </P>
      <P>
        A solo “follows the changes” if the strong beats agree with the harmony. Everything between
        can be scale tones, chromatic approaches, anything. Step the home loop and read the target
        line under each chip; the story is <D>6 → 4 → 7 → 1</D>.
      </P>
      <DegreeLens initialProgId="home" initialRoman="Isus2" />
      <P>Reference phrase (E-shape zone, degrees annotated):</P>
      <Tab>{`        Dsus2                Bm7                  G                  A        (→ Dsus2)
e|---------------10--|--7---9--10--9--7--|-------------------|--9~~~~~~~~|--10---
B|--10--12--10-------|-------------------|--8--10--8---------|-----------|-------
G|-------------------|-------------------|------------(7)-9--|-----------|-------
     5   1   5   1       6  7  1  7  6       4   5  4  1  2      7 (hold)     1
                         land on 6 ✓         land near 4 ✓      leading tone   resolve!`}</Tab>
      <Checklist
        id="m4"
        items={[
          'Whole-note skeleton — one note per chord, the target: 6 → 4 (or 6) → 7 → resolve 1.',
          'Approach ramps — same targets, arrive via device (diatonic from above, then below, then chromatic below, then enclosure). One device per lap.',
          'Half-time phrases — two bars of free play, landing on the target at each change. Record; verify landings.',
          'Change the targets — land on the other guide tone of each chord; notice the different color.',
        ]}
        doneWhen="you can solo two full laps of Dsus2–Bm7–G–A, hitting a correct target on ≥7 of 8 changes, recorded and self-verified."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 5
// ---------------------------------------------------------------------------

function Module5() {
  return (
    <>
      <P>
        <b>Goal:</b> own every chord in nine small places, so “where else can I play G?” never comes
        up again.
      </P>
      <P>
        Three string sets, three inversions each. Every window is the chord’s trio in a different
        stacking — learn them as degree stacks, not new shapes: root = <D>n / n+2 / n+4</D>{' '}
        low-to-high; 1st inversion starts on <D>n+2</D>; 2nd starts on <D>n+4</D>.
      </P>
      <TriadWindows />
      <Callout>
        Notice the top-set 2nd inversion of IV sits at frets 7–8 — inside your E-shape zone and your
        B-minor box. There was a G triad under your fingers the whole time.
      </Callout>
      <Checklist
        id="m5"
        items={[
          'One chord, nine windows — take IV; play all nine windows up the neck, naming the inversion. Repeat for I, V, vi.',
          'Progression in one lane — play Dsus2–Bm7–G–A using only the top string set, nearest inversion each time.',
          'Triad → lick — arpeggiate a window, then decorate it with one scale tone.',
        ]}
        doneWhen="for any diatonic chord, you can find the nearest triad window to wherever your hand currently is, in under two seconds."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 6
// ---------------------------------------------------------------------------

function Module6() {
  return (
    <>
      <P>
        <b>Goal:</b> play full progressions without leaving your favorite box.
      </P>
      <P>
        The box, relabeled in major-map degrees, contains 2–4 tones of <em>every</em> overlay. The
        constraint is a feature: with nowhere to run, you make the changes with note choice rather
        than position shifts — which is precisely the skill. Step the overlays and see what each one
        leaves inside the box.
      </P>
      <BoxView />
      <Checklist
        id="m6"
        items={[
          'Box census — chart your BB box; label every note with its major-map degree and its minor-lens label. Keep the chart.',
          'Overlay-in-box — step through I–vii°; for each, play only its available tones inside the box.',
          'Boxed target solo — Module 4’s drill, confined to the box. The 4 over G and the 7 over A are both in there.',
          'Pentatonic + one — solo in B-minor pentatonic; when IV arrives add the 4, when V arrives add the 7.',
        ]}
        doneWhen="a listener (or you, on a recording) can identify the chord changes from your boxed solo alone, backing track muted."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 7
// ---------------------------------------------------------------------------

const MINOR_DICT: [string, string][] = [
  ['1', '♭3'],
  ['2', '4'],
  ['3', '5'],
  ['4', '♭6'],
  ['5', '♭7'],
  ['6', '1'],
  ['7', '2'],
]

function Module7() {
  return (
    <>
      <P>
        <b>Goal:</b> think “minor progression,” play “major map,” with zero translation lag.
      </P>
      <P>
        One anchor: the minor tonic lives on major degree <D>6</D>. Everything else falls out. Flip
        the minor lens below — the map does not move, the labels just re-read. The vi overlay you
        already own <em>is</em> the minor home (6·1·3 → 1·♭3·5).
      </P>
      <div className="ls-tablewrap">
        <table className="ls-table">
          <thead>
            <tr>
              <th>Major-map degree</th>
              {MINOR_DICT.map(([maj]) => (
                <th key={maj} className="ls-mono">
                  {maj}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Minor-lens label</td>
              {MINOR_DICT.map(([maj, min]) => (
                <td key={maj} className="ls-mono ls-guide">
                  {min}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <DegreeLens initialMinor initialProgId="i-bVI-bVII" initialRoman="vi" />
      <Callout>
        <b>The harmonic-minor cameo.</b> In B minor the v is often played as a major V (F♯ major,
        containing A♯). That A♯ is the <em>one note not on your map</em> — major-map ♯5. Over
        Bm–F♯7–Bm, raise the 5 to ♯5 only while F♯7 sounds, then resolve ♯5→<D>6</D>. The single most
        dramatic note in minor-key soloing, and it costs you exactly one relabel.
      </Callout>
      <Checklist
        id="m7"
        items={[
          'Dictionary sprints — hear/say a minor degree (“minor 4”), answer the major-map degree (“2”). Both directions, no guitar.',
          'B-minor progression practice — loop Bm–G–A (i–♭VI–♭VII), solo using overlays vi / IV / V. Same three overlays as Module 4 minus the sus.',
          'The harmonic-minor cameo — over Bm–F♯7–Bm, raise 5→♯5 only under the F♯7, resolve ♯5→6.',
        ]}
        doneWhen="given any minor progression named in minor numerals, you can state the major-map overlays instantly and solo over it targeting correctly."
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Module 8
// ---------------------------------------------------------------------------

function Module8() {
  return (
    <>
      <P>
        <b>Goal:</b> write (not just improvise) a 16-bar solo over Dsus2–Bm7–G–A.
      </P>
      <P>
        Melody = motif + variation. A motif is 3–6 notes with a rhythm. In the degree lens,
        diatonic transposition is just addition: shift every number by the same amount, wrap at 7.
        Motif <D>6-7-1</D> over Bm7 becomes <D>4-5-6</D> over G becomes <D>5-6-7</D> over A — a
        sequence, the oldest trick in the book.
      </P>
      <DegreeLens initialProgId="home" initialRoman="Isus2" />
      <Callout>
        Question/answer phrasing: a 2-bar phrase ending <em>off</em> the tonic (question), a 2-bar
        phrase ending <em>on</em> a stable tone — 1, 3, or 5 of the current chord (answer).
      </Callout>
      <Checklist
        id="m8"
        items={[
          'Motif farming — improvise for 5 minutes, recording; harvest the one 3–6 note fragment you liked most. Write it as degrees + rhythm.',
          'Diatonic transposition — shift the motif to start on each chord’s root degree as the progression moves.',
          'Q/A assembly — bars 1–2 motif (question), bars 3–4 varied motif landing on target (answer). Repeat with variation for 5–8.',
          'Full 16 — A (boxed, sparse) then A′ (escape the box via a triad window, denser, peak on the 7-over-A, resolve). Tab it out.',
        ]}
        doneWhen="you have one written solo you’d play for another guitarist, and you can explain every landing note in degrees."
      />
    </>
  )
}

// ---------------------------------------------------------------------------

export const MODULES: Module[] = [
  { id: 'overview', num: 'overview', title: 'The Degree Lens', subtitle: 'One map, seven overlays', Body: Overview },
  { id: 'm1', num: 1, title: 'Relabel the map', subtitle: 'shapes → degrees', Body: Module1 },
  { id: 'm2', num: 2, title: 'The Seven Overlays', subtitle: 'one trio per chord', Body: Module2 },
  { id: 'm3', num: 3, title: 'Guide tones', subtitle: 'the half-step engine', Body: Module3 },
  { id: 'm4', num: 4, title: 'Target-tone soloing', subtitle: 'the core skill', Body: Module4 },
  { id: 'm5', num: 5, title: 'Triads on string sets', subtitle: 'nine windows per chord', Body: Module5 },
  { id: 'm6', num: 6, title: 'The BB box', subtitle: 'home base', Body: Module6 },
  { id: 'm7', num: 7, title: 'The minor lens', subtitle: 'complete', Body: Module7 },
  { id: 'm8', num: 8, title: 'Composition', subtitle: 'saying something', Body: Module8 },
]
