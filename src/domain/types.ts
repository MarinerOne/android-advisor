/**
 * Core domain types. Framework-agnostic: no React imports here so this layer
 * stays portable and unit-testable (supports native wrapping, Req 9.2).
 */

export type Importance = 'low' | 'medium' | 'high';

export type PriceBand =
  | 'under-200'
  | '200-400'
  | '400-600'
  | '600-800'
  | '800-plus';

/** A link to a retailer selling a phone. Modelled as data so affiliate
 *  tracking parameters can be layered on later (Req 10.3, 10.6). */
export interface RetailerLink {
  retailer: string;
  url: string;
  /** True when this is a stand-in URL rather than a confirmed product page. */
  isPlaceholder?: boolean;
}

export interface PhoneSpecs {
  /** Normalised 0–100 attribute scores so phones compare consistently. */
  cameraScore: number;
  batteryScore: number;
  performanceScore: number;
  /** Physical screen size in inches. */
  screenSize: number;
  storageGB: number;
}

export interface Phone {
  id: string;
  name: string;
  brand: string;
  image: string;
  priceGBP: number;
  priceBand: PriceBand;
  specs: PhoneSpecs;
  /** Descriptive tags, e.g. "gaming", "photography", "value". */
  tags: string[];
  retailers: RetailerLink[];
}

export type QuestionTier = 'core' | 'detailed';

export interface QuizOption {
  value: string;
  label: string;
  /** Optional friendly emoji/icon shown with the option. */
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  tier: QuestionTier;
  prompt: string;
  /** Short friendly helper line under the prompt. */
  hint?: string;
  options: QuizOption[];
}

/** Map of questionId -> selected option value. */
export type QuizAnswers = Record<string, string>;

export interface Recommendation {
  phone: Phone;
  /** 0–100 match score shown to the user, derived from the ranking total. */
  matchScore: number;
  /** Plain-language "why this fits you" lines. */
  reasons: string[];
  /** Notes where a soft constraint could not be fully met, e.g. budget. */
  unmetConstraints?: string[];
  /** Honest tradeoffs / weaker points, for "why not" transparency. */
  tradeoffs?: string[];
}

/** Known question ids, kept in one place so logic and config stay in sync. */
export const QUESTION_IDS = {
  budget: 'budget',
  primaryUse: 'primaryUse',
  camera: 'camera',
  battery: 'battery',
  screenSize: 'screenSize',
  performance: 'performance',
  storage: 'storage',
  brand: 'brand',
} as const;
