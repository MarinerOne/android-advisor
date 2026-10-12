import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { useFriendlyMotion } from '../components/common/motion';
import { useApp } from '../state/AppContext';
import { activeQuestions } from '../state/quizReducer';
import { CORE_QUESTIONS, DETAILED_QUESTIONS } from '../domain/quiz.config';

export function Quiz() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { reduced } = useFriendlyMotion();

  // If the user lands here without starting, send them to the intro.
  useEffect(() => {
    if (state.phase === 'intro') navigate('/', { replace: true });
    if (state.phase === 'results') navigate('/results', { replace: true });
  }, [state.phase, navigate]);

  if (state.phase === 'choice') {
    return <ChoiceScreen />;
  }

  if (state.phase !== 'core' && state.phase !== 'detailed') {
    return null;
  }

  const questions = activeQuestions(state.phase);
  const question = questions[state.currentStep];
  const selected = question ? state.answers[question.id] : undefined;
  const canAdvance = selected !== undefined;

  // Overall progress across whichever section we're in.
  const total =
    state.phase === 'core' ? CORE_QUESTIONS.length : DETAILED_QUESTIONS.length;

  return (
    <div className="flex-1 flex flex-col py-6">
      <ProgressBar current={state.currentStep + 1} total={total} />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.phase}-${state.currentStep}`}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {question && (
              <QuestionCard
                question={question}
                selected={selected}
                onSelect={(value) =>
                  dispatch({
                    type: 'ANSWER',
                    questionId: question.id,
                    value,
                  })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 pt-8">
        <Button variant="ghost" onClick={() => dispatch({ type: 'BACK' })}>
          ← Back
        </Button>
        <Button
          onClick={() => dispatch({ type: 'NEXT' })}
          disabled={!canAdvance}
        >
          {state.currentStep >= total - 1
            ? state.phase === 'core'
              ? 'Continue'
              : 'See my matches 🎉'
            : 'Next →'}
        </Button>
      </div>
    </div>
  );
}

function ChoiceScreen() {
  const { dispatch } = useApp();
  const { fadeInUp } = useFriendlyMotion();

  return (
    <motion.div
      {...fadeInUp}
      className="flex-1 flex flex-col items-center justify-center text-center py-10"
    >
      <div className="text-5xl mb-4" aria-hidden="true">
        🎯
      </div>
      <h2 className="text-3xl font-bold text-ink mb-3">Nice one!</h2>
      <p className="text-lg text-ink-soft mb-8 max-w-md">
        We&apos;ve got enough to find you some great phones. Want your results
        now, or answer a few more to really dial it in?
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => dispatch({ type: 'SEE_RESULTS' })}>
          Show my matches 🎉
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'REFINE' })}>
          Refine with 4 more
        </Button>
      </div>
      <Button
        variant="ghost"
        className="mt-4"
        onClick={() => dispatch({ type: 'BACK' })}
      >
        ← Back
      </Button>
    </motion.div>
  );
}
