import type { GameState } from "../types/game";
import { GlassPanel } from "./GlassPanel";

type Props = {
  state: GameState;
  onNext: () => void;
};

export function RoundResult({ state, onNext }: Props) {
  const loser = state.players.find((p) => p.id === state.roundLoserId);
  const winner = state.players.find((p) => p.id !== state.roundLoserId);
  const isLast = state.roundNumber >= state.totalRounds;

  return (
    <section className="screen-center px-4">
      <div className="w-full max-w-md mx-auto space-y-5 text-center">
        <p className="label-caps">Round {state.roundNumber} complete</p>
        <h2 className="font-display text-3xl text-white">
          {winner?.name ?? "Winner"} takes the point!
        </h2>
        <p className="text-slate-400 text-sm">
          {loser?.name} faced the dare.
        </p>

        <GlassPanel>
          <div className="grid grid-cols-2 gap-4">
            {state.players.map((p) => (
              <div key={p.id}>
                <p className="text-xs text-slate-400 truncate">{p.name}</p>
                <p className="font-display text-3xl text-white">{p.score}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <button type="button" className="btn-primary btn-lg w-full" onClick={onNext}>
          {isLast ? "See Final Results" : "Next Round"}
        </button>
      </div>
    </section>
  );
}
