# Design Document

## Overview

Android Advisor is a client-side single-page web application that guides a user through a short quiz and returns three ranked Android phone recommendations tailored to their answers. Version 1 ships as a web app with no backend; all data (the phone catalogue) is bundled with the build, and all logic (quiz flow, scoring) runs in the browser.

The design prioritises four long-lived concerns from the requirements:

- **Easy re-theming** — all visual style flows from centralised design tokens.
- **Native wrappability** — the build output is a static bundle suitable for a WebView wrapper (e.g. Capacitor), and business logic is decoupled from the UI.
- **Auth readiness** — app and session state are structured so an auth layer can be added later without reworking features.
- **Affiliate readiness** — retailer links are modelled as data, so affiliate tracking can be layered on later.

The app is a fun, friendly experience: warm palette, rounded shapes, casual copy, lightweight motion, and a celebratory results reveal — all while respecting reduced-motion and accessibility basics.

## Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety across data model, scoring, and UI; catches dataset shape errors early. |
| Framework | React 18 | Mature, component-based, pairs well with Capacitor for native wrapping. |
| Build tool | Vite | Fast dev server and a static build output ideal for WebView packaging. |
| Styling | Tailwind CSS + CSS custom properties (design tokens) | Utility-first for speed; tokens live in CSS variables so theming is centralised and runtime-swappable. |
| Routing | React Router | Distinct routes for landing, quiz steps, and results; keeps flow navigable and back-button friendly. |
| State | React Context + reducer | Lightweight, no backend; a single app/session context is the natural seam for adding auth later. |
| Animation | CSS transitions + a small motion layer (e.g. Framer Motion) | Friendly feedback and a celebratory reveal; gated behind reduced-motion. |
| Testing | Vitest + React Testing Library | Unit-test scoring logic and quiz flow; aligns with Vite. |
| Native wrapper (future) | Capacitor | Wraps the static build into iOS/Android with a WebView; chosen now so the build stays compatible. |

These are proposed defaults. If you'd prefer a different framework or styling approach, we can adjust before implementation.

## Architecture

### Layered structure

The app separates **domain logic** from **presentation** so logic can be unit-tested and reused regardless of UI changes or native wrapping.

```
┌─────────────────────────────────────────────┐
│ Presentation (React components, routes)       │
│  Landing · Quiz steps · Results · shared UI   │
├─────────────────────────────────────────────┤
│ Application state (Context + reducer)          │
│  quiz answers · flow position · session seam   │
├─────────────────────────────────────────────┤
│ Domain logic (framework-agnostic TS)           │
│  quiz definition · scoring engine · types      │
├─────────────────────────────────────────────┤
│ Data access                                    │
│  phone catalogue loader · retailer-link helper │
├─────────────────────────────────────────────┤
│ Data (bundled JSON)                            │
│  phones.json · quiz.config.ts                  │
└─────────────────────────────────────────────┘
```

The domain-logic and data-access layers are plain TypeScript with no React imports, so they are portable and independently testable.

### Proposed source layout

```
src/
  domain/
    types.ts              # Phone, QuizQuestion, Answer, Recommendation, RetailerLink
    quiz.config.ts        # Core + detailed question definitions
    scoring.ts            # Pure scoring + ranking engine
    scoring.test.ts
  data/
    phones.json           # Curated UK phone catalogue
    phonesRepository.ts   # Loads/validates catalogue; applies retailer-link resolution
    affiliate.ts          # Placeholder affiliate-config hook (no-op in v1)
  state/
    AppContext.tsx        # App/session context + reducer (auth seam)
    quizReducer.ts
  components/
    quiz/                 # Question renderers, progress, nav
    results/              # Result cards, reveal, match score
    common/               # Button, Card, Layout, etc.
  theme/
    tokens.css            # Design tokens as CSS custom properties
    tailwind config maps tokens -> utilities
  routes/
    Landing.tsx
    Quiz.tsx
    Results.tsx
  App.tsx
  main.tsx
```

## Components and Interfaces

### Core domain types

```ts
type Importance = 'low' | 'medium' | 'high';

type PriceBand =
  | 'under-200' | '200-400' | '400-600' | '600-800' | '800-plus';

interface RetailerLink {
  retailer: string;        // e.g. "Amazon UK"
  url: string;             // base product URL
  isPlaceholder?: boolean; // true when not yet a real link
}

interface Phone {
  id: string;
  name: string;
  brand: string;
  image: string;           // bundled asset path or URL
  priceGBP: number;
  priceBand: PriceBand;    // derived/stored for fast budget matching
  specs: {
    cameraScore: number;   // 0-100 normalised attribute scores
    batteryScore: number;
    performanceScore: number;
    screenSize: number;    // inches
    storageGB: number;
  };
  tags: string[];          // e.g. ["gaming", "photography"]
  retailers: RetailerLink[];
}

interface QuizQuestion {
  id: string;
  tier: 'core' | 'detailed';
  prompt: string;
  options: { value: string; label: string }[];
}

interface QuizAnswers {
  [questionId: string]: string;
}

interface Recommendation {
  phone: Phone;
  matchScore: number;      // 0-100 shown to user
  reasons: string[];       // plain-language "why this fits"
  unmetConstraints?: string[]; // e.g. "slightly over budget"
}
```

### Scoring engine (domain/scoring.ts)

A pure function, independent of React:

```ts
function recommend(phones: Phone[], answers: QuizAnswers): Recommendation[];
```

Behaviour:

