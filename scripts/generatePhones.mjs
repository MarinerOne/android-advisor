/**
 * Phone catalogue generator.
 *
 * Produces src/data/phones.json from the curated MODELS list below. Deriving
 * priceBand, the Amazon UK search link, and the normalised 0-100 attribute
 * scores in code keeps every entry internally consistent and makes the
 * catalogue easy to extend or regenerate.
 *
 * IMPORTANT: prices and raw specs are best-knowledge estimates for the UK
 * market, not live-verified data. Sanity-check before relying on them
 * commercially. Attribute scores are relative judgements that drive matching,
 * not measured benchmarks.
 *
 * Run: node scripts/generatePhones.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'phones.json');

/**
 * Each model: [name, brand, priceGBP, camera, battery, performance,
 * screenSize(in), storageGB, tags[]].
 * camera/battery/performance are relative 0-100 scores.
 */
const MODELS = [
  // ---- Budget: under £200 ----
  ['Moto G24', 'Motorola', 109, 45, 82, 38, 6.56, 128, ['basics', 'value', 'social']],
  ['Moto G04', 'Motorola', 79, 38, 80, 32, 6.56, 64, ['basics', 'value']],
  ['Moto G34 5G', 'Motorola', 149, 48, 83, 48, 6.5, 128, ['value', 'social', 'basics']],
  ['Moto G54 5G', 'Motorola', 199, 58, 88, 55, 6.5, 256, ['value', 'social', 'basics']],
  ['Galaxy A15', 'Samsung', 149, 55, 85, 42, 6.5, 128, ['basics', 'social', 'value']],
  ['Galaxy A05s', 'Samsung', 119, 46, 82, 36, 6.7, 64, ['basics', 'value']],
  ['Galaxy A16 5G', 'Samsung', 179, 56, 86, 46, 6.7, 128, ['value', 'social', 'basics']],
  ['Redmi 13C', 'Xiaomi', 109, 44, 84, 40, 6.74, 128, ['basics', 'value']],
  ['Redmi Note 13', 'Xiaomi', 169, 66, 85, 54, 6.67, 128, ['value', 'social', 'photography']],
  ['Redmi 13', 'Xiaomi', 159, 58, 84, 50, 6.79, 128, ['value', 'social']],
  ['Nokia G42 5G', 'Nokia', 169, 52, 85, 48, 6.56, 128, ['value', 'basics', 'social']],
  ['Nokia C32', 'Nokia', 99, 42, 83, 30, 6.5, 64, ['basics', 'value']],
  ['Realme C67', 'Realme', 169, 60, 84, 52, 6.72, 128, ['value', 'social']],
  ['Realme Note 50', 'Realme', 99, 40, 82, 34, 6.74, 64, ['basics', 'value']],
  ['Honor X8b', 'Honor', 199, 64, 82, 56, 6.7, 256, ['value', 'social', 'photography']],
  ['CMF Phone 1', 'Nothing', 199, 62, 86, 62, 6.67, 128, ['value', 'social', 'gaming']],
  ['Oppo A79 5G', 'Oppo', 189, 56, 85, 52, 6.72, 128, ['value', 'social']],
  ['TCL 50 SE', 'TCL', 129, 48, 84, 42, 6.78, 128, ['basics', 'value']],
  ['Moto G Play 2024', 'Motorola', 99, 40, 83, 34, 6.5, 64, ['basics', 'value']],
  ['Galaxy A14', 'Samsung', 129, 50, 83, 38, 6.6, 64, ['basics', 'value', 'social']],

  // ---- £200-400 ----
  ['Pixel 7a', 'Google', 349, 88, 68, 72, 6.1, 128, ['photography', 'social']],
  ['Pixel 8a', 'Google', 399, 90, 72, 78, 6.1, 128, ['photography', 'social', 'work']],
  ['Galaxy A55 5G', 'Samsung', 389, 72, 82, 68, 6.6, 128, ['social', 'photography', 'value']],
  ['Galaxy A35 5G', 'Samsung', 299, 66, 83, 60, 6.6, 128, ['social', 'value']],
  ['Nothing Phone 2a', 'Nothing', 319, 70, 80, 70, 6.7, 128, ['social', 'value', 'gaming']],
  ['Nothing Phone 2a Plus', 'Nothing', 399, 74, 82, 76, 6.7, 256, ['social', 'gaming', 'photography']],
  ['Redmi Note 13 Pro', 'Xiaomi', 329, 80, 85, 68, 6.67, 256, ['photography', 'social', 'value']],
  ['Poco X6 Pro', 'Xiaomi', 329, 70, 84, 82, 6.67, 256, ['gaming', 'social', 'value']],
  ['Moto Edge 50 Neo', 'Motorola', 349, 76, 84, 70, 6.4, 256, ['social', 'photography', 'value']],
  ['Moto Edge 50 Fusion', 'Motorola', 299, 72, 86, 66, 6.7, 256, ['social', 'value', 'photography']],
  ['Honor 90 Lite', 'Honor', 249, 68, 80, 54, 6.7, 256, ['social', 'value']],
  ['Honor 200 Lite', 'Honor', 299, 74, 80, 60, 6.7, 256, ['social', 'photography', 'value']],
  ['Realme 12 Pro', 'Realme', 329, 76, 85, 68, 6.7, 256, ['photography', 'social', 'value']],
  ['Realme 12+', 'Realme', 279, 72, 86, 66, 6.67, 256, ['social', 'value', 'photography']],
  ['Oppo Reno 11 F', 'Oppo', 329, 72, 84, 62, 6.7, 256, ['social', 'photography']],
  ['Nokia XR21', 'Nokia', 349, 62, 85, 60, 6.49, 128, ['value', 'work', 'basics']],
  ['Galaxy A54 5G', 'Samsung', 329, 70, 83, 64, 6.4, 128, ['social', 'photography', 'value']],
  ['Poco F6', 'Xiaomi', 399, 72, 85, 88, 6.67, 256, ['gaming', 'social', 'value']],
  ['TCL 50 Pro NXTPAPER', 'TCL', 349, 66, 86, 58, 6.8, 256, ['social', 'value']],
  ['Moto G85 5G', 'Motorola', 279, 70, 86, 62, 6.67, 256, ['social', 'value', 'photography']],

  // ---- £400-600 ----
  ['Pixel 8', 'Google', 499, 92, 72, 82, 6.2, 128, ['photography', 'work', 'social']],
  ['Pixel 9', 'Google', 599, 93, 76, 86, 6.3, 128, ['photography', 'work', 'social']],
  ['OnePlus 12R', 'OnePlus', 549, 75, 90, 88, 6.78, 256, ['gaming', 'work', 'social']],
  ['OnePlus Nord 4', 'OnePlus', 449, 76, 88, 84, 6.74, 256, ['social', 'gaming', 'photography']],
  ['Galaxy S24 FE', 'Samsung', 599, 82, 80, 84, 6.7, 128, ['photography', 'gaming', 'work']],
  ['Galaxy A73 5G', 'Samsung', 449, 74, 82, 70, 6.7, 128, ['social', 'photography']],
  ['Nothing Phone 2', 'Nothing', 579, 80, 82, 84, 6.7, 256, ['social', 'gaming', 'photography']],
  ['Xiaomi 14 Lite', 'Xiaomi', 499, 80, 82, 80, 6.55, 256, ['photography', 'social']],
  ['Poco F6 Pro', 'Xiaomi', 549, 78, 84, 92, 6.67, 512, ['gaming', 'work', 'photography']],
  ['Honor 200', 'Honor', 499, 84, 82, 82, 6.7, 256, ['photography', 'social', 'gaming']],
  ['Honor Magic 6 Lite', 'Honor', 399, 72, 90, 64, 6.78, 256, ['social', 'value']],
  ['Motorola Edge 50 Pro', 'Motorola', 499, 82, 84, 80, 6.7, 512, ['photography', 'social', 'work']],
  ['Realme GT 6', 'Realme', 549, 80, 86, 92, 6.78, 256, ['gaming', 'photography', 'work']],
  ['Oppo Reno 12 Pro', 'Oppo', 599, 82, 84, 80, 6.7, 256, ['photography', 'social', 'work']],
  ['Sony Xperia 10 VI', 'Sony', 429, 66, 90, 62, 6.1, 128, ['value', 'basics', 'social']],
  ['Galaxy A72', 'Samsung', 419, 70, 84, 62, 6.7, 128, ['social', 'photography']],
  ['OnePlus Nord CE 4', 'OnePlus', 429, 72, 88, 80, 6.7, 256, ['social', 'gaming', 'value']],
  ['Vivo V40', 'Vivo', 499, 82, 84, 78, 6.78, 256, ['photography', 'social']],
  ['Pixel 7', 'Google', 449, 90, 70, 80, 6.3, 128, ['photography', 'work', 'social']],
  ['Xiaomi 13T', 'Xiaomi', 549, 84, 84, 86, 6.67, 256, ['photography', 'gaming', 'work']],

  // ---- £600-800 ----
  ['Pixel 8 Pro', 'Google', 699, 96, 78, 86, 6.7, 128, ['photography', 'work', 'gaming']],
  ['OnePlus 12', 'OnePlus', 749, 85, 92, 94, 6.82, 256, ['gaming', 'photography', 'work']],
  ['Galaxy S24', 'Samsung', 799, 88, 76, 90, 6.2, 128, ['photography', 'work', 'gaming', 'social']],
  ['Galaxy S23', 'Samsung', 649, 86, 76, 86, 6.1, 128, ['photography', 'work', 'social']],
  ['Xiaomi 14', 'Xiaomi', 799, 90, 83, 95, 6.36, 512, ['photography', 'gaming', 'work']],
  ['Xiaomi 13T Pro', 'Xiaomi', 699, 86, 85, 92, 6.67, 512, ['photography', 'gaming', 'work']],
  ['Honor Magic 6 Pro', 'Honor', 799, 92, 90, 92, 6.8, 512, ['photography', 'gaming', 'work']],
  ['Sony Xperia 5 V', 'Sony', 799, 86, 82, 88, 6.1, 128, ['photography', 'work']],
  ['Nothing Phone 3', 'Nothing', 699, 84, 84, 88, 6.7, 256, ['social', 'gaming', 'photography']],
  ['Oppo Find X7', 'Oppo', 749, 90, 86, 90, 6.78, 256, ['photography', 'gaming', 'work']],
  ['Galaxy Z Flip5', 'Samsung', 799, 84, 72, 88, 6.7, 256, ['photography', 'social']],
  ['Vivo X100', 'Vivo', 799, 92, 88, 92, 6.78, 256, ['photography', 'gaming', 'work']],
  ['Realme GT 6 Pro', 'Realme', 699, 86, 86, 94, 6.78, 512, ['gaming', 'photography', 'work']],
  ['Motorola Edge 50 Ultra', 'Motorola', 699, 86, 86, 88, 6.7, 512, ['photography', 'gaming', 'work']],
  ['Asus Zenfone 11 Ultra', 'Asus', 799, 84, 88, 94, 6.78, 256, ['gaming', 'work', 'photography']],
  ['Pixel 9 (256GB)', 'Google', 699, 93, 76, 86, 6.3, 256, ['photography', 'work', 'social']],
  ['OnePlus 11', 'OnePlus', 699, 84, 88, 90, 6.7, 256, ['gaming', 'photography', 'work']],
  ['Galaxy S23 FE', 'Samsung', 649, 80, 80, 82, 6.4, 128, ['photography', 'social', 'gaming']],
  ['Honor Magic V2 Lite', 'Honor', 699, 80, 86, 82, 6.8, 256, ['social', 'photography']],
  ['Nubia Z60 Ultra', 'ZTE', 699, 86, 90, 94, 6.8, 256, ['gaming', 'photography', 'work']],

  // ---- £800+ ----
  ['Galaxy S24 Ultra', 'Samsung', 1249, 98, 85, 97, 6.8, 256, ['photography', 'gaming', 'work']],
  ['Galaxy S24+', 'Samsung', 999, 90, 82, 92, 6.7, 256, ['photography', 'gaming', 'work']],
  ['Pixel 9 Pro', 'Google', 999, 97, 80, 90, 6.3, 128, ['photography', 'work', 'gaming']],
  ['Pixel 9 Pro XL', 'Google', 1099, 98, 84, 90, 6.8, 256, ['photography', 'work', 'gaming']],
  ['Pixel 9 Pro Fold', 'Google', 1749, 94, 80, 90, 8.0, 256, ['photography', 'work', 'gaming']],
  ['Xiaomi 14 Ultra', 'Xiaomi', 1299, 99, 86, 96, 6.73, 512, ['photography', 'gaming', 'work']],
  ['OnePlus 12 (16GB)', 'OnePlus', 849, 86, 92, 95, 6.82, 512, ['gaming', 'photography', 'work']],
  ['Galaxy Z Fold6', 'Samsung', 1799, 92, 80, 95, 7.6, 256, ['work', 'photography', 'gaming']],
  ['Galaxy Z Flip6', 'Samsung', 1049, 88, 76, 92, 6.7, 256, ['photography', 'social', 'work']],
  ['Sony Xperia 1 VI', 'Sony', 1299, 94, 88, 94, 6.5, 256, ['photography', 'gaming', 'work']],
  ['Honor Magic V3', 'Honor', 1699, 92, 86, 94, 7.92, 512, ['work', 'photography', 'gaming']],
  ['Oppo Find X7 Ultra', 'Oppo', 1099, 97, 88, 94, 6.82, 512, ['photography', 'gaming', 'work']],
  ['Vivo X100 Pro', 'Vivo', 1099, 98, 90, 94, 6.78, 512, ['photography', 'gaming', 'work']],
  ['Asus ROG Phone 8 Pro', 'Asus', 1099, 82, 92, 99, 6.78, 512, ['gaming', 'work']],
  ['Asus ROG Phone 8', 'Asus', 949, 80, 92, 98, 6.78, 256, ['gaming', 'work']],
  ['Nubia RedMagic 9 Pro', 'ZTE', 879, 80, 94, 98, 6.8, 256, ['gaming', 'work']],
  ['Honor Magic 6 Pro (512GB)', 'Honor', 899, 92, 90, 92, 6.8, 512, ['photography', 'gaming', 'work']],
  ['Galaxy S23 Ultra', 'Samsung', 899, 96, 84, 92, 6.8, 256, ['photography', 'gaming', 'work']],
  ['Motorola Razr 50 Ultra', 'Motorola', 999, 84, 78, 90, 6.9, 256, ['photography', 'social', 'work']],
  ['Xiaomi 14 Pro', 'Xiaomi', 899, 94, 85, 96, 6.73, 256, ['photography', 'gaming', 'work']],
];

