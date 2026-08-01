import type { CountChoice } from "../logic/counting";
import { getNextNumbers, isValidMove } from "../logic/counting";

type Props = {
  currentNumber: number;
  disabled: boolean;
  onSelect: (count: CountChoice) => void;
};

const LABELS: Record<CountChoice, string> = {
  1: "Say 1 Number",
  2: "Say 2 Numbers",
  3: "Say 3 Numbers",
};

export function TurnControls({ currentNumber, disabled, onSelect }: Props) {
  return (
    <div className="grid gap-3" role="group" aria-label="Turn controls">
      {([1, 2, 3] as const).map((count) => {
        const valid = isValidMove(currentNumber, count);
        const preview = valid ? getNextNumbers(currentNumber, count) : [];
        const isDisabled = disabled || !valid;

        return (
          <button
            key={count}
            type="button"
            className={`turn-btn turn-btn-${count}`}
            disabled={isDisabled}
            onClick={() => onSelect(count)}
            aria-label={
              valid
                ? `${LABELS[count]}: ${preview.join(", ")}`
                : `${LABELS[count]} unavailable`
            }
          >
            <span className="turn-btn-label">{LABELS[count]}</span>
            <span className="turn-btn-preview">
              {valid ? preview.join(", ") : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
