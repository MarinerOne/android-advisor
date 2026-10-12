# Plausible goals & custom events

The Plausible script (in `index.html`) tracks **pageviews** automatically — no
setup needed. The app also sends **custom events** via the analytics layer
(`src/analytics/`). To see those in Plausible, add each as a **custom event
goal**.

## How to add a goal in Plausible

1. Open your site in Plausible → **Settings** → **Goals** → **+ Add goal**.
2. Goal trigger: **Custom event**.
3. Event name: type the exact event name from the tables below (case-sensitive,
   e.g. `buy_click`).
4. Save. Data appears from the next matching event onward (so after deploy and
   real traffic).

Props are sent automatically with each event. To break a goal down by a prop
(e.g. `buy_click` by `retailer`), use Plausible's **Custom Properties**
feature on a paid plan — the props below are the ones available.

> Source of truth: these names and props are defined in
> `src/analytics/events.ts`. If that file changes, update this doc.

## Priority goals (set these first)

These map directly to revenue and the core funnel.

| Goal (event name) | Why it matters | Props |
|---|---|---|
| `buy_click` | **The money event.** A click through to a retailer. Watch this above all. | `phoneId`, `phoneName`, `retailer`, `priceGBP`, `source` (`results` or `detail`), `matchRank` (1-based, when from results) |
| `quiz_completed` | Someone finished the quiz and saw recommendations. Top of the conversion funnel. | `refined` (answered the extra questions?), `answered` (number of questions answered) |
| `results_viewed` | Recommendations were shown. | `count` (how many results), `shared` (arrived via a shared link?) |

### The funnel to watch

```
pageview (home)  →  quiz_started  →  quiz_completed  →  results_viewed  →  buy_click
```

The drop-off between `quiz_started` and `quiz_completed` tells you if the quiz
is too long; the drop between `results_viewed` and `buy_click` tells you how
compelling the recommendations are.

## Full goal list

### Quiz flow
| Event name | Fires when | Props |
|---|---|---|
| `quiz_started` | User starts the quiz from the landing page | — |
| `quiz_completed` | Results are generated after the quiz | `refined`, `answered` |
| `quiz_restarted` | User restarts from the results page | — |

### Results
| Event name | Fires when | Props |
|---|---|---|
| `results_viewed` | The results page shows recommendations | `count`, `shared` |
| `results_shared` | User taps the share button | — |

### Buy intent (revenue)
| Event name | Fires when | Props |
|---|---|---|
| `buy_click` | User clicks a retailer / "buy" link | `phoneId`, `phoneName`, `retailer`, `priceGBP`, `source`, `matchRank` |

### Browse & discovery
| Event name | Fires when | Props |
|---|---|---|
| `browse_viewed` | The browse page loads | — |
| `browse_searched` | User searches by name (debounced) | `query` |
| `browse_filtered` | User changes a filter or sort | `brand`, `band`, `tag`, `sort` |
| `phone_viewed` | A phone detail page is viewed | `phoneId`, `phoneName` |
| `favourite_toggled` | User adds/removes a favourite | `phoneId`, `added` (true = added) |

## Suggested minimum setup

If you don't want to add all of them, start with these four:

1. `buy_click` — revenue intent
2. `quiz_completed` — funnel conversion
3. `results_viewed` — reach of recommendations
4. `phone_viewed` — which phones draw interest

## Notes

- **Pageviews are automatic** — don't create a goal for them; Plausible tracks
  them out of the box, including SPA route changes.
- Custom-property breakdowns (e.g. `buy_click` grouped by `retailer` or
  `phoneName`) require a Plausible plan that includes Custom Properties.
- No consent banner is required: Plausible is cookieless and collects no
  personal data.
