import { describe, it, expect } from 'vitest';
import { encodeAnswers, decodeAnswers } from './share';
import type { QuizAnswers } from './types';

describe('share encode/decode', () => {
  it('round-trips valid answers', () => {
    const answers: QuizAnswers = {
      budget: '400-600',
      primaryUse: 'photography',
      camera: 'high',
      battery: 'medium',
      brand: 'Google',
    };
    const encoded = encodeAnswers(answers);
    expect(decodeAnswers(encoded)).toEqual(answers);
  });

  it('drops unknown question ids and invalid values', () => {
    expect(decodeAnswers('budget.400-600~bogus.xyz~camera.not-a-value')).toEqual(
      { budget: '400-600' },
    );
  });

  it('returns empty answers for empty or missing input', () => {
    expect(decodeAnswers('')).toEqual({});
    expect(decodeAnswers(null)).toEqual({});
    expect(decodeAnswers(undefined)).toEqual({});
  });

  it('only encodes known valid pairs', () => {
    const encoded = encodeAnswers({ budget: '400-600', junk: 'nope' });
    expect(encoded).toBe('budget.400-600');
  });
});
