import { CORE_QUESTIONS, DETAILED_QUESTIONS } from '../domain/quiz.config';
import type { QuizAnswers } from '../domain/types';

/**
 * Quiz flow state and transitions. Pure reducer — no side effects — so the
 * flow logic is testable and reusable independent of the UI (Req 9.2).
 */

export type QuizPhase =
  | 'intro' // landing, not started
  | 'core' // answering core questions
  | 'choice' // "see results" vs "refine further"
  | 'detailed' // answering detailed questions
  | 'results';

/** A reserved, anonymous session slot — the seam for future auth (Req 11). */
export interface Session {
  kind: 'anonymous';
}

export interface AppState {
  phase: QuizPhase;
  /** Index into the current question list (core or detailed). */
  currentStep: number;
  answers: QuizAnswers;
  session: Session;
}

export const initialState: AppState = {
  phase: 'intro',
  currentStep: 0,
  answers: {},
  session: { kind: 'anonymous' },
};

export type QuizAction =
  | { type: 'START' }
  | { type: 'ANSWER'; questionId: string; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SEE_RESULTS' }
  | { type: 'REFINE' }
  | { type: 'RESTART' }
  | { type: 'LOAD_SHARED'; answers: QuizAnswers };

export function activeQuestions(phase: QuizPhase) {
  if (phase === 'detailed') return DETAILED_QUESTIONS;
  return CORE_QUESTIONS;
}

export function quizReducer(state: AppState, action: QuizAction): AppState {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'core', currentStep: 0 };

    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };

    case 'NEXT': {
      const questions = activeQuestions(state.phase);
      const current = questions[state.currentStep];
      // Guard: cannot advance without answering the current question (Req 1.5).
      if (!current || state.answers[current.id] === undefined) return state;

      const isLast = state.currentStep >= questions.length - 1;
      if (!isLast) {
        return { ...state, currentStep: state.currentStep + 1 };
      }
      // End of a section.
      if (state.phase === 'core') {
        return { ...state, phase: 'choice' };
      }
      // End of detailed questions -> results.
      return { ...state, phase: 'results' };
    }

    case 'BACK': {
      if (state.phase === 'core') {
        if (state.currentStep === 0) return { ...state, phase: 'intro' };
        return { ...state, currentStep: state.currentStep - 1 };
      }
      if (state.phase === 'choice') {
        // Back to the last core question (answers preserved — Req 1.4).
        return {
          ...state,
          phase: 'core',
          currentStep: CORE_QUESTIONS.length - 1,
        };
      }
      if (state.phase === 'detailed') {
        if (state.currentStep === 0) return { ...state, phase: 'choice' };
        return { ...state, currentStep: state.currentStep - 1 };
      }
      if (state.phase === 'results') {
        // Go back to the choice screen to tweak the path.
        return { ...state, phase: 'choice' };
      }
      return state;
    }

    case 'SEE_RESULTS':
      return { ...state, phase: 'results' };

    case 'REFINE':
      return { ...state, phase: 'detailed', currentStep: 0 };

    case 'RESTART':
      return { ...initialState };

    case 'LOAD_SHARED':
      // Jump straight to results from a shared link, answers preloaded.
      return {
        ...initialState,
        phase: 'results',
        answers: action.answers,
      };

    default:
      return state;
  }
}
