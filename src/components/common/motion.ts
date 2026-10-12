import { useReducedMotion } from 'framer-motion';

/**
 * Returns motion props that are automatically neutralised when the user
 * prefers reduced motion (Req 8.6). Components spread the returned props onto
 * framer-motion elements.
 */
export function useFriendlyMotion() {
  const reduced = useReducedMotion();

  return {
    reduced: Boolean(reduced),
    fadeInUp: reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.32, ease: 'easeOut' as const },
        },
    pop: reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.32, ease: 'backOut' as const },
        },
  };
}
