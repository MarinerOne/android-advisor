# Android Advisor

A friendly web app that recommends Android phones from a short quiz, plus a
browsable catalogue, phone detail pages, and a favourites shortlist. Built with
Vite + React + TypeScript, styled via centralised design tokens, and structured
so it can be wrapped as a native app and gain auth later.

## Development

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm run build      # production build to dist/
npm test           # run unit tests (scoring + share logic)
```

## Phone catalogue data

The catalogue lives in `src/data/phones.json` and is the single source the app
reads. It is generated and enriched by two scripts.

### Regenerate the catalogue

`scripts/generatePhones.mjs` holds a curated list of models and derives the
price band, Amazon UK search links, and attribute scores.

```bash
npm run data:generate
```

> Prices and specs are best-knowledge estimates, not live-verified data.
> Attribute scores (0–100) are relative judgements that drive the matching.

### Fetch real product images (Amazon Product Advertising API)

`scripts/fetchAmazonImages.mjs` pulls licensed product images from the Amazon
PA API 5.0 (UK marketplace) and writes the primary image URL into
`phones.json`. This is the licensed, intended way to show Amazon product photos
on an affiliate site.

**Prerequisites**

- An approved **Amazon Associates (UK)** account.
- **PA API access**, which Amazon grants only after your account makes the
  required qualifying sales. Until then the API returns an access error and the
  script leaves the existing images (clean branded placeholders) untouched.

**Run it** (credentials are read from the environment and never committed):

```bash
PAAPI_ACCESS_KEY=your_access_key \
PAAPI_SECRET_KEY=your_secret_key \
PAAPI_PARTNER_TAG=your_associate_tag \
npm run data:images
```

When no real image is set for a phone, the app renders a clean branded SVG
placeholder, so the UI always looks intentional with or without photos.

## SEO & static site generation

The site is pre-rendered to static HTML with `vite-react-ssg`. `npm run build`
generates a crawlable HTML file for every route — home, browse, and all 100
phone detail pages — each with its own `<title>`, meta description, canonical
URL, Open Graph/Twitter tags, and (on phone pages) `Product` JSON-LD structured
data. `scripts/generateSitemap.mjs` writes `public/sitemap.xml` as part of the
build; `public/robots.txt` points crawlers at it.

Canonical domain: `https://androidadvisor.net` (configured in `src/seo/site.ts`).

### Hosting requirement

Routing uses clean URLs (`/browse`, `/phone/<id>`). The pre-rendered pages are
real files, so direct hits and crawlers work out of the box. For client-side
navigation to unknown paths, the host needs a fallback to `/index.html`.

## Deploying to AWS Amplify Hosting

1. In the Amplify console, connect this GitHub repo and pick the `main` branch.
   Amplify detects `amplify.yml` in the repo root and uses it for the build.
   (Build command `npm run build`, output directory `dist`.)

2. **Add the rewrite rule.** This is required and is NOT read from the repo —
   set it in the console under *Hosting → Rewrites and redirects*. Use the rule
   in `deploy/amplify-redirects.json`:

   - Source: the regex in that file (matches only paths that are not real
     files with a known extension)
   - Target: `/index.html`
   - Type: `200 (Rewrite)`

   This matters because this is a **pre-rendered** site, not a plain SPA. A
   blanket `/<*>` → `/index.html` rule would serve the home page for every URL
   and defeat the SEO work. The provided rule lets the per-page `.html` files,
   `sitemap.xml`, `robots.txt`, assets, etc. serve directly, and only falls back
   to the app shell for extension-less client-side routes.

3. **Custom domain.** Add `androidadvisor.net` under *Hosting → Custom domains*
   and follow Amplify's DNS steps. The canonical URLs already point here
   (`src/seo/site.ts`).

4. **Build-time secrets (optional).** The Amazon image fetch is a local/manual
   step and is not part of the Amplify build. If you later want images fetched
   during the Amplify build, add `PAAPI_ACCESS_KEY`, `PAAPI_SECRET_KEY`, and
   `PAAPI_PARTNER_TAG` as environment variables in the Amplify console (never in
   the repo) and add `npm run data:images` to the build phase in `amplify.yml`.

## Analytics

Plausible (cookieless, no consent banner needed) is loaded in `index.html` and
auto-tracks pageviews. The app also sends typed custom events (defined in
`src/analytics/events.ts`) — e.g. `buy_click`, `quiz_completed`. To surface
these in Plausible, add them as custom event goals: see
[`docs/plausible-goals.md`](docs/plausible-goals.md) for the full list and
setup steps.

## Notes

- Retailer links use stable Amazon UK search URLs that resolve in the UK and are
  ready for affiliate tracking via `src/data/affiliate.ts`.
- Credentials must never be committed or shipped in the client bundle. The image
  fetch runs at build time only.
