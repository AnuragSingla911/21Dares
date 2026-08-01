import { useEffect } from "react";
import type { GameState, Player } from "../types/game";
import { GlassPanel } from "./GlassPanel";
import { launchConfetti } from "../utils/confetti";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Props = {
  state: GameState;
  winner: Player | null;
  onPlayAgain: () => void;
  onChangePlayers: () => void;
  onChangeSettings: () => void;
};

export function MatchResult({
  state,
  winner,
  onPlayAgain,
  onChangePlayers,
  onChangeSettings,
}: Props) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !winner) return;
    return launchConfetti(3200);
  }, [reduced, winner]);

  const totalCompleted = state.players.reduce(
    (s, p) => s + p.completedDares,
    0,
  );
  const totalFailed = state.players.reduce((s, p) => s + p.failedDares, 0);
  const totalSkipped = state.players.reduce((s, p) => s + p.skippedDares, 0);

  const shareResult = async () => {
    const scoreLine = state.players
      .map((p) => `${p.name} ${p.score}`)
      .join(" – ");
    const text = winner
      ? `Master of Numbers! ${winner.name} won 21 Dares (${scoreLine}).`
      : `21 Dares ended in a tie (${scoreLine}).`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "21 Dares", text });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    } catch {
      alert(text);
    }
  };

  return (
    <section className="screen-center px-4 relative overflow-hidden">
      <div className="hero-glow opacity-60" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-auto space-y-5 text-center">
        <p className="label-caps text-amber-300">Match complete</p>

        {winner ? (
          <>
            <h2 className="font-display text-4xl text-white leading-tight">
              {winner.name}
            </h2>
            <p className="text-slate-300">
              Master of Numbers! {winner.name} avoided 21 and won the match.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-4xl text-white">It&apos;s a Tie!</h2>
            <p className="text-slate-300">
              Both players matched wits — rematch to settle it.
            </p>
          </>
        )}

        <GlassPanel>
          <p className="label-caps mb-3">Final score</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {state.players.map((p) => (
              <div key={p.id}>
                <p className="text-xs text-slate-400 truncate">{p.name}</p>
                <p className="font-display text-3xl text-white">{p.score}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {p.score} round{p.score === 1 ? "" : "s"} won
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center border-t border-white/10 pt-4">
            <Stat label="Completed" value={totalCompleted} />
            <Stat label="Failed" value={totalFailed} />
            <Stat label="Skipped" value={totalSkipped} />
          </div>
        </GlassPanel>

        <div className="flex flex-col gap-2">
          <button type="button" className="btn-primary btn-lg" onClick={onPlayAgain}>
            Play Again
          </button>
          <button type="button" className="btn-secondary" onClick={onChangePlayers}>
            Change Players
          </button>
          <button type="button" className="btn-secondary" onClick={onChangeSettings}>
            Change Settings
          </button>
          <button type="button" className="btn-ghost" onClick={shareResult}>
            Share Result
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}
