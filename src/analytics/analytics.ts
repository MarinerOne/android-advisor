import type { AnalyticsEvent } from './events';

/**
 * Provider-agnostic analytics layer.
 *
 * The app only ever calls `track(event)`. Behind it sits a swappable provider,
 * so a specific tool (Plausible, GA4, PostHog, …) can be plugged in later by
 * implementing `AnalyticsProvider` and calling `setAnalyticsProvider()` once at
 * startup — no feature code changes.
 *
 * Privacy-first default: with no provider configured, events are logged to the
 * console in development and are a no-op in production. Nothing is sent
 * anywhere until you deliberately wire up a provider, which keeps us on the
 * right side of UK/EU consent rules until a consent flow is added.
 */

export interface AnalyticsProvider {
  track(name: string, props?: Record<string, unknown>): void;
}

let provider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(p: AnalyticsProvider | null): void {
  provider = p;
}

const isDev =
  typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

export function track(event: AnalyticsEvent): void {
  const props = 'props' in event ? event.props : undefined;

  if (provider) {
    try {
      provider.track(event.name, props as Record<string, unknown> | undefined);
    } catch {
      // Analytics must never break the app.
    }
    return;
  }

  // No provider: visible in dev for debugging, silent in production.
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event.name, props ?? '');
  }
}
