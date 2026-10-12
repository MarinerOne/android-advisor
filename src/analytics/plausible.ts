import type { AnalyticsProvider } from './analytics';

/**
 * Plausible analytics adapter.
 *
 * The Plausible script itself is loaded in index.html (<head>), where
 * `plausible.init()` auto-tracks pageviews — including SPA route changes — so
 * no manual pageview handling is needed here.
 *
 * This adapter just forwards our typed custom events to `window.plausible`,
 * attaching our props. If the script isn't present (e.g. blocked), the queue
 * stub installed in index.html harmlessly collects calls.
 */

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, unknown>; callback?: () => void },
) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn & { q?: unknown[]; init?: (o?: unknown) => void };
  }
}

export function createPlausibleProvider(): AnalyticsProvider | null {
  // Browser only — never during static generation.
  if (typeof window === 'undefined') return null;

  return {
    track(name, props) {
      window.plausible?.(name, props ? { props } : undefined);
    },
  };
}
