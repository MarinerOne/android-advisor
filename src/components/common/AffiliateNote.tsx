/**
 * Short inline affiliate disclosure shown near buy buttons. Amazon's
 * Associates Programme requires a clear disclosure wherever affiliate links
 * appear; the site-wide footer carries the full statement.
 */
export function AffiliateNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-ink-soft ${className}`}>
      Affiliate link — we may earn a commission, at no extra cost to you.
    </p>
  );
}
