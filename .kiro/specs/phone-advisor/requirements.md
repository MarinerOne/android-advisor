# Requirements Document

## Introduction

Android Advisor is a web application that helps people find the right Android phone for them. Users answer a short set of questions about their budget, lifestyle, and usage, and are then presented with three suitable phone recommendations ranked by how well they match.

Version 1 is a fully client-side web app with a bundled, curated phone dataset. It targets the UK market (prices in GBP). The architecture is built so the UI can be re-themed easily in the future, the app can be wrapped as a native iOS/Android app later, and user authentication can be added without re-architecting.

### Scope (Version 1)
- Quick quiz of 4 core questions, with an optional set of 4 detailed questions to refine results.
- Three ranked phone recommendations with a match score and a plain-language explanation.
- Curated, bundled phone dataset (no backend, no external APIs).
- UK market, prices in GBP (£).

### Out of Scope (Version 1, noted for the future)
- User accounts and authentication.
- Saving, favouriting, or sharing results.
- Live price/spec data from external APIs.
- Native app packaging (the code is structured to allow it later).

## Requirements

### Requirement 1: Start and take the quiz

**User Story:** As a user, I want to start a short quiz about my phone needs, so that I can get recommendations without a lot of effort.

#### Acceptance Criteria
1. WHEN the user opens the app THEN the system SHALL display a landing/start screen that explains what the app does and offers a way to begin the quiz.
2. WHEN the user starts the quiz THEN the system SHALL present the first of the core questions.
3. WHEN the user is answering questions THEN the system SHALL show progress (for example, current step out of total).
4. WHEN the user is on any question after the first THEN the system SHALL allow the user to go back to the previous question without losing earlier answers.
5. WHEN the user has not yet answered the current question THEN the system SHALL prevent advancing until an answer is selected.

### Requirement 2: Core quiz questions

**User Story:** As a user, I want to answer a few quick questions, so that the app understands my key needs.

#### Acceptance Criteria
1. The system SHALL present exactly four core questions covering: budget range, primary use, camera importance, and battery life importance.
2. WHEN presenting the budget question THEN the system SHALL offer selectable GBP price bands (for example: under £200, £200–£400, £400–£600, £600–£800, £800+).
3. WHEN presenting the primary-use question THEN the system SHALL offer options including social/browsing, photography, gaming, work/productivity, and basics (calls/texts).
4. WHEN presenting the camera-importance and battery-importance questions THEN the system SHALL offer a simple importance scale (for example: not important, somewhat important, very important).
5. WHEN the user has answered all four core questions THEN the system SHALL allow the user to proceed directly to results.

### Requirement 3: Optional detailed questions

**User Story:** As a user, I want the option to answer more questions, so that I can get a more tailored recommendation when I care about the details.

#### Acceptance Criteria
1. WHEN the user has completed the core questions THEN the system SHALL offer a choice to either see results now or refine further with more questions.
2. IF the user chooses to refine further THEN the system SHALL present up to four detailed questions covering: screen size preference, performance needs, storage needs, and brand preference.
3. WHEN presenting the brand-preference question THEN the system SHALL include a "no preference" option.
4. IF the user skips the detailed questions THEN the system SHALL generate recommendations from the core answers alone.
5. WHEN the user answers detailed questions THEN the system SHALL incorporate those answers into the recommendation ranking.

### Requirement 4: Phone recommendations

**User Story:** As a user, I want to see three phones that suit me, so that I have a clear, manageable set of choices.

#### Acceptance Criteria
1. WHEN the user completes the quiz THEN the system SHALL display exactly three recommended phones, ranked best match first.
2. WHEN displaying each recommendation THEN the system SHALL show the phone name, image, price in GBP, key specifications, and a match score.
3. WHEN displaying each recommendation THEN the system SHALL show a short plain-language explanation of why the phone fits the user's answers.
4. WHEN displaying each recommendation THEN the system SHALL provide a "learn more / buy" link for the phone.
5. IF fewer than three phones meet the user's hard constraints (for example, budget) THEN the system SHALL still return the three closest matches and indicate where a constraint could not be fully met.
6. WHEN results are shown THEN the system SHALL allow the user to restart the quiz or go back and change answers.

### Requirement 5: Recommendation logic

**User Story:** As a user, I want recommendations that genuinely reflect my answers, so that I can trust the results.

