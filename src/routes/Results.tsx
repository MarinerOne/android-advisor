import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ResultCard } from '../components/results/ResultCard';
import { useFriendlyMotion } from '../components/common/motion';
import { useApp } from '../state/AppContext';
import { getPhones } from '../data/phonesRepository';
import { recommend } from '../domain/scoring';
import { QUESTION_IDS } from '../domain/types';

export function Results() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { fadeInUp } = useFriendlyMotion();

  // Guard: no answers means the user came here directly — send them to start.
  const hasCoreAnswers = state.answers[QUESTION_IDS.budget] !== undefined;

  useEffect(() => {
    if (!hasCoreAnswers) navigate('/', { replace: true });
  }, [hasCoreAnswers, navigate]);

  const recommendations = useMemo(
    () => recommend(getPhones(), state.answers),
    [state.answers],
  );

  if (!hasCoreAnswers) return null;

  function restart() {
    dispatch({ type: 'RESTART' });
    navigate('/', { replace: true });
  }

  function changeAnswers() {
    dispatch({ type: 'BACK' }); // results -> choice
    navigate('/quiz');
  }

  return (
    <div className="flex-1 py-6">
      <motion.div {...fadeInUp} className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">
          🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
          Here are your top matches!
        </h1>
        <p className="text-ink-soft">
          Picked just for you, best match first.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3 items-stretch">
        {recommendations.map((rec, i) => (
          <ResultCard
            key={rec.phone.id}
            recommendation={rec}
            rank={i}
            delay={0.15 * i}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
        <Button variant="secondary" onClick={changeAnswers}>
          ← Change my answers
        </Button>
        <Button onClick={restart}>Start over 🔄</Button>
      </div>
    </div>
  );
}
