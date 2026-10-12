import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FavouriteButton } from '../components/common/FavouriteButton';
import { AffiliateNote } from '../components/common/AffiliateNote';
import { PhoneTile } from '../components/browse/PhoneTile';
import { useFriendlyMotion } from '../components/common/motion';
import { getPhoneById, getPhones } from '../data/phonesRepository';
import { resolveRetailerLink } from '../data/affiliate';
import { PRICE_BAND_LABELS, type Phone } from '../domain/types';
import { track } from '../analytics/analytics';
import { Seo } from '../seo/Seo';

const SPEC_BARS: { label: string; key: keyof Phone['specs'] }[] = [
  { label: 'Camera', key: 'cameraScore' },
  { label: 'Battery', key: 'batteryScore' },
  { label: 'Performance', key: 'performanceScore' },
];

export function PhoneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fadeInUp } = useFriendlyMotion();

  const phone = useMemo(() => (id ? getPhoneById(id) : undefined), [id]);

  useEffect(() => {
    if (phone) {
      track({
        name: 'phone_viewed',
        props: { phoneId: phone.id, phoneName: phone.name },
      });
    }
  }, [phone]);

  const similar = useMemo(() => {
    if (!phone) return [];
    return getPhones()
      .filter(
        (p) =>
          p.id !== phone.id &&
          (p.priceBand === phone.priceBand ||
            p.tags.some((t) => phone.tags.includes(t))),
      )
      .sort((a, b) => Math.abs(a.priceGBP - phone.priceGBP) - Math.abs(b.priceGBP - phone.priceGBP))
      .slice(0, 4);
  }, [phone]);

  if (!phone) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
        <Seo
          title="Phone not found"
          path={`/phone/${id ?? ''}`}
          noindex
        />
        <div className="text-4xl mb-3" aria-hidden="true">
          🤔
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Phone not found</h1>
        <p className="text-ink-soft mb-5">
          We couldn&apos;t find that phone. It may have been removed.
        </p>
        <Button onClick={() => navigate('/browse')}>Browse all phones</Button>
      </div>
    );
  }

  const bandLabel = PRICE_BAND_LABELS.find((b) => b.band === phone.priceBand)?.label;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: phone.name,
    brand: { '@type': 'Brand', name: phone.brand },
    category: 'Smartphone',
    offers: {
      '@type': 'Offer',
      price: phone.priceGBP,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <motion.div {...fadeInUp} className="flex-1 py-6">
      <Seo
        title={`${phone.name} — specs, price & where to buy`}
        description={`${phone.name} (${phone.brand}): £${phone.priceGBP}, ${phone.specs.screenSize}" screen, ${phone.specs.storageGB}GB. See full specs and find the best UK deal.`}
        path={`/phone/${phone.id}`}
        jsonLd={productJsonLd}
      />
      <button
        onClick={() => navigate(-1)}
        className="text-ink-soft hover:text-ink font-semibold mb-4 transition-colors duration-fast"
      >
        ← Back
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <img
            src={phone.image}
            alt={phone.name}
            className="w-full h-64 object-contain rounded-md bg-surface-alt"
          />
        </Card>

        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-3xl font-bold text-ink">{phone.name}</h1>
            <FavouriteButton phoneId={phone.id} phoneName={phone.name} />
          </div>
          <p className="text-ink-soft mb-3">
            {phone.brand}
            {bandLabel ? ` · ${bandLabel}` : ''}
          </p>
          <p className="text-3xl font-bold text-primary mb-5">
            £{phone.priceGBP}
          </p>

          <div className="space-y-3 mb-6">
            {SPEC_BARS.map((bar) => {
              const value = phone.specs[bar.key] as number;
              return (
                <div key={bar.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-ink">{bar.label}</span>
                    <span className="text-ink-soft">{value}/100</span>
                  </div>
                  <div
                    className="h-2 w-full bg-surface-alt rounded-pill overflow-hidden"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bar.label} score ${value} out of 100`}
                  >
                    <div
                      className="h-full bg-primary rounded-pill"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm mb-6">
            <div className="flex justify-between bg-surface-alt rounded-md px-3 py-2">
              <dt className="text-ink-soft">Screen</dt>
              <dd className="font-semibold text-ink">{phone.specs.screenSize}&quot;</dd>
            </div>
            <div className="flex justify-between bg-surface-alt rounded-md px-3 py-2">
              <dt className="text-ink-soft">Storage</dt>
              <dd className="font-semibold text-ink">{phone.specs.storageGB}GB</dd>
            </div>
          </dl>

          {phone.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {phone.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold rounded-pill bg-surface-alt text-ink-soft px-3 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {phone.retailers
              .filter((r) => r.url)
              .map((link, i) => (
                <a
                  key={link.retailer}
                  href={resolveRetailerLink(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track({
                      name: 'buy_click',
                      props: {
                        phoneId: phone.id,
                        phoneName: phone.name,
                        retailer: link.retailer,
                        priceGBP: phone.priceGBP,
                        source: 'detail',
                      },
                    })
                  }
                  className={
                    'block text-center w-full rounded-pill font-bold px-4 py-3 transition-all duration-fast hover:-translate-y-0.5 ' +
                    (i === 0
                      ? 'bg-primary text-primary-ink hover:shadow-lift'
                      : 'bg-surface border-2 border-border text-ink hover:border-primary')
                  }
                >
                  Buy at {link.retailer} →
                </a>
              ))}
            {phone.retailers.some((r) => r.url) && (
              <AffiliateNote className="pt-1" />
            )}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-ink mb-4">More like this</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {similar.map((p) => (
              <PhoneTile key={p.id} phone={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link
          to="/browse"
          className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
        >
          ← Back to all phones
        </Link>
      </div>
    </motion.div>
  );
}

// --- SSG wiring ---
// Exported so vite-react-ssg pre-renders a static page per phone.
export const Component = PhoneDetail;

export function getStaticPaths(): string[] {
  return getPhones().map((p) => `phone/${p.id}`);
}
