/**
 * Fetches licensed product images for the catalogue from the Amazon Product
 * Advertising API (PA API 5.0) and writes the primary image URL back into
 * src/data/phones.json.
 *
 * WHY A BUILD-TIME SCRIPT (not app runtime):
 *  - PA API credentials are secrets and must NEVER ship in the client bundle.
 *  - Amazon permits displaying PA API product images on your Associate site;
 *    resolving them at build time keeps the app a static bundle.
 *
 * REQUIREMENTS BEFORE THIS RETURNS DATA:
 *  - An approved Amazon Associates (UK) account.
 *  - PA API access, which Amazon grants after your account makes the required
 *    qualifying sales. Until then the API returns an access error and this
 *    script leaves the existing (placeholder) images untouched.
 *
 * CREDENTIALS (environment variables, never committed):
 *  - PAAPI_ACCESS_KEY
 *  - PAAPI_SECRET_KEY
 *  - PAAPI_PARTNER_TAG   (your Associate tag, e.g. androidadvisor-21)
 *
 * Run: PAAPI_ACCESS_KEY=... PAAPI_SECRET_KEY=... PAAPI_PARTNER_TAG=... \
 *        node scripts/fetchAmazonImages.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createHmac, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHONES_PATH = join(__dirname, '..', 'src', 'data', 'phones.json');

// --- UK marketplace configuration ---
const HOST = 'webservices.amazon.co.uk';
const REGION = 'eu-west-1';
const MARKETPLACE = 'www.amazon.co.uk';
const SERVICE = 'ProductAdvertisingAPI';
const PATH = '/paapi5/searchitems';
const TARGET =
  'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

const ACCESS_KEY = process.env.PAAPI_ACCESS_KEY;
const SECRET_KEY = process.env.PAAPI_SECRET_KEY;
const PARTNER_TAG = process.env.PAAPI_PARTNER_TAG;

// Be polite to the API: it is rate-limited (often 1 req/sec for new accounts).
const DELAY_MS = 1200;

function requireCredentials() {
  const missing = [];
  if (!ACCESS_KEY) missing.push('PAAPI_ACCESS_KEY');
  if (!SECRET_KEY) missing.push('PAAPI_SECRET_KEY');
  if (!PARTNER_TAG) missing.push('PAAPI_PARTNER_TAG');
  if (missing.length) {
    console.error(
      `Missing credentials: ${missing.join(', ')}.\n` +
        'Set them as environment variables and re-run. ' +
        'No changes have been made.',
    );
    process.exit(1);
  }
}

// --- AWS Signature Version 4 signing (as PA API 5.0 requires) ---
function hmac(key, data) {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}
function hexHash(data) {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

function sign(payload) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target';
  const payloadHash = hexHash(payload);

  const canonicalRequest = [
    'POST',
    PATH,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    hexHash(canonicalRequest),
  ].join('\n');

  const kDate = hmac(`AWS4${SECRET_KEY}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning)
    .update(stringToSign, 'utf8')
    .digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host: HOST,
    'x-amz-date': amzDate,
    'x-amz-target': TARGET,
    Authorization: authorization,
  };
}

async function searchImage(keywords) {
  const payload = JSON.stringify({
    Keywords: keywords,
    SearchIndex: 'Electronics',
    ItemCount: 1,
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE,
    Resources: ['Images.Primary.Large', 'ItemInfo.Title'],
  });

  const headers = sign(payload);
  const res = await fetch(`https://${HOST}${PATH}`, {
    method: 'POST',
    headers,
    body: payload,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const item = data?.SearchResult?.Items?.[0];
  return item?.Images?.Primary?.Large?.URL ?? null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  requireCredentials();

  const phones = JSON.parse(readFileSync(PHONES_PATH, 'utf8'));
  let updated = 0;
  let failed = 0;

  for (const phone of phones) {
    try {
      const url = await searchImage(phone.name);
      if (url) {
        phone.image = url;
        updated += 1;
        console.log(`✓ ${phone.name}`);
      } else {
        failed += 1;
        console.warn(`· no image found for ${phone.name}`);
      }
    } catch (err) {
      failed += 1;
      console.warn(`✗ ${phone.name}: ${err.message}`);
      // An access/throttle error early usually means the whole run will fail;
      // stop after a few consecutive failures to avoid hammering the API.
      if (failed >= 5 && updated === 0) {
        console.error(
          '\nMultiple failures with no successes. This usually means the ' +
            'Associates account is not yet PA API eligible, or credentials ' +
            'are wrong. Stopping; phones.json left unchanged.',
        );
        return;
      }
    }
    await sleep(DELAY_MS);
  }

  if (updated > 0) {
    writeFileSync(PHONES_PATH, JSON.stringify(phones, null, 2) + '\n', 'utf8');
    console.log(`\nUpdated ${updated} images, ${failed} unresolved.`);
    console.log('phones.json written.');
  } else {
    console.log('\nNo images resolved; phones.json left unchanged.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
