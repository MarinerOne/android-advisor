import { setAnalyticsProvider } from './analytics';
import { createPlausibleProvider } from './plausible';

/**
 * Wires up the analytics provider on the client. The Plausible script is loaded
 * in index.html; this connects the app's track() layer to it so custom events
 * (e.g. buy_click) are forwarded. Safe no-op on the server.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  const provider = createPlausibleProvider();
  if (provider) setAnalyticsProvider(provider);
}
