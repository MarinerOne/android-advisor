import { describe, it, expect } from 'vitest';
import { resolveRetailerLink, hasUsableRetailerLink } from './affiliate';

describe('resolveRetailerLink', () => {
  it('appends the Amazon UK affiliate tag', () => {
    const out = resolveRetailerLink({
      retailer: 'Amazon UK',
      url: 'https://www.amazon.co.uk/s?k=Google+Pixel+8',
    });
    const url = new URL(out);
    expect(url.searchParams.get('tag')).toBe('androidadviso-21');
    // Original search term is preserved.
    expect(url.searchParams.get('k')).toBe('Google Pixel 8');
  });

  it('leaves retailers without a configured tag unchanged', () => {
    const original = 'https://store.google.com/gb/product/pixel_8';
    expect(
      resolveRetailerLink({ retailer: 'Google Store', url: original }),
    ).toBe(original);
  });

  it('falls back to the original string for an unparseable URL', () => {
    expect(
      resolveRetailerLink({ retailer: 'Amazon UK', url: 'not a url' }),
    ).toBe('not a url');
  });
});

describe('hasUsableRetailerLink', () => {
  it('is true when at least one link has a url', () => {
    expect(
      hasUsableRetailerLink([
        { retailer: 'X', url: '' },
        { retailer: 'Amazon UK', url: 'https://www.amazon.co.uk/s?k=x' },
      ]),
    ).toBe(true);
  });

  it('is false when no link has a url', () => {
    expect(hasUsableRetailerLink([{ retailer: 'X', url: '' }])).toBe(false);
    expect(hasUsableRetailerLink([])).toBe(false);
  });
});
