interface ProgressBarProps {
  current: number; // 1-based current step
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-ink-soft mb-2">
        <span>
          Question {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-3 w-full bg-surface-alt rounded-pill overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
      >
        <div
          className="h-full bg-primary rounded-pill transition-all duration-base"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
