import type { Phone } from '../domain/types';

/**
 * Generates a clean, branded placeholder image for a phone as an inline SVG
 * data URI. This renders a stylised phone silhouette with the brand and model,
 * so cards always have a tidy, intentional image with no network dependency.
 *
 * When real product photography becomes available, set `phone.image` to the
 * real URL in phones.json and this generator is simply not used for that entry.
 */

// A friendly, stable colour per brand (falls back to a neutral tone).
const BRAND_COLOURS: Record<string, { bg: string; accent: string }> = {
  Samsung: { bg: '#eef2ff', accent: '#1428a0' },
  Google: { bg: '#e8f0fe', accent: '#4285f4' },
  OnePlus: { bg: '#fdecec', accent: '#eb0028' },
  Motorola: { bg: '#eef7f3', accent: '#5c92fa' },
  Xiaomi: { bg: '#fff1e6', accent: '#ff6900' },
  Nothing: { bg: '#f3f3f3', accent: '#1a1a1a' },
};

const DEFAULT_COLOURS = { bg: '#fff0e4', accent: '#ff6b4a' };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function phoneImageDataUri(phone: Pick<Phone, 'name' | 'brand'>): string {
  const { bg, accent } = BRAND_COLOURS[phone.brand] ?? DEFAULT_COLOURS;
  const brand = escapeXml(phone.brand.toUpperCase());
  // Model = name with the brand prefix removed, for a cleaner label.
  const model = escapeXml(
    phone.name.replace(new RegExp(`^${phone.brand}\\s*`), '').trim() ||
      phone.name,
  );

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${bg}"/>
  <g transform="translate(160 70)">
    <rect x="0" y="0" width="80" height="160" rx="14" fill="#ffffff" stroke="${accent}" stroke-width="3"/>
    <rect x="8" y="12" width="64" height="120" rx="6" fill="${accent}" opacity="0.12"/>
    <circle cx="40" cy="146" r="5" fill="${accent}" opacity="0.5"/>
    <circle cx="58" cy="22" r="7" fill="${accent}" opacity="0.35"/>
  </g>
  <text x="200" y="258" text-anchor="middle" font-family="Nunito, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="${accent}">${brand}</text>
  <text x="200" y="280" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" font-weight="800" fill="#2b2330">${model}</text>
</svg>`.trim();

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
