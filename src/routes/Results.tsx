import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ResultCard } from '../components/results/ResultCard';
import { CompareTable } from '../components/results/CompareTable';
import { ShareButton } from '../components/results/ShareButton';
import { useFriendlyMotion } from '../components/common/motion';
import { useApp } from '../state/AppContext';
import { getPhones } from '../data/phonesRepository';
import { recommend } from '../domain/scoring';
import { decodeAnswers } from '../domain/share';
import { QUESTION_IDS } from '../domain/types';

export function Results() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { fadeInUp } = useFriendlyMotion();
  const [searchParams] = useSearchParams();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // If opened via a shared link (?a=...), load those answers into state once.
  const sharedParam = searchParams.get('a');
  useEffect(() => {
    if (sharedParam) {
      const shared = decodeAnswers(sharedParam);
      if (shared[QUESTION_IDS.budget] !== undefined) {
        dispatch({ type: 'LOAD_SHARED', answers: shared });
      }
    }
  }, [sharedParam, dispatch]);

  const hasCoreAnswers = state.answers[QUESTION_IDS.budget] !== undefined;

  // Guard: no answers and no shared link means a direct hit — send to start.
  useEffect(() => {
    if (!hasCoreAnswers && !sharedParam) navigate('/', { replace: true });
  }, [hasCoreAnswers, sharedParam, navigate]);

  const recommendations = useMemo(
    () => recommend(getPhones(), state.answers),
    [state.answers],
  );

  if (!hasCoreAnswers) return null;

  function toggleCompare(phoneId: string) {
    setCompareIds((ids) =>
      ids.includes(phoneId)
        ? ids.filter((id) => id !== phoneId)
        : [...ids, phoneId],
    );
  }

  function restart() {
    dispatch({ type: 'RESTART' });
    navigate('/', { replace: true });
  }

  function changeAnswers() {
    dispatch({ type: 'BACK' }); // results -> choice
    navigate('/quiz');
  }

  const comparedRecs = recommendations.filter((r) =>
    compareIds.includes(r.phone.id),
  );

  return (
    <div className="flex-1 py-6">
      <motion.div {...fadeInUp} className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">
          🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
          Here are your top matches!
        </h1>
        <p className="text-ink-soft mb-4">
          Picked just for you, best match first.
        </p>
        <ShareButton answers={state.answers} />
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3 items-stretch">
        {recommendations.map((rec, i) => (
          <ResultCard
            key={rec.phone.id}
            recommendation={rec}
            rank={i}
            delay={0.15 * i}
            selected={compareIds.includes(rec.phone.id)}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>

      {comparedRecs.length >= 2 && (
        <div className="mt-8">
          <CompareTable recommendations={comparedRecs} />
        </div>
      )}
      {comparedRecs.length === 1 && (
        <p className="text-center text-sm text-ink-soft mt-6">
          Tick one more phone to compare them side by side.
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
        <Button variant="secondary" onClick={changeAnswers}>
          ← Change my answers
        </Button>
        <Button onClick={restart}>Start over 🔄</Button>
      </div>
    </div>
  );
}
