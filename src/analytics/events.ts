/**
 * Typed analytics event definitions. Keeping the event names and their
 * payloads in one typed place means every `track()` call is checked by the
 * compiler, and the list of what we measure is self-documenting.
 */

export type AnalyticsEvent =
  // --- Quiz flow ---
  | { name: 'quiz_started' }
  | { name: 'quiz_completed'; props: { refined: boolean; answered: number } }
  | { name: 'quiz_restarted' }
  // --- Results ---
  | { name: 'results_viewed'; props: { count: number; shared: boolean } }
  | { name: 'results_shared' }
  // --- The revenue event: a click through to a retailer ---
  | {
      name: 'buy_click';
      props: {
        phoneId: string;
        phoneName: string;
        retailer: string;
        priceGBP: number;
        source: 'results' | 'detail';
        matchRank?: number; // 1-based rank when from results
      };
    }
  // --- Browse / discovery ---
  | { name: 'browse_viewed' }
  | { name: 'browse_searched'; props: { query: string } }
  | {
      name: 'browse_filtered';
      props: { brand: string; band: string; tag: string; sort: string };
    }
  | { name: 'phone_viewed'; props: { phoneId: string; phoneName: string } }
  | {
      name: 'favourite_toggled';
      props: { phoneId: string; added: boolean };
    };

export type AnalyticsEventName = AnalyticsEvent['name'];
