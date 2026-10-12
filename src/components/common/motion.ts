import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Motion props for friendly entrance animations.
 *
 * IMPORTANT (SSG/hydration safety): the server-rendered HTML must never start
 * at opacity:0, or content can get stuck invisible if the client animation
 * doesn't run (slow/throttled mobile, interrupted hydration). This caused an
 * intermittent blank-content bug.
 *
 * framer-motion's own guidance for SSR/SSG is to pass `initial={false}` so the
 * element renders directly in its final (visible) state and skips the enter
 * animation entirely. We take that safe route: content is always visible and
 * matches the pre-rendered HTML; motion elsewhere (e.g. hover/press, step
 * transitions) still works. Reduced-motion is honoured too (Req 8.6).
 *
 * Trade-off: we drop the one-time entrance fade in exchange for content that
 * can never get stuck invisible. Correctness over flourish.
 */
export function useFriendlyMotion() {
  const reduced = Boolean(useReducedMotion());
  // Stable across renders; nothing here depends on client/server differences,
  // so SSG output and client hydration always agree.
  const value = useRef({
    reduced,
    // No enter animation: render visible immediately (hydration-safe).
    fadeInUp: { initial: false as const },
    pop: { initial: false as const },
  });

  return value.current;
}
