# Shoku landing page

One static page, plus the launch reel. No build step, no framework, no runtime
dependencies.

```bash
cd site
python3 -m http.server 8100
# http://127.0.0.1:8100
```

## The design

Satoshi only, on an 8 point rhythm, over Shoku's own warm black — blended, not
flat, with two low blooms and 3% grain so the surface has a tooth. One accent:
crimson, and it is spent on a single button per screen.

| | |
|---|---|
| Ground | `#12100F → #1B1715 → #0D0B0A`, crimson bloom at 16%, amber at 7%, grain 3.5% |
| Ink | `#F5EFE6`, muted `#9C8F87`, hairline `rgba(245,239,230,.09)` |
| Accent | `#C8372B`, used for the primary button, the full stop, and nothing else |
| Type | 48 / 32 / 20 / 16 / 14 / 12, weights 400 / 500 / 600, tracking −2.8% on the h1 only |
| Rhythm | 8, 16, 24, 32, 48, 64, 96, 128. Content 1120. |
| Motion | hover 300ms, scroll rise 500ms, one curve, reduced motion honoured |

Four sections: hero, three features, the cook pair, footer. The page is 4.3k
pixels tall on a desktop and 5.6k on a phone, and its critical path is the two
font files, the stylesheet, the script and one screenshot.

## What is real

Nothing invented. Every number is read off the product:

| On the page | Where it came from |
|---|---|
| Hero screenshot | the app at 390 × 844, captured a frame at a time |
| 5 of 23, 17 to buy | the app's own fridge count for palak paneer |
| The cook pair | cook mode captured from the app at steps 1, 4 and 11, beside the photographs of those steps taken on 2 November |
| 24 MB | the v1.26.1 arm64 release APK |
| 11 steps, 23 ingredients, 30 min | the recipe page |

The annotation over the hero screenshot is not baked into the image: it is an
SVG layer in the app's own coordinate space, with a mask that blurs and dims
everything outside the window.

## Editing

- Copy: `site/index.html`
- Tokens and every component: `site/css/styles.css`
- The annotation and the step pair: `site/js/main.js`

## Hosting

Static. On Vercel: import the repository, root directory `site`, framework
preset **Other**, no build command. `vercel.json` is there for a plain deploy.

Before publishing, replace `https://shoku.gradientdescent.wiki/` in
`index.html`, `sitemap.xml` and `robots.txt` with the real domain.

## The reel

`video/` holds the HyperFrames project for the launch reel and the render:
`video/out/shoku-reel.mp4`. It is not embedded on the page; it is the thing you
post next to it.