1. **Budget as a strong constraint (Req 5.2).** Phones in the selected price band get full budget credit; phones just outside are penalised but not excluded, so we can always return three (Req 4.5). Phones far outside are heavily penalised.
2. **Weighted priority matching (Req 5.3).** Each phone's attribute scores (camera, battery, performance, etc.) are weighted by the user's stated importance and primary use. Detailed answers (screen size, storage, brand) adjust weights/scores when present (Req 3.5), and are simply absent otherwise (Req 3.4).
3. **Deterministic tie-break (Req 5.4).** Equal scores break by a stable key (e.g. lower price, then phone id) so identical answers always yield identical, repeatable results.
4. **Match score (Req 5.5).** The displayed 0–100 match score is derived from the same normalised total used for ranking.
5. **Reasons.** For the top three, generate short, friendly explanations from the dominant contributing factors (e.g. "Great camera for your photography focus", "Comfortably within your budget").

Returns the top three, best match first.

### Quiz flow and state

- `AppContext` holds `{ answers, currentStep, phase }` plus a reserved, unused `session` slot that is the intended seam for a future auth/user object. In v1 `session` is always anonymous; nothing reads it, but features are written not to assume a logged-out-only world (Req 11).
- `quizReducer` handles: answer a question, go back (Req 1.4), advance (guarded so you cannot skip unanswered — Req 1.5), choose "see results" vs "refine further" (Req 3.1), and restart (Req 4.6).
- Routing: `/` landing, `/quiz` (step index in state, with progress — Req 1.3), `/results`. Browser back maps to going back a step.

### Data access and affiliate readiness

- `phonesRepository.ts` loads and validates `phones.json` against the `Phone` type at startup, surfacing dataset errors early (supports Req 6.4).
- `affiliate.ts` exposes `resolveRetailerLink(link: RetailerLink): string`. In v1 it returns the URL unchanged. Later, a central affiliate config (per-retailer tags) can be applied here, so adding commission tracking touches one function and no UI/scoring code (Req 10.3, 10.6).
- The retailer helper decides when to render vs disable the buy CTA when a phone has no usable link (Req 10.5), and opens links in a new tab on web (Req 10.4).

## Theming and Styling Design

- **Design tokens** live as CSS custom properties in `theme/tokens.css`: colour palette, radii, spacing scale, font families/sizes, shadow, motion durations. Example: `--color-primary`, `--radius-lg`, `--font-display`.
- **Tailwind** is configured to map these tokens to utility classes, so components reference tokens (not raw hex values), satisfying centralised styling (Req 7.1–7.2). Re-theming = editing one token file.
- **Fun & friendly direction (Req 8):** warm accent colour, generous rounded corners, a display font with personality for headings, playful but legible body text, friendly icons/emoji where they aid clarity.
- **Responsiveness (Req 7.3):** mobile-first layouts; quiz is single-column and thumb-friendly; results stack on mobile and sit side-by-side on larger screens.
- **Motion (Req 8.3, 8.4, 8.6):** step transitions, hover/press states, and a celebratory results reveal (cards animate in, top pick highlighted). All motion is wrapped so `prefers-reduced-motion` disables or tones it down.
- **Accessibility (Req 7.4):** semantic elements, keyboard-navigable options and buttons, visible focus states, labelled controls, and contrast-checked token palette.

## Data Model: Phone Catalogue

`phones.json` is the curated, bundled catalogue (Req 6). Seeding plan:

- Cover every price band with current UK-market Android phones (budget through flagship) so each band yields real options (Req 6.3).
- Each entry includes name, brand, image, `priceGBP`, derived `priceBand`, the attribute scores used by scoring, descriptive `tags`, and `retailers` (Req 6.2).
- `retailers`: real UK retailer URLs where readily available (e.g. manufacturer store, major UK retailers), otherwise a clearly marked placeholder (`isPlaceholder: true`) (Req 10.1).
- Attribute scores (camera/battery/performance etc.) are normalised 0–100 so the scoring engine compares phones consistently; these are editable without code changes (Req 6.4).

## Error Handling

- **Dataset validation:** on load, validate each phone entry; if an entry is malformed, log a clear error and exclude it rather than crashing, keeping the app usable.
- **Too few matches:** scoring always returns three results by relaxing soft constraints and annotating `unmetConstraints` (Req 4.5).
- **Missing retailer link:** disable/omit the buy CTA gracefully (Req 10.5).
- **Missing image:** fall back to a neutral placeholder image so cards never break.
- **Direct navigation to /results without answers:** redirect back to the quiz start.

## Testing Strategy

- **Scoring engine (unit, priority):** deterministic ranking, budget constraint behaviour, tie-breaking stability, always-returns-three, correct reason generation. Pure functions make this straightforward.
- **Quiz flow (component):** cannot advance without answering, back preserves answers, core-only path vs refine-further path, restart.
- **Dataset integrity (unit):** `phones.json` conforms to the `Phone` type and every band has at least enough entries to recommend from.
- **Accessibility checks:** keyboard navigation through a full quiz run and results; reduced-motion respected.

Tests are not implemented unless requested, but the architecture (pure domain logic) is designed to make them easy to add.

## Future Considerations (not built in v1)

- **Authentication:** add a real `session` to `AppContext`, gate optional features, persist a user's past results. The reserved session seam means this does not disturb the quiz or scoring.
- **Affiliate monetisation:** introduce a central affiliate config consumed by `affiliate.ts`; no UI or scoring changes required.
- **Native apps:** add Capacitor, point it at the Vite build output, and package for iOS/Android.
- **Live data:** optionally replace the bundled catalogue with a fetched/remote source behind the same repository interface.