const bands = [
  { max: 199.99, band: 'under-200' },
  { max: 399.99, band: '200-400' },
  { max: 599.99, band: '400-600' },
  { max: 799.99, band: '600-800' },
  { max: Infinity, band: '800-plus' },
];

function priceBand(price) {
  return bands.find((b) => price <= b.max).band;
}

function slugId(name, brand) {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/\+/g, ' plus ') // keep "S24+" distinct from "S24"
    .replace(/[^a-z0-9]+/g, '-') // ( ) and other punctuation -> separators
    .replace(/^-+|-+$/g, '');
}

function amazonLink(name, brand) {
  const query = encodeURIComponent(`${brand} ${name}`).replace(/%20/g, '+');
  return `https://www.amazon.co.uk/s?k=${query}`;
}

const seenIds = new Set();
const phones = MODELS.map(
  ([name, brand, price, camera, battery, performance, screenSize, storageGB, tags]) => {
    const id = slugId(name, brand);
    if (seenIds.has(id)) {
      throw new Error(`Duplicate id generated: ${id} (${brand} ${name})`);
    }
    seenIds.add(id);

    return {
      id,
      name: `${brand} ${name}`,
      brand,
      image: '',
      priceGBP: price,
      priceBand: priceBand(price),
      specs: {
        cameraScore: camera,
        batteryScore: battery,
        performanceScore: performance,
        screenSize,
        storageGB,
      },
      tags,
      retailers: [{ retailer: 'Amazon UK', url: amazonLink(name, brand) }],
    };
  },
);

writeFileSync(OUT, JSON.stringify(phones, null, 2) + '\n', 'utf8');

// Report a quick summary.
const byBand = {};
for (const p of phones) byBand[p.priceBand] = (byBand[p.priceBand] ?? 0) + 1;
console.log(`Wrote ${phones.length} phones to ${OUT}`);
console.log('By band:', byBand);
