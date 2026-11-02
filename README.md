# Shoku landing page

A static page for Shoku, in one directory. No build step, no framework, no
dependencies: open `site/index.html` or serve the folder.

```bash
cd site
python3 -m http.server 8100
# http://127.0.0.1:8100
```

## What is real on this page

Nothing on the page is invented. Every number, screenshot and thumbnail comes
from the product as it runs today:

| Asset | Source |
|---|---|
| `assets/reels/*.jpg` | Thumbnails of the 21 reels on the Wall, taken from `GET /v1/feed` |
| `assets/shots/dish.jpg` | The palak paneer page, captured from the app running in a browser at 390 x 844 |
| `assets/shots/wall.jpg` | The Wall, same capture method |
| `assets/shots/cook.jpg` | Cook mode, first step of palak paneer |
| `assets/shots/fridge.jpg` | The fridge, with the cook from your fridge row |
| 23 ingredients, 11 steps, 5 of 23, 17 to buy | Read off the palak paneer page |
| `amul butter 500 g`, `tata salt 1 kg`, `lays classic 2 pcs` | Output of `POST /v1/pantry/parse-image` on a real receipt |
| 24 MB | The `arm64` release APK for v1.26.1 |
| 21 reels | `GET /v1/feed` today |

Reel thumbnails need CORS on the media bucket for the app's web build to draw
them, which is why `gs://shoku-media-oceanic-archery-453217-v6` now carries a
`GET` CORS rule. The phone screenshots above were taken before that fix and
show monograms where photos belong; re capture them after the next build.

## Editing

- Copy lives in `site/index.html`.
- Design tokens, type scale and spacing are in `site/css/styles.css`, at the top.
- The mobile menu, scroll reveals and the word by word tagline are in
  `site/js/main.js`.

Type sizes land on one scale, spacing comes from one table, and motion uses one
curve, so a change to a token updates the whole page.

## Hosting

The page is a static directory, so anything that serves files works. On Vercel:
import the repository, set **Root Directory** to `site`, framework preset
**Other**, no build command. `vercel.json` is there for a plain `vercel deploy`.

Before publishing, replace `https://shoku.gradientdescent.wiki/` in
`index.html`, `sitemap.xml`, `robots.txt` and `privacy.html` with the real
domain, since it is used for the canonical URL and the social image.

## Legal

`privacy.html` and `terms.html` are short and factual on purpose: what is
stored, what is sent to a model, and what is never kept. Keep them true when the
product changes.
