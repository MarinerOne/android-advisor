import rawPhones from './phones.json';
import type { Phone, PriceBand } from '../domain/types';
import { phoneImageDataUri } from './phoneImage';

/**
 * Loads and validates the bundled phone catalogue. Malformed entries are
 * logged and skipped rather than crashing the app (Req 6.4, error handling).
 */

const PRICE_BANDS: PriceBand[] = [
  'under-200',
  '200-400',
  '400-600',
  '600-800',
  '800-plus',
];

function isValidPhone(value: unknown): value is Phone {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  const specs = p.specs as Record<string, unknown> | undefined;

  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.brand === 'string' &&
    typeof p.image === 'string' &&
    typeof p.priceGBP === 'number' &&
    typeof p.priceBand === 'string' &&
    PRICE_BANDS.includes(p.priceBand as PriceBand) &&
    Array.isArray(p.tags) &&
    Array.isArray(p.retailers) &&
    !!specs &&
    typeof specs.cameraScore === 'number' &&
    typeof specs.batteryScore === 'number' &&
    typeof specs.performanceScore === 'number' &&
    typeof specs.screenSize === 'number' &&
    typeof specs.storageGB === 'number'
  );
}

let cache: Phone[] | null = null;

export function getPhones(): Phone[] {
  if (cache) return cache;

  const valid: Phone[] = [];
  for (const entry of rawPhones as unknown[]) {
    if (isValidPhone(entry)) {
      // Fall back to a clean branded placeholder when no real image is set.
      const phone: Phone = entry.image
        ? entry
        : { ...entry, image: phoneImageDataUri(entry) };
      valid.push(phone);
    } else {
      // eslint-disable-next-line no-console
      console.error('Skipping malformed phone entry in catalogue:', entry);
    }
  }

  cache = valid;
  return valid;
}

/** Look up a single phone by id, or undefined if not found. */
export function getPhoneById(id: string): Phone | undefined {
  return getPhones().find((p) => p.id === id);
}

/** All distinct brands in the catalogue, alphabetically sorted. */
export function getBrands(): string[] {
  return [...new Set(getPhones().map((p) => p.brand))].sort();
}

/** All distinct tags in the catalogue, alphabetically sorted. */
export function getTags(): string[] {
  const tags = new Set<string>();
  for (const p of getPhones()) p.tags.forEach((t) => tags.add(t));
  return [...tags].sort();
}
