import { ALL_QUESTIONS } from './quiz.config';
import type { QuizAnswers } from './types';

/**
 * Serialises quiz answers to and from a compact URL-safe string so results can
 * be shared via a link or revisited later — no backend or account needed.
 *
 * Format: `questionId:value` pairs joined by `~`. Only known question ids and
 * values are accepted on parse, so a malformed or tampered link degrades
 * gracefully rather than producing junk answers.
 */

const PAIR_SEP = '~';
const KV_SEP = '.';

const VALID_VALUES: Record<string, Set<string>> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.value))]),
);

export function encodeAnswers(answers: QuizAnswers): string {
  return Object.entries(answers)
    .filter(([id, value]) => VALID_VALUES[id]?.has(value))
    .map(([id, value]) => `${id}${KV_SEP}${value}`)
    .join(PAIR_SEP);
}

export function decodeAnswers(encoded: string | null | undefined): QuizAnswers {
  if (!encoded) return {};
  const answers: QuizAnswers = {};
  for (const pair of encoded.split(PAIR_SEP)) {
    const [id, value] = pair.split(KV_SEP);
    if (id && value && VALID_VALUES[id]?.has(value)) {
      answers[id] = value;
    }
  }
  return answers;
}

/** Builds a full shareable URL for the given answers. */
export function buildShareUrl(answers: QuizAnswers): string {
  const encoded = encodeAnswers(answers);
  const { origin, pathname } = window.location;
  // HashRouter route for results, with answers in a query after the hash.
  return `${origin}${pathname}#/results?a=${encodeURIComponent(encoded)}`;
}
