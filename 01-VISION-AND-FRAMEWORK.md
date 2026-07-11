# The Degree Lens: One Map, Seven Overlays

*A chord-tone soloing framework built for Alejandro — CAGED-fluent, number-thinker, minor-leaning, BB-box native.*

---

## 0. Who this is built for (the personalization contract)

Every design decision in this framework follows from these facts. If Claude Code (or anyone) extends this material, these constraints are non-negotiable:

- **You think in numbers, not note names.** All content is expressed in scale degrees of the parent major scale. Note names appear only as secondary labels.
- **You already own the map.** You can light up all 7 degrees of any major scale across the whole neck via CAGED. We never rebuild that; we *overlay* on it.
- **Your taste is minor, your map is major.** The framework includes a translation layer so you can keep the major map and *hear* minor.
- **The BB box is home.** The box gets treated as a first-class position with its own chord-tone overlays, not an afterthought.
- **Default working key: D major / B minor.** Everything is taught in D first, then shown to be key-agnostic (which it trivially is, because it's all degrees).

---

## 1. The problem, precisely diagnosed

When the progression hits the IV chord, you currently do **two mental hops**:

1. "The IV chord is G. G's chord tones are its own 1–3–5: G, B, D."
2. "Now, where are G, B, D *on my D major map*?" → translate back → 4, 6, 1.

Hop 2 is the bottleneck. It forces you out of your map, into note names (which you don't think in), and back. The fix is to **precompute hop 1+2 once, forever**, as a property of the *degree*, not the chord:

> **Chord tones of the chord built on degree *n* are always: n, n+2, n+4 (diatonic, wrapping after 7).**

You never ask "what's the 3rd of G?" again. You ask "what trio lights up when the IV plays?" — and the answer never changes, in any key, ever.

---

## 2. The Seven Overlays (memorize this table — it's the whole system)

One map (your CAGED degree map). Seven overlays (one per diatonic chord). Soloing over changes = keeping the map lit and switching which trio *glows*.

| Chord | Triad tones (parent degrees) | Add the 7th | Guide tones (3rd & 7th) | Character note |
|---|---|---|---|---|
| **I** | 1 · 3 · 5 | + 7 | 3 and 7 | 3 (announces major home) |
| **ii** | 2 · 4 · 6 | + 1 | 4 and 1 | 4 |
| **iii** | 3 · 5 · 7 | + 2 | 5 and 2 | 7 |
| **IV** | 4 · 6 · 1 | + 3 | 6 and 3 | **4** (the note pentatonic hides) |
| **V** | 5 · 7 · 2 | + 4 | 7 and 4 | **7** (leading tone, maximum pull) |
| **vi** | 6 · 1 · 3 | + 5 | 1 and 5 | 6 (the minor home) |
| **vii°** | 7 · 2 · 4 | + 6 | 2 and 6 | 7 |

Three rules generate the whole table — you don't even need to memorize it as a table:

- **Triad rule:** root degree, skip one, skip one → `n, n+2, n+4` (wrap after 7).
- **7th rule:** the 7th of any diatonic chord is **one degree below its root** (IV's 7th is 3; V's 7th is 4; ii's 7th is 1).
- **Guide-tone rule:** guide tones = `n+2` and `n−1`. These two notes *are* the harmony — the root and 5th are furniture; the 3rd and 7th are the people in the room.

### Immediate payoffs

- **vi = I plus one note.** The vi triad (6·1·3) is your I triad (1·3·5)... shifted. Notice: 6·1·3 and 1·3·5 share 1 and 3. Bm7 (6·1·3·5) literally *contains the entire D major triad*. Anything melodic that worked over I works over vi — you just re-aim the landing at 6.
- **IV solves the pentatonic problem.** Major pentatonic omits 4 and 7. Over the IV chord, **4 is the root of the harmony** — the "wrong-sounding" note becomes the *most* right note for those two bars. The framework's answer to "what do I do over IV?": land on 4 or 6, and enjoy that 4 finally sounds like it belongs.
- **V is the tension engine.** Its trio (5·7·2) contains 7, the leading tone. Sit on 7 over V, resolve 7→1 as the chord resolves to I (or vi). That single half-step move is 60% of what makes a solo sound like it "follows the changes."

---

## 3. The Minor Lens (keep the major map, hear minor)

You already navigate D minor via F major. Formalize it: the minor lens is a **relabeling dictionary**, not a new map.

| Major-map degree | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| **Minor-lens label** | ♭3 | 4 | 5 | ♭6 | ♭7 | **1** | 2 |

One anchor to memorize: **the minor tonic lives on major degree 6.** Everything else falls out (minor's home triad = 6·1·3 in major-map degrees — which is just the vi overlay you already have).

Minor progressions, translated to your major map:

| Minor-world progression | Major-map overlays you actually play |
|---|---|
| i – ♭VI – ♭VII | vi – IV – V |
| i – iv – v | vi – ii – iii |
| i – ♭VII – ♭VI – V(harmonic) | vi – V – IV – (III major: 3·♯5→ borrow ♯5 = the one non-map note) |
| i – ♭III – ♭VII – ♭VI ("Zombie") | vi – I – V – IV |

**The BB box in degrees.** Your box — with 1·2 and 5·6 paired on the low strings — sits in the major map's territory around the vi. Under the minor lens those pairs relabel to ♭3·4 and ♭7·1: the box's sweet notes *are* the minor tonic and its ♭7/♭3 halo. That's why it feels like home to you. Module 6 of the curriculum maps every chord overlay *inside* the box so you can play a full progression without leaving it.

---

## 4. Triads on string sets: the answer to "where else can I play G?"

CAGED gives you five *grips* per chord. String-set triads give you **nine small windows** per chord (3 string sets × 3 inversions), and each window is just three dots of an overlay clustered together. In degree terms, every G-in-D triad is the trio **4·6·1** stacked in some order:

| Stacking (low→high) | Name | Feel |
|---|---|---|
| 4 · 6 · 1 | root position | grounded |
| 6 · 1 · 4 | 1st inversion | leaning, wants to move |
| 1 · 4 · 6 | 2nd inversion | open, floaty |

Concretely, IV-chord triads on the top string set (G–B–e strings) in D major:

```
        1st inv        2nd inv        root pos
e|--3--(4)------|--7--(6)------|--10--(1)-----|
B|--3--(1)------|--8--(4)------|--12--(6)-----|
G|--4--(6)------|--7--(1)------|--12--(4)-----|
      frets 3-4      frets 7-8      frets 10-12
```

Notice the middle one sits at frets 7–8 — **inside your D-major E-shape zone and your B-minor box territory**. You were never limited to the CAGED A-shape G at fret 3; there was a G triad living under your fingers the whole time. The framework's habit: for whatever position you're soloing in, know where the current overlay's triad *clusters* within reach.

---

## 5. Worked example: Dsus2 – Bm7 – G – A (I sus2 – vi7 – IV – V in D)

First, the whole progression in overlays:

| Chord | Degrees | Fresh note vs. previous chord | Best landing (target) |
|---|---|---|---|
| Dsus2 | 1 · 2 · 5 | — (no 3rd! floaty, unresolved) | 1, or *tease* 3 to resolve the sus yourself |
| Bm7 | 6 · 1 · 3 · 5 | **6** | 6 (announces the minor turn) |
| G | 4 · 6 · 1 | **4** | 4 (the pentatonic-forbidden note, now the root) or 6 (shared with Bm7 — silky) |
| A | 5 · 7 · 2 | **7** | 7 → resolve to 1 as the loop restarts |

Three structural observations that basically write the solo for you:

1. **Common-tone threads:** degree 5 lives in Dsus2, Bm7, *and* A. Degree 1 lives in Dsus2, Bm7, and G. You can hold one note through three chords and sound intentional.
2. **The story of the progression is 6 → 4 → 7 → 1.** Play only those four notes, one per chord, whole notes, and it already "follows the changes." Everything else is decoration.
3. **Dsus2's missing 3rd is an invitation.** The chord refuses to resolve; your melody can supply the 3 (F♯) and *be* the resolution. That's a composer's move, available in bar one.

A four-bar phrase in the E-shape zone (frets 7–10), degrees annotated:

```
        Dsus2                Bm7                  G                  A        (→ Dsus2)
e|---------------10--|--7---9--10--9--7--|-------------------|--9~~~~~~~~|--10---
B|--10--12--10-------|-------------------|--8--10--8---------|-----------|-------
G|-------------------|-------------------|------------(7)-9--|-----------|-------
     5   1   5   1       6  7  1  7  6       4   5  4  1  2      7 (hold)     1
                         land on 6 ✓         land near 4 ✓      leading tone   resolve!
```

Passing tones (like the 7 inside the Bm7 bar) are legal anywhere — the rule is only that **strong beats and phrase endings land on the current overlay.**

---

## 6. Direct answers to your open questions

**"Should I use the CAGED A shape for IV and V and play the 3–5–1 chord notes?"**
You *can*, but it's the two-hop trap: it makes you re-root your thinking on each chord. Better: stay rooted in the parent map and light up 4·6·1 (for IV) and 5·7·2 (for V) *wherever you already are*. Chord shapes become optional zoom-ins (Section 4), not the navigation system.

**"Should I stay in the BB box and focus on notes for each chord?"**
Yes — this is actually the ideal *training constraint*. One position, seven overlays. The box doesn't contain full grips for every chord, but it contains 2–4 tones of every overlay, and that's all a melody needs. Module 6 is exactly this.

**"What do I do over the IV chord since 4 isn't pentatonic?"**
Reframe: pentatonic omits 4 and 7 because they're the *spiciest* notes — they clash with I. But over IV, 4 is the root; over V, 7 is the 3rd. The chords take turns making the forbidden notes legal. Your job over IV: add 4 to your pentatonic vocabulary for those bars (or equivalently, target 6, which is both G's 3rd and already in your pentatonic).

**"Where else can I play G besides the A-shape?"**
Nine string-set triad windows (Section 4), all of which are just the 4·6·1 trio clustered — plus, honestly, *any* three nearby dots of the 4·6·1 overlay count as "a G," arpeggiated or not. Once you see overlays, "chords" stop being shapes and become constellations.

---

## 7. The one-sentence version

> **Light up the whole parent map; per chord, make its degree-trio glow; land phrases on glowing notes — especially the guide tones (n+2, n−1) — and let the fresh note of each chord announce the change.**

Everything in the curriculum (file 02) is drills to make this automatic, and the app (file 03) exists to make the overlays *visible* until your mind's eye takes over.
