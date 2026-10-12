import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useFriendlyMotion } from '../components/common/motion';
import { useApp } from '../state/AppContext';

export function Landing() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { fadeInUp } = useFriendlyMotion();

  function start() {
    dispatch({ type: 'START' });
    navigate('/quiz');
  }

  return (
    <motion.div
      {...fadeInUp}
      className="flex-1 flex flex-col items-center justify-center text-center py-10"
    >
      <div className="text-6xl mb-4" aria-hidden="true">
        📱✨
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4 max-w-xl">
        Find the Android phone that&apos;s right for you
      </h1>
      <p className="text-lg text-ink-soft mb-8 max-w-md">
        Answer a few quick questions about how you&apos;ll use it and your
        budget. We&apos;ll match you with three great picks. Takes about a
        minute.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button onClick={start} className="text-lg px-8 py-4">
          Let&apos;s go 🚀
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/browse')}
          className="text-lg px-8 py-4"
        >
          Browse all phones
        </Button>
      </div>
      <p className="text-sm text-ink-soft mt-4">
        No sign-up needed. Just four quick questions.
      </p>
    </motion.div>
  );
}
