import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPlausibleProvider } from './plausible';

describe('createPlausibleProvider', () => {
  beforeEach(() => {
    delete (window as unknown as { plausible?: unknown }).plausible;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards events and props to window.plausible', () => {
    const provider = createPlausibleProvider();
    const spy = vi.fn();
    (window as unknown as { plausible: unknown }).plausible = spy;

    provider!.track('buy_click', { retailer: 'Amazon UK', priceGBP: 499 });

    expect(spy).toHaveBeenCalledWith('buy_click', {
      props: { retailer: 'Amazon UK', priceGBP: 499 },
    });
  });

  it('sends no props object when there are none', () => {
    const provider = createPlausibleProvider();
    const spy = vi.fn();
    (window as unknown as { plausible: unknown }).plausible = spy;

    provider!.track('quiz_started');

    expect(spy).toHaveBeenCalledWith('quiz_started', undefined);
  });

  it('does not throw when window.plausible is absent', () => {
    const provider = createPlausibleProvider();
    expect(() => provider!.track('browse_viewed')).not.toThrow();
  });
});
