/** Canonical site configuration used for SEO (canonical URLs, sitemap, OG). */
export const SITE = {
  name: 'Android Advisor',
  url: 'https://androidadvisor.net',
  description:
    'Find the Android phone that\u2019s right for you. Answer a few quick questions about your budget and how you\u2019ll use it, and get three tailored recommendations.',
  locale: 'en_GB',
  twitter: '@androidadvisor',
} as const;

/** Builds an absolute canonical URL for a route path (e.g. "/browse"). */
export function canonical(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean === '/' ? '' : clean}`;
}
