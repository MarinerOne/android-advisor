import { describe, it, expect } from 'vitest';
import { recommend } from './scoring';
import type { Phone, QuizAnswers } from './types';

function makePhone(overrides: Partial<Phone> & { id: string }): Phone {
  return {
    name: overrides.id,
    brand: 'Generic',
    image: '',
    priceGBP: 500,
    priceBand: '400-600',
    specs: {
      cameraScore: 50,
      batteryScore: 50,
      performanceScore: 50,
      screenSize: 6.3,
      storageGB: 128,
    },
    tags: [],
    retailers: [],
    ...overrides,
  };
}

const catalogue: Phone[] = [
  makePhone({
    id: 'budget-a',
    brand: 'Motorola',
    priceGBP: 180,
    priceBand: 'under-200',
    specs: { cameraScore: 40, batteryScore: 85, performanceScore: 35, screenSize: 6.5, storageGB: 64 },
    tags: ['basics', 'value'],
  }),
  makePhone({
    id: 'mid-camera',
    brand: 'Google',
    priceGBP: 500,
    priceBand: '400-600',
    specs: { cameraScore: 90, batteryScore: 60, performanceScore: 65, screenSize: 6.3, storageGB: 128 },
    tags: ['photography'],
  }),
  makePhone({
    id: 'flagship-gaming',
    brand: 'Samsung',
    priceGBP: 950,
    priceBand: '800-plus',
    specs: { cameraScore: 95, batteryScore: 80, performanceScore: 98, screenSize: 6.8, storageGB: 256 },
    tags: ['gaming', 'photography'],
  }),
  makePhone({
    id: 'mid-balanced',
    brand: 'OnePlus',
    priceGBP: 550,
    priceBand: '400-600',
    specs: { cameraScore: 70, batteryScore: 75, performanceScore: 80, screenSize: 6.6, storageGB: 128 },
    tags: ['gaming'],
  }),
];

describe('recommend', () => {
  it('returns exactly three recommendations', () => {
    const answers: QuizAnswers = { budget: '400-600', primaryUse: 'social', camera: 'medium', battery: 'medium' };
    const result = recommend(catalogue, answers);
    expect(result).toHaveLength(3);
  });

  it('ranks a photography flagship highly when camera matters most', () => {
    const answers: QuizAnswers = {
      budget: '800-plus',
      primaryUse: 'photography',
      camera: 'high',
      battery: 'medium',
    };
    const result = recommend(catalogue, answers);
    expect(result[0].phone.id).toBe('flagship-gaming');
    expect(result[0].matchScore).toBe(100);
  });

  it('prioritises phones within the chosen budget band', () => {
    const answers: QuizAnswers = {
      budget: 'under-200',
      primaryUse: 'basics',
      camera: 'low',
      battery: 'high',
    };
    const result = recommend(catalogue, answers);
    expect(result[0].phone.id).toBe('budget-a');
  });

  it('flags phones above budget with an unmet constraint', () => {
    const answers: QuizAnswers = {
      budget: 'under-200',
      primaryUse: 'basics',
      camera: 'low',
      battery: 'high',
    };
    const result = recommend(catalogue, answers);
    const flagship = result.find((r) => r.phone.id === 'flagship-gaming');
    // Flagship may or may not be in top 3, but if present it must be flagged.
    if (flagship) {
      expect(flagship.unmetConstraints).toBeTruthy();
    }
    // The budget phone itself should carry no budget warning.
    const budget = result.find((r) => r.phone.id === 'budget-a');
    expect(budget?.unmetConstraints ?? []).not.toContain('A little above your budget');
  });

  it('is deterministic for identical answers', () => {
    const answers: QuizAnswers = { budget: '400-600', primaryUse: 'gaming', camera: 'medium', battery: 'medium' };
    const a = recommend(catalogue, answers).map((r) => r.phone.id);
    const b = recommend(catalogue, answers).map((r) => r.phone.id);
    expect(a).toEqual(b);
  });

  it('rewards a matching brand preference', () => {
    const base: QuizAnswers = { budget: '400-600', primaryUse: 'social', camera: 'medium', battery: 'medium' };
    const withBrand = recommend(catalogue, { ...base, brand: 'OnePlus' });
    const onePlus = withBrand.find((r) => r.phone.brand === 'OnePlus');
    expect(onePlus).toBeTruthy();
    expect(onePlus!.reasons.some((r) => r.includes('OnePlus'))).toBe(true);
  });

  it('always produces reasons for every recommendation', () => {
    const answers: QuizAnswers = { budget: '400-600', primaryUse: 'work', camera: 'medium', battery: 'medium' };
    const result = recommend(catalogue, answers);
    for (const rec of result) {
      expect(rec.reasons.length).toBeGreaterThan(0);
    }
  });

  it('returns an empty array for an empty catalogue', () => {
    expect(recommend([], { budget: '400-600' })).toEqual([]);
  });
});
