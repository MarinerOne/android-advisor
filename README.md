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

## Notes

- Retailer links use stable Amazon UK search URLs that resolve in the UK and are
  ready for affiliate tracking via `src/data/affiliate.ts`.
- Credentials must never be committed or shipped in the client bundle. The image
  fetch runs at build time only.
