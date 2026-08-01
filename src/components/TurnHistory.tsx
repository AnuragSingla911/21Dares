import type { TurnRecord } from "../types/game";

type Props = {
  history: TurnRecord[];
};

export function TurnHistory({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-2">
        No turns yet — say a number to begin.
      </p>
    );
  }

  const recent = history.slice(-6).reverse();

  return (
    <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1" aria-label="Turn history">
      {recent.map((turn, i) => (
        <li
          key={`${turn.playerId}-${turn.numbers.join("-")}-${i}`}
          className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm"
        >
          <span className="text-slate-400 truncate">{turn.playerName}</span>
          <span className="font-mono text-cyan-200 tabular-nums">
            {turn.numbers.join(", ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
