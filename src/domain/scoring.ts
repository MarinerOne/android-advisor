import {
  QUESTION_IDS,
  type Importance,
  type Phone,
  type PriceBand,
  type QuizAnswers,
  type Recommendation,
} from './types';

/**
 * Pure recommendation engine. Given the catalogue and the user's answers,
 * score every phone, rank them, and return the top three.
 *
 * No React, no I/O — deterministic and unit-testable (Req 5).
 */

const PRICE_BAND_ORDER: PriceBand[] = [
  'under-200',
  '200-400',
  '400-600',
  '600-800',
  '800-plus',
];

const IMPORTANCE_WEIGHT: Record<Importance, number> = {
  low: 0.3,
  medium: 0.7,
  high: 1.2,
};

/** Attribute emphasis per primary-use answer. */
const PRIMARY_USE_WEIGHTS: Record<
  string,
  Partial<Record<keyof Phone['specs'], number>>
> = {
  social: { performanceScore: 0.4, batteryScore: 0.4, cameraScore: 0.3 },
  photography: { cameraScore: 1.0, performanceScore: 0.4 },
  gaming: { performanceScore: 1.0, batteryScore: 0.5 },
  work: { performanceScore: 0.7, batteryScore: 0.6 },
  basics: { batteryScore: 0.7 },
};

const MAX_ATTRIBUTE_CONTRIBUTION = 100;

function bandDistance(a: PriceBand, b: PriceBand): number {
  return Math.abs(PRICE_BAND_ORDER.indexOf(a) - PRICE_BAND_ORDER.indexOf(b));
}

interface ScoredPhone {
  phone: Phone;
  rawScore: number;
  budgetGap: number; // 0 = within budget band
  reasons: string[];
  unmetConstraints: string[];
}

function scorePhone(phone: Phone, answers: QuizAnswers): ScoredPhone {
  const reasons: string[] = [];
  const unmetConstraints: string[] = [];
  let score = 0;

  // --- Budget: a strong constraint, but never fully excludes (Req 5.2, 4.5) ---
  const budgetBand = answers[QUESTION_IDS.budget] as PriceBand | undefined;
  let budgetGap = 0;
  if (budgetBand) {
    budgetGap = bandDistance(phone.priceBand, budgetBand);
    if (budgetGap === 0) {
      score += 120;
      reasons.push('Sits comfortably within your budget');
    } else {
      // Heavy penalty that grows with distance from the chosen band.
      score += Math.max(0, 120 - budgetGap * 55);
      const isAboveBudget =
        PRICE_BAND_ORDER.indexOf(phone.priceBand) >
        PRICE_BAND_ORDER.indexOf(budgetBand);
      if (isAboveBudget) {
        unmetConstraints.push('A little above your budget');
      }
    }
  }

  // --- Primary use: emphasise the attributes that matter for it (Req 5.3) ---
  const primaryUse = answers[QUESTION_IDS.primaryUse];
  const useWeights = (primaryUse && PRIMARY_USE_WEIGHTS[primaryUse]) || {};
  for (const [attr, weight] of Object.entries(useWeights)) {
    const attrValue = phone.specs[attr as keyof Phone['specs']];
    score += (attrValue / MAX_ATTRIBUTE_CONTRIBUTION) * (weight ?? 0) * 60;
  }
  if (primaryUse && phone.tags.includes(primaryUse)) {
    score += 25;
    reasons.push(reasonForUse(primaryUse));
  }

  // --- Camera & battery importance (Req 5.3) ---
  const cameraImp = answers[QUESTION_IDS.camera] as Importance | undefined;
  if (cameraImp) {
    score += (phone.specs.cameraScore / 100) * IMPORTANCE_WEIGHT[cameraImp] * 50;
    if (cameraImp === 'high' && phone.specs.cameraScore >= 80) {
      reasons.push('Standout camera for your photos');
    }
  }
  const batteryImp = answers[QUESTION_IDS.battery] as Importance | undefined;
  if (batteryImp) {
    score +=
      (phone.specs.batteryScore / 100) * IMPORTANCE_WEIGHT[batteryImp] * 50;
    if (batteryImp === 'high' && phone.specs.batteryScore >= 80) {
      reasons.push('Long-lasting battery to keep you going');
    }
  }

  // --- Detailed answers: only applied when present (Req 3.4, 3.5) ---
  const screen = answers[QUESTION_IDS.screenSize];
  if (screen && screen !== 'standard') {
    const big = phone.specs.screenSize >= 6.5;
    const compact = phone.specs.screenSize <= 6.2;
    if ((screen === 'large' && big) || (screen === 'compact' && compact)) {
      score += 20;
      reasons.push(
        screen === 'large' ? 'Roomy screen as you like' : 'Nicely compact',
      );
    }
  }

  const perf = answers[QUESTION_IDS.performance];
  if (perf) {
    const target = perf === 'demanding' ? 85 : perf === 'balanced' ? 65 : 45;
    // Closer to the desired performance level scores higher.
    score += Math.max(0, 30 - Math.abs(phone.specs.performanceScore - target) * 0.4);
  }

  const storage = answers[QUESTION_IDS.storage];
  if (storage) {
    const target = storage === 'heavy' ? 256 : storage === 'medium' ? 128 : 64;
    if (phone.specs.storageGB >= target) {
      score += 15;
    } else {
      score += 5;
    }
  }

  const brand = answers[QUESTION_IDS.brand];
  if (brand && brand !== 'no-preference') {
    if (phone.brand === brand) {
      score += 40;
      reasons.push(`It's a ${brand}, your preferred brand`);
    } else {
      unmetConstraints.push(`Not a ${brand}`);
    }
  }

  return { phone, rawScore: score, budgetGap, reasons, unmetConstraints };
}

function reasonForUse(use: string): string {
  switch (use) {
    case 'photography':
      return 'Built with photography in mind';
    case 'gaming':
      return 'Geared up for smooth gaming';
    case 'work':
      return 'A dependable pick for work';
    case 'social':
      return 'Great for social and browsing';
    case 'basics':
      return 'Simple and reliable for the essentials';
    default:
      return 'A great fit for how you use your phone';
  }
}

/**
 * Rank the catalogue and return the top three recommendations, best first.
 * Deterministic: identical answers always produce identical results (Req 5.4).
 */
export function recommend(
  phones: Phone[],
  answers: QuizAnswers,
): Recommendation[] {
  if (phones.length === 0) return [];

  const scored = phones.map((p) => scorePhone(p, answers));

  const maxRaw = Math.max(...scored.map((s) => s.rawScore), 1);

  scored.sort((a, b) => {
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    // Deterministic tie-breakers: prefer cheaper, then stable id order.
    if (a.phone.priceGBP !== b.phone.priceGBP) {
      return a.phone.priceGBP - b.phone.priceGBP;
    }
    return a.phone.id.localeCompare(b.phone.id);
  });

  const top = scored.slice(0, 3);

  return top.map((s) => {
    const reasons =
      s.reasons.length > 0
        ? s.reasons.slice(0, 3)
        : ['A well-rounded match for your answers'];
    const rec: Recommendation = {
      phone: s.phone,
      // Match score derived from the same total used for ranking (Req 5.5).
      matchScore: Math.round((s.rawScore / maxRaw) * 100),
      reasons,
    };
    if (s.unmetConstraints.length > 0) {
      rec.unmetConstraints = s.unmetConstraints;
    }
    return rec;
  });
}
