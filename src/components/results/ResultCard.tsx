import { motion } from 'framer-motion';
import type { Recommendation } from '../../domain/types';
import { hasUsableRetailerLink, resolveRetailerLink } from '../../data/affiliate';
import { Card } from '../common/Card';
import { useFriendlyMotion } from '../common/motion';

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#fff0e4"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">📱</text></svg>`,
  );

interface ResultCardProps {
  recommendation: Recommendation;
  rank: number; // 0-based; 0 = top pick
  delay: number;
}

export function ResultCard({ recommendation, rank, delay }: ResultCardProps) {
  const { phone, matchScore, reasons, unmetConstraints } = recommendation;
  const { reduced, fadeInUp } = useFriendlyMotion();
  const isTop = rank === 0;
  const buyLink = phone.retailers[0];
  const hasLink = hasUsableRetailerLink(phone.retailers);

  return (
    <motion.div
      {...fadeInUp}
      transition={reduced ? undefined : { duration: 0.32, delay, ease: 'easeOut' }}
    >
      <Card highlighted={isTop} className="h-full flex flex-col">
        {isTop && (
          <span className="self-start mb-3 inline-block rounded-pill bg-primary text-primary-ink text-sm font-bold px-3 py-1">
            🏆 Top match
          </span>
        )}
        <img
          src={phone.image || FALLBACK_IMAGE}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          alt={phone.name}
          className="w-full h-40 object-cover rounded-md mb-4 bg-surface-alt"
        />
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="text-xl font-bold text-ink">{phone.name}</h3>
          <span className="text-lg font-bold text-primary whitespace-nowrap">
            £{phone.priceGBP}
          </span>
        </div>
        <p className="text-sm text-ink-soft mb-3">{phone.brand}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-ink">Match</span>
            <span className="font-bold text-success">{matchScore}%</span>
          </div>
          <div
            className="h-2 w-full bg-surface-alt rounded-pill overflow-hidden"
            role="progressbar"
            aria-valuenow={matchScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${matchScore}% match`}
          >
            <div
              className="h-full bg-success rounded-pill transition-all duration-base"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        <ul className="space-y-1 mb-3 text-sm text-ink">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden="true">✅</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-soft mb-4">
          <dt className="sr-only">Screen</dt>
          <dd>📐 {phone.specs.screenSize}&quot;</dd>
          <dd>💾 {phone.specs.storageGB}GB</dd>
        </dl>

        {unmetConstraints && unmetConstraints.length > 0 && (
          <p className="text-xs text-ink-soft mb-3">
            ⚠️ {unmetConstraints.join(' · ')}
          </p>
        )}

        <div className="mt-auto">
          {hasLink && buyLink ? (
            <a
              href={resolveRetailerLink(buyLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full rounded-pill bg-primary text-primary-ink font-bold px-4 py-3 transition-all duration-fast hover:shadow-lift hover:-translate-y-0.5"
            >
              Buy at {buyLink.retailer} →
            </a>
          ) : (
            <button
              disabled
              className="block w-full rounded-pill bg-surface-alt text-ink-soft font-bold px-4 py-3 cursor-not-allowed"
            >
              Link coming soon
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
