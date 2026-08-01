import { TARGET } from "../logic/counting";

type Props = {
  currentNumber: number;
  lastSpokenNumbers: number[];
  isAnimating?: boolean;
};

export function NumberTrack({
  currentNumber,
  lastSpokenNumbers,
  isAnimating = false,
}: Props) {
  const highlight = new Set(lastSpokenNumbers);

  return (
    <div
      className="number-track"
      role="list"
      aria-label={`Counting progress: ${currentNumber} of ${TARGET}`}
    >
      {Array.from({ length: TARGET }, (_, i) => {
        const n = i + 1;
        const filled = n <= currentNumber && !highlight.has(n);
        const justSaid = highlight.has(n);
        const upcoming = n > currentNumber && !justSaid;
        const isDanger = n === TARGET;

        return (
          <div
            key={n}
            role="listitem"
            className={[
              "number-cell",
              filled ? "number-filled" : "",
              justSaid ? "number-current" : "",
              justSaid && isAnimating ? "number-pop" : "",
              upcoming ? "number-muted" : "",
              isDanger ? "number-danger" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={n === currentNumber ? "step" : undefined}
          >
            {n}
          </div>
        );
      })}
    </div>
  );
}
