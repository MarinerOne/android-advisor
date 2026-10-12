# Implementation Plan

- [x] 1. Scaffold the project and tooling
  - Initialise a Vite + React + TypeScript project in the workspace root.
  - Add and configure Tailwind CSS, React Router, and the project scripts (dev, build, preview).
  - Verify the dev server starts and the production build produces a static bundle.
  - _Requirements: 9.1, 9.3_

- [x] 2. Establish the theme token system
  - Create `src/theme/tokens.css` with CSS custom properties for colours, radii, spacing, typography, shadows, and motion durations, using a warm, friendly palette.
  - Configure Tailwind to map these tokens to utility classes so components never hard-code visual values.
  - Add a base layout and a tiny demo to confirm changing a token updates the app consistently.
  - _Requirements: 7.1, 7.2, 7.3, 8.1_

- [x] 3. Define domain types and the quiz configuration
  - Create `src/domain/types.ts` with `Phone`, `RetailerLink`, `QuizQuestion`, `QuizAnswers`, `Recommendation`, `Importance`, and `PriceBand`.
  - Create `src/domain/quiz.config.ts` defining the 4 core questions (budget, primary use, camera importance, battery importance) and 4 detailed questions (screen size, performance, storage, brand with a "no preference" option), with friendly copy.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.3, 8.2_

- [x] 4. Implement the scoring engine
  - Create `src/domain/scoring.ts` with a pure `recommend(phones, answers)` function.
  - Treat budget as a strong constraint while guaranteeing three results, weight attributes by stated priorities, incorporate detailed answers when present, apply a deterministic tie-breaker, and derive the 0–100 match score from the ranking total.
  - Generate short friendly "why this fits" reasons and populate `unmetConstraints` when a constraint can't be fully met.
  - _Requirements: 4.1, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 3.4, 3.5_

- [x] 5. Unit-test the scoring engine
  - Add `src/domain/scoring.test.ts` (Vitest) covering deterministic ranking, budget constraint behaviour, tie-break stability, always-returns-three, and reason generation.
  - _Requirements: 5.1, 5.2, 5.4, 4.5_

- [x] 6. Build the phone catalogue and data access
  - Create `src/data/phones.json` seeded with current UK-market Android phones across every price band, each with name, brand, image, `priceGBP`, derived `priceBand`, normalised attribute scores, tags, and retailer links (real UK URLs where readily available, clearly marked placeholders otherwise).
  - Create `src/data/phonesRepository.ts` to load and validate the catalogue against the `Phone` type, excluding malformed entries gracefully.
  - Create `src/data/affiliate.ts` with a `resolveRetailerLink` function that returns the URL unchanged in v1 (the seam for future affiliate tracking).
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.1, 10.3, 10.6_

- [x] 7. Set up application state and the quiz reducer
  - Create `src/state/AppContext.tsx` holding `{ answers, currentStep, phase }` plus a reserved anonymous `session` slot for future auth.
  - Create `src/state/quizReducer.ts` handling answer selection, back navigation (preserving earlier answers), guarded advancement, the "see results vs refine further" choice, and restart.
  - _Requirements: 1.4, 1.5, 3.1, 4.6, 11.1, 11.2, 11.3_

- [x] 8. Build shared UI components
  - Create reusable `Button`, `Card`, `Layout`, and progress-indicator components in `src/components/common/`, styled via theme tokens with hover/press states and friendly rounded shapes.
  - Wrap motion so it respects `prefers-reduced-motion`.
  - Ensure components are keyboard-navigable with visible focus states and proper labels.
  - _Requirements: 7.3, 7.4, 8.1, 8.3, 8.6_

- [x] 9. Build the landing screen
  - Create `src/routes/Landing.tsx` explaining what the app does in a casual, encouraging tone with a clear "start quiz" call to action.
  - _Requirements: 1.1, 8.2_

- [x] 10. Build the quiz flow UI
  - Create `src/routes/Quiz.tsx` and question-renderer components in `src/components/quiz/` that render core questions one at a time with a progress indicator.
  - Guard advancement until the current question is answered; support going back without losing answers.
  - After the core questions, present the "see results now vs refine further" choice, then the detailed questions if chosen.
  - Add pleasant step transitions (reduced-motion aware).
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.5, 3.1, 3.2, 8.3_

- [x] 11. Build the results screen with recommendations
  - Create `src/routes/Results.tsx` and result-card components in `src/components/results/` that run the scoring engine and display exactly three ranked phones.
  - Each card shows name, image, price in GBP, key specs, match score, and friendly "why this fits" reasons; show `unmetConstraints` notes where relevant.
  - Render retailer "buy / learn more" links via `resolveRetailerLink`, opening in a new tab, and gracefully disable/omit the CTA when no usable link exists.
  - Add a celebratory reveal (reduced-motion aware) and controls to restart or go back and change answers.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.4, 10.2, 10.4, 10.5_

- [x] 12. Wire routing, guards, and error fallbacks
  - Connect landing, quiz, and results routes with the app state; map browser back to stepping back through the quiz.
  - Redirect direct navigation to results-without-answers back to the quiz, and add image/placeholder fallbacks so cards never break.
  - _Requirements: 1.1, 1.2, 4.6_

- [x] 13. Final verification pass
  - Run the production build and confirm a clean static bundle.
  - Run the scoring tests and do a full manual quiz run (core-only path and refine-further path), checking three results appear, scores are stable for identical answers, retailer links behave, and reduced-motion is honoured.
  - _Requirements: 4.1, 5.4, 8.6, 9.1_
