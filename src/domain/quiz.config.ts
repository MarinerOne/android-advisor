import { QUESTION_IDS, type QuizQuestion } from './types';

/**
 * The quiz definition. Four core questions everyone answers, plus four
 * optional "refine further" questions. Copy is intentionally casual and
 * encouraging (Req 8.2).
 */

export const CORE_QUESTIONS: QuizQuestion[] = [
  {
    id: QUESTION_IDS.budget,
    tier: 'core',
    prompt: "What's your budget?",
    hint: 'Roughly how much you want to spend.',
    options: [
      { value: 'under-200', label: 'Under £200', emoji: '🪙' },
      { value: '200-400', label: '£200 – £400', emoji: '💷' },
      { value: '400-600', label: '£400 – £600', emoji: '💶' },
      { value: '600-800', label: '£600 – £800', emoji: '💸' },
      { value: '800-plus', label: '£800+', emoji: '👑' },
    ],
  },
  {
    id: QUESTION_IDS.primaryUse,
    tier: 'core',
    prompt: 'What will you mostly use it for?',
    hint: 'Pick the one that fits you best.',
    options: [
      { value: 'social', label: 'Social & browsing', emoji: '📱' },
      { value: 'photography', label: 'Photos & video', emoji: '📸' },
      { value: 'gaming', label: 'Gaming', emoji: '🎮' },
      { value: 'work', label: 'Work & productivity', emoji: '💼' },
      { value: 'basics', label: 'Calls, texts & the basics', emoji: '☎️' },
    ],
  },
  {
    id: QUESTION_IDS.camera,
    tier: 'core',
    prompt: 'How much do you care about the camera?',
    options: [
      { value: 'low', label: 'Not fussed', emoji: '🤷' },
      { value: 'medium', label: 'Pretty important', emoji: '🙂' },
      { value: 'high', label: 'Make it amazing', emoji: '🤩' },
    ],
  },
  {
    id: QUESTION_IDS.battery,
    tier: 'core',
    prompt: 'How important is battery life?',
    options: [
      { value: 'low', label: 'I charge often anyway', emoji: '🔌' },
      { value: 'medium', label: 'A full day, please', emoji: '🔋' },
      { value: 'high', label: 'Must last and last', emoji: '⚡' },
    ],
  },
];

export const DETAILED_QUESTIONS: QuizQuestion[] = [
  {
    id: QUESTION_IDS.screenSize,
    tier: 'detailed',
    prompt: 'Compact or roomy screen?',
    options: [
      { value: 'compact', label: 'Compact & comfy', emoji: '🤏' },
      { value: 'standard', label: 'No strong preference', emoji: '👌' },
      { value: 'large', label: 'Big & roomy', emoji: '🖐️' },
    ],
  },
  {
    id: QUESTION_IDS.performance,
    tier: 'detailed',
    prompt: 'How demanding are you on performance?',
    options: [
      { value: 'casual', label: 'Casual, everyday stuff', emoji: '🚶' },
      { value: 'balanced', label: 'A good all-rounder', emoji: '🏃' },
      { value: 'demanding', label: 'Fast and powerful', emoji: '🚀' },
    ],
  },
  {
    id: QUESTION_IDS.storage,
    tier: 'detailed',
    prompt: 'How much storage do you need?',
    hint: 'Think photos, apps, games and downloads.',
    options: [
      { value: 'light', label: 'Light — I travel light', emoji: '🪶' },
      { value: 'medium', label: 'Medium — a bit of everything', emoji: '📦' },
      { value: 'heavy', label: 'Loads — I keep everything', emoji: '🗄️' },
    ],
  },
  {
    id: QUESTION_IDS.brand,
    tier: 'detailed',
    prompt: 'Any brand you lean towards?',
    options: [
      { value: 'no-preference', label: 'No preference', emoji: '✨' },
      { value: 'Samsung', label: 'Samsung', emoji: '📘' },
      { value: 'Google', label: 'Google', emoji: '🔵' },
      { value: 'OnePlus', label: 'OnePlus', emoji: '🔴' },
      { value: 'Motorola', label: 'Motorola', emoji: '🟣' },
      { value: 'Xiaomi', label: 'Xiaomi', emoji: '🟠' },
    ],
  },
];

export const ALL_QUESTIONS: QuizQuestion[] = [
  ...CORE_QUESTIONS,
  ...DETAILED_QUESTIONS,
];
