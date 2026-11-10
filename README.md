# Shoku landing page

One static directory. No build step, no framework, no dependencies.

```bash
cd site
python3 -m http.server 8100
# http://127.0.0.1:8100
```

## The look is the product

The page is the kitchen ticket the app is: paper, ink, one crimson accent,
hairlines, and mono for anything you measure. Every token comes from
`app/lib/core/theme/shoku_theme.dart`, so the site cannot drift away from the
product.

| | |
|---|---|
| Night | `#141110`, surface `#1E1A18`, sunken `#292320` |
| Ink | `#F5EFE6`, muted `#A6988E`, hairline `#332B27` |
| Accent | crimson `#C8372B`, green `#4EA882`, amber `#E09F3E` |
| Print | `#FFFDF9`, used only for polaroids and the share sheet |
| Type | Fraunces, set soft and slightly wonky (`SOFT 100, WONK 1`) so it sits with the brush mark, Karla for reading, JetBrains Mono for labels and numbers |
| Radius | 6 chip, 8 media, 12 card, 20 sheet, 999 pill |
| Motion | one curve, `cubic-bezier(0.22,1,0.36,1)` |

The mark is the app launcher icon itself, `assets/icon.png`, untouched. It sits on
the type axis at the top of the page and scrolls away; the pill carries the
wordmark in Fraunces with a crimson full stop.

## What is real on the page

Nothing here is invented. The assistant panels are answers the API actually
returned on 2 November:

| Panel | Where it came from |
|---|---|
| Ask | `POST /v1/assistant/ask`, palak paneer, "can i skip the cream?" |
| Edit | the same endpoint, a two turn exchange that came back as `intent: edit` with two operations |
| Suggest | `scope: kitchen`, three candidates with `have`, `total` and `missing` |
| Capture | `scope: kitchen`, "i have 2 kg rice and paneer" → `rice 2 kg`, `paneer` with no amount |
| Fridge counting | the app's own rule: units convert inside a family, never across |
| Receipt lines | `POST /v1/pantry/parse-image` on a real photograph |
| Screenshots | the app at 390 x 844, captured a frame at a time |
| The four photos | the dish cooked from that page on 2 November |
| 21 reels | `GET /v1/feed` |
| 24 MB | the v1.26.1 arm64 release APK |

## Annotations

The marks over the screenshots are not baked into the images. Each board is a
`<figure class="board" data-board="dish">` holding the phone and an SVG whose
viewBox is the app's own `390 x 844`. Coordinates live in `BOARDS` in
`site/js/main.js`, in that space, so a mark stays on the row it points at
whatever width the phone is drawn at.

A board with a cropped screenshot declares its own height (`h`), and the phone
image is cropped to match. The scrim is a mask with the marked rows cut out, so
the rest of the screen dims and the row you were told about stays bright.

## Editing

- Copy: `site/index.html`
- Tokens, and every component: `site/css/styles.css`
- The annotation layer, the tabs, the apply, the matcher: `site/js/main.js`

Any panel can be linked to directly while you are working on it:
`index.html?panel=edit` opens the edit panel.

## Hosting

Live at **https://shoku.gradientdescent.wiki**, on Cloudflare Workers, Worker
`shoku-landing`.

Static, so anything that serves files works. The whole of `site/` is the
deployment. `wrangler.jsonc` sets that up and needs no build step:

- `assets.directory` is `./site`, so `video/` never travels.
- `html_handling: auto-trailing-slash` gives clean URLs (`/privacy`, not
  `/privacy.html`), the same behaviour the old Vercel `cleanUrls` gave.
- `not_found_handling: 404-page` serves `site/404.html` for unknown paths.
- `site/_headers` sets the cache and security headers.

Deploy from the repository root:

```bash
npx wrangler deploy
```

That needs a logged-in Wrangler on the Cloudflare account that owns
`gradientdescent.wiki`, and Node 22.23.4 or newer.

The custom domain is a Worker Custom Domain on the `gradientdescent.wiki`
zone, so Cloudflare issues the certificate and `shoku` needs no DNS record of
its own. `index.html`, `sitemap.xml` and `robots.txt` carry the live URL for
the canonical tag and the social image; if the domain ever changes, those
strings change with it.

`vercel.json.legacy` is the old host's configuration, kept for reference only.
It is no longer deployed.

## Legal

`privacy.html` and `terms.html` are short and factual on purpose: what is
stored, what is sent to a model, what is never kept. Keep them true when the
product changes.
