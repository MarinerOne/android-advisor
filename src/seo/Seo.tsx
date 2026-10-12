import { Head } from 'vite-react-ssg';
import { SITE, canonical } from './site';

interface SeoProps {
  title: string;
  description?: string;
  /** Route path for the canonical URL, e.g. "/browse" or "/phone/pixel-8". */
  path: string;
  image?: string;
  /** Optional JSON-LD structured data object (e.g. Product schema). */
  jsonLd?: Record<string, unknown>;
  /** Set true on thin/utility pages we don't want indexed. */
  noindex?: boolean;
}

/**
 * Renders per-page SEO head tags: title, meta description, canonical, Open
 * Graph, Twitter card, and optional JSON-LD. Pre-rendered into the static HTML
 * at build time so crawlers see real metadata on every route.
 */
export function Seo({
  title,
  description = SITE.description,
  path,
  image,
  jsonLd,
  noindex = false,
}: SeoProps) {
  const url = canonical(path);
  const fullTitle =
    title === SITE.name ? title : `${title} | ${SITE.name}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={SITE.locale} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Head>
  );
}
