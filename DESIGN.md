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
| ground top | `#12100F` | page |
| ground mid | `#1B1715` | the blend through the middle |
| ground low | `#0D0B0A` | page foot |
| ink | `#F5EFE6` | text |
| muted | `#9C8F87` | secondary text |
| hairline | `rgba(245,239,230,.09)` | every rule |
| crimson | `#C8372B` | the one button, the full stop |

Two blooms, crimson at 16% and amber at 7%, sit in the blend; 3.5% grain sits
on top of everything. Nothing else is coloured.

## Type

| Family | Role |
|---|---|
| Satoshi 400 | body |
| Satoshi 500 | buttons, captions, feature titles |
| Satoshi 600 | h1 and h2 |

48 / 32 / 20 / 16 / 14 / 12. Line heights 1.06 for the h1, 1.15 for the h2,
1.6 for body. Tracking −2.8% on the h1 only. Sentence case everywhere.

## Space and radius

`8, 16, 24, 32, 48, 64, 96, 128`. Content 1120, gutters 32. Radius 12 on cards,
10 on buttons, 8 on small controls, 32 on the phone frame.

## Motion

One curve: `cubic-bezier(0.22, 1, 0.36, 1)`. Hover 300ms; the scroll rise is
16px over 500ms, once, on an IntersectionObserver. Nothing animates layout.
`prefers-reduced-motion` turns all of it off.

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
