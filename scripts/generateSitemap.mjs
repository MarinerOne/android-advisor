/**
 * Generates public/sitemap.xml listing the indexable routes: home, browse, and
 * every phone detail page. Run as part of the build (see package.json), so the
 * sitemap always matches the current catalogue.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://androidadvisor.net';

const phones = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'phones.json'), 'utf8'),
);

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/browse`, priority: '0.9' },
  ...phones.map((p) => ({
    loc: `${SITE}/phone/${p.id}`,
    priority: '0.7',
  })),
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n') +
  '\n</urlset>\n';

const out = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(out, xml, 'utf8');
console.log(`Wrote sitemap with ${urls.length} URLs to ${out}`);
