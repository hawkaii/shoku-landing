# Shoku design system

For anything built on the web side. The source of truth is
`app/lib/core/theme/shoku_theme.dart`; this file restates it for the site and
records the rules that keep the page from drifting into a generic dark
product page.

## The idea

Shoku is a kitchen ticket at night. Near black, one hot accent, hairlines
everywhere, and mono for anything you measure. The only light surfaces on the
page are the polaroids and the share sheet, because those are the things you
would print. Brutalism survives in exactly two places:
the primary button and the cook timer. Nothing glows, nothing floats in a
gradient, nothing is glassmorphic.

## Colour

| Token | Value | Use |
|---|---|---|
| night | `#141110` | page |
| surface | `#1E1A18` | tickets, cards |
| sunken | `#292320` | hover, table stripes |
| ink | `#F5EFE6` | text |
| muted | `#A6988E` | secondary text |
| hairline | `#332B27` | every rule |
| crimson | `#C8372B` | accent, the full stop, one button per screen |
| green | `#4EA882` | additions |
| amber | `#E09F3E` | adjustments |
| print | `#FFFDF9` | polaroids and the share sheet, the only light surfaces |
| chalk | `#F5EFE6` | annotations drawn on a screenshot |

Never a gradient. Never a coloured shadow. Never a second accent.

## Type

| Family | Role |
|---|---|
| Fraunces, `SOFT 100` `WONK 1` | display, headings, quotes, the recipe step in italic. The same axes the brush mark lives on: soft terminals, a few letters deliberately off. Weight 500 to 600, never 900. |
| Karla | reading text, buttons, labels that are sentences |
| JetBrains Mono | numbers, step numbers, uppercase micro labels, timestamps |

The mark is the launcher icon, not a redrawn SVG, and never recoloured. It
belongs to the page, not the viewport: it sits on the type axis at the top and
scrolls away with the hero, while the pill stays.

Sizes: display `clamp(2.75rem, 6.4vw, 4.5rem)`, h2 `clamp(1.875rem, 3.4vw, 2.875rem)`,
h3 `1.4375rem`, body `0.9375rem`, label `0.6875rem` with `0.14em` tracking.
Sentence case everywhere except mono labels, which are uppercase.

## Space and radius

`2, 4, 8, 12, 16, 24, 32, 48, 64, 96`. Nothing between them.
Radius `6` chip, `8` media, `12` card, `20` sheet, `999` pill. An element
inside another gets `outer − gap` when the gap is under 32px.

## Motion

One curve: `cubic-bezier(0.22, 1, 0.36, 1)`. Layout `480ms`, colour `240ms`.
Animate `transform` and `opacity` only. Respect
`prefers-reduced-motion`: the annotations appear printed, the reveals do not
move, the panels do not animate.

## Component rules

- **Button.** Crimson fill, 1.5px ink border, `0 2px 0 ink` shadow, radius 6.
  On press the shadow collapses and the button travels 2px. One per screen.
- **Ticket.** Surface card, hairline border, perforation dots along the top
  edge. Numbers and metadata in mono.
- **Board.** A real screenshot inside an ink phone frame, with an SVG layer in
  the app's own `390 x 844` space drawn on top. Marks are a bracket, a pin or
  an underline; the rest of the screen dims through a mask cut out around the
  mark. A note under the phone lights its mark on hover and on focus.
- **Rows.** Hairline above, mono on the right for the value. No zebra striping.
- **Chips.** Radius 6, hairline, mono, `0.625rem`. Dashed border for "and
  three more".

## Never

- A gradient background, a glow, an orb, a floating screenshot in a void
- Three identical cards with line icons
- A "powered by AI" badge, a sparkle as decoration, an emoji in copy
- Invented numbers, testimonials, or logos
- A control that does nothing: if it is drawn, it works, or it says why not
