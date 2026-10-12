import { describe, it, expect, vi, afterEach } from 'vitest';
import { track, setAnalyticsProvider } from './analytics';

afterEach(() => setAnalyticsProvider(null));

describe('analytics track', () => {
  it('forwards event name and props to the configured provider', () => {
    const spy = vi.fn();
    setAnalyticsProvider({ track: spy });

    track({
      name: 'buy_click',
      props: {
        phoneId: 'pixel-8',
        phoneName: 'Google Pixel 8',
        retailer: 'Amazon UK',
        priceGBP: 499,
        source: 'results',
        matchRank: 1,
      },
    });

    expect(spy).toHaveBeenCalledWith('buy_click', {
      phoneId: 'pixel-8',
      phoneName: 'Google Pixel 8',
      retailer: 'Amazon UK',
      priceGBP: 499,
      source: 'results',
      matchRank: 1,
    });
  });

  it('passes undefined props for events without a payload', () => {
    const spy = vi.fn();
    setAnalyticsProvider({ track: spy });
    track({ name: 'quiz_started' });
    expect(spy).toHaveBeenCalledWith('quiz_started', undefined);
  });

  it('never throws when a provider misbehaves', () => {
    setAnalyticsProvider({
      track: () => {
        throw new Error('provider boom');
      },
    });
    expect(() => track({ name: 'quiz_restarted' })).not.toThrow();
  });

  it('is a safe no-op when no provider is set', () => {
    setAnalyticsProvider(null);
    expect(() => track({ name: 'browse_viewed' })).not.toThrow();
  });
});
