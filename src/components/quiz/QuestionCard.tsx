import type { QuizQuestion } from '../../domain/types';

interface QuestionCardProps {
  question: QuizQuestion;
  selected: string | undefined;
  onSelect: (value: string) => void;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">{question.prompt}</h2>
      {question.hint && (
        <p className="text-ink-soft mb-5">{question.hint}</p>
      )}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="grid gap-3 sm:grid-cols-2"
      >
        {question.options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.value)}
              className={
                'flex items-center gap-3 text-left rounded-lg border-2 px-4 py-4 ' +
                'font-body font-semibold transition-all duration-fast ' +
                'hover:-translate-y-0.5 hover:shadow-soft ' +
                (isSelected
                  ? 'border-primary bg-surface-alt text-ink shadow-soft'
                  : 'border-border bg-surface text-ink')
              }
            >
              {option.emoji && (
                <span className="text-2xl" aria-hidden="true">
                  {option.emoji}
                </span>
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
