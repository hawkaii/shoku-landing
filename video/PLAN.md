# Shoku — the reel becomes the page

A 23-second vertical launch clip. The hook is the real palak paneer reel,
playing as it does on Instagram; the rest of the film is what Shoku did with it.

## Why this shape

The product's whole claim is a transformation: a video goes in, a written recipe
comes out, and it keeps working at the stove. So the film is that transformation,
in order:

1. **The reel** (0–2.9) — the actual reel, full bleed, with its own captions and
   its own sound. One line over it: *This is a recipe.* Then the frame freezes on
   the paneer and a numbered pin lands on it.
2. **The page** (2.9–7.1) — the frozen frame sinks into the background and the
   dish page rises over it. *It writes the method.* Two chips count what came
   out: **11 steps**, **23 ingredients**.
3. **At the stove** (7.1–12.7) — a real question, typed: *can i skip the cream?*
   Three crimson dots think, then the recorded answer types itself in, then
   **applied · v2**.
4. **The fridge** (12.7–16.2) — the count runs 0 → **5 of 23**; the receipt reads
   **1 on the list**, **17 to buy**.
5. **The cook** (16.2–19.6) — the app screen and the photograph of the same step,
   side by side; step 04 swaps to step 11 on the beat.
6. **The mark** (19.6–23) — the launcher icon, the wordmark, *Reels in. Dinner
   out.*

## What is real

| On screen | Source |
|---|---|
| The reel, its captions, its audio | `instagram.com/reel/DSSIlPADyxr/` (Richa Gupta), downloaded 2 Nov |
| The dish page | the app, 2 Nov |
| The answer | recorded from the API, 2 Nov (trimmed, not invented) |
| 5 of 23, 1 on the list, 17 to buy | the app's fridge arithmetic |
| The cook screens + photos | captured 2 Nov; the photos are the ones from the cook |
| 11 steps, 23 ingredients | the extracted recipe |

Nothing in the film claims anything the product does not do.

## Rules kept

- 1080×1920, 30 fps, 23 s; everything readable inside 168–1330 px.
- Frame 0 is the poster: the dish, fully lit, with the hook line already set.
- Type is the site's: Fraunces (soft, wonky), Karla, JetBrains Mono. Same
  ground (#141110), ink (#F5EFE6), crimson (#C8372B) — reads as the same product.
- Music: *mk-coffee-or-tea* (the reel-studio library), −14.5 LUFS / −1.2 dBTP
  after mastering. The reel's own audio carries the first two seconds and is
  faded out, never ducked mid-word.
- Scene starts land on the bed's strong beats (12.74, 16.16, 19.61).

## Files

- `index.html`, `compositions/*.html` — the HyperFrames composition.
- `out/shoku-reel.mp4` — the delivery render (mastered).
- `out/shoku-reel.jpg` — frame 0, for the grid thumbnail.
- `out/shoku-reel-raw.mp4` — pre-master, if the loudness needs redoing.