#### Acceptance Criteria
1. The system SHALL score every phone in the dataset against the user's answers and rank them.
2. WHEN scoring THEN the system SHALL treat budget as a strong constraint, prioritising phones within the selected price band.
3. WHEN scoring THEN the system SHALL weight each phone's strengths against the user's stated priorities (primary use, camera, battery, and any detailed answers).
4. WHEN two phones score equally THEN the system SHALL apply a deterministic tie-breaker so results are stable for the same answers.
5. The system SHALL derive the displayed match score from the same scoring used for ranking.

### Requirement 6: Phone dataset

**User Story:** As a maintainer, I want the phone catalogue to be easy to update, so that I can keep recommendations current.

#### Acceptance Criteria
1. The system SHALL store the phone catalogue as a curated, structured dataset bundled with the app.
2. Each phone entry SHALL include at minimum: name, brand, image reference, GBP price, and the specification/attribute fields used by the recommendation logic.
3. The dataset SHALL be seeded with a set of current UK-market Android phones spanning the full range of price bands.
4. WHEN the dataset is updated THEN the recommendation logic SHALL work without code changes, provided entries follow the defined structure.

### Requirement 7: Theming and styling

**User Story:** As a maintainer, I want to restyle the app easily, so that we can rebrand or adjust the look without rewriting components.

#### Acceptance Criteria
1. The system SHALL centralise visual styling (colours, typography, spacing) using design tokens/theme variables rather than hard-coded values scattered across components.
2. WHEN the theme tokens are changed THEN the appearance across the app SHALL update consistently.
3. The UI SHALL be responsive and usable on mobile, tablet, and desktop screen sizes.
4. The UI SHALL follow accessibility basics: keyboard navigability, sufficient colour contrast, and labelled interactive controls.

### Requirement 8: Fun and friendly experience

**User Story:** As a user, I want the app to feel fun and friendly, so that choosing a phone is enjoyable rather than a chore.

#### Acceptance Criteria
1. The UI SHALL use a warm, approachable visual style: a friendly colour palette, rounded shapes, and clear, legible typography.
2. The copy and tone throughout the app SHALL be casual and encouraging rather than formal or technical.
3. WHEN the user interacts with controls (selecting answers, advancing, viewing results) THEN the system SHALL provide pleasant, lightweight feedback such as transitions, hover/press states, or subtle animation.
4. WHEN results are revealed THEN the system SHALL present them in a celebratory, rewarding way (for example, an engaging reveal rather than a plain list dump).
5. The system MAY use friendly illustrations, icons, or emoji to add personality, provided they do not reduce clarity or accessibility.
6. WHEN animations or motion are used THEN the system SHALL respect the user's reduced-motion preference and tone motion down accordingly.

### Requirement 9: Portability for future native apps

**User Story:** As a maintainer, I want the web app structured for native wrapping, so that we can ship iOS and Android apps later without a rewrite.

#### Acceptance Criteria
1. The system SHALL be a client-side application whose build output can be packaged into a native wrapper (for example, via a WebView-based tool).
2. The system SHALL keep business logic (quiz flow, scoring, data access) separated from presentation so it can be reused if the UI changes.
3. The system SHALL avoid dependencies on a server backend for core functionality in version 1.

### Requirement 10: Retailer links and affiliate readiness

**User Story:** As a maintainer, I want to link each phone out to retailers selling it, so that I can eventually earn affiliate commission on referrals.

#### Acceptance Criteria
1. Each phone entry in the dataset SHALL support one or more retailer links, each with at least a retailer name and a URL.
   - For version 1, seed real retailer URLs where readily available, and use clearly marked placeholder URLs otherwise.
2. WHEN displaying a recommendation THEN the system SHALL render its retailer link(s) as a clear "buy / learn more" call to action.
3. The system SHALL structure retailer links so that affiliate tracking parameters (for example, referral tags or query parameters) can be added later without changing the UI or recommendation logic.
4. The system SHALL open retailer links in a way that keeps the app usable (for example, in a new tab/window on web).
5. The system SHALL allow a phone to have no retailer link, in which case the system SHALL omit or disable the buy call to action for that phone rather than showing a broken link.
6. IF a central affiliate configuration (for example, per-retailer referral tags) is introduced later THEN the data model SHALL accommodate applying it without restructuring existing phone entries.

### Requirement 11: Future authentication readiness

**User Story:** As a maintainer, I want the app ready for user accounts later, so that adding auth is low-friction.

#### Acceptance Criteria
1. The system SHALL structure application state and user-session concerns so that an authentication layer can be added later without reworking the quiz or recommendation features.
2. Version 1 SHALL NOT require login to use any feature.
3. The system SHALL NOT introduce assumptions that would block adding per-user persisted data in a later version.
