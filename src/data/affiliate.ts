import type { RetailerLink } from '../domain/types';

/**
 * Affiliate seam. In v1 this returns the retailer URL unchanged.
 *
 * Later, a central affiliate configuration (per-retailer referral tags) can be
 * applied here so that adding commission tracking touches only this one
 * function — no UI or recommendation code changes required (Req 10.3, 10.6).
 */

// Future: populate from a config file / remote config.
// e.g. { "Amazon UK": { param: "tag", value: "androidadvisor-21" } }
type AffiliateConfig = Record<string, { param: string; value: string }>;

const affiliateConfig: AffiliateConfig = {};

export function resolveRetailerLink(link: RetailerLink): string {
  const rule = affiliateConfig[link.retailer];
  if (!rule) return link.url;

  try {
    const url = new URL(link.url);
    url.searchParams.set(rule.param, rule.value);
    return url.toString();
  } catch {
    // If the URL can't be parsed, fall back to the original string.
    return link.url;
  }
}

/** Whether a phone has at least one usable (non-empty) retailer link. */
export function hasUsableRetailerLink(links: RetailerLink[]): boolean {
  return links.some((l) => Boolean(l.url));
}
