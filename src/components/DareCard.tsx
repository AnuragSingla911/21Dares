import { useState } from "react";
import type { Dare } from "../types/dare";
import type { Player } from "../types/game";
import { CountdownTimer } from "./CountdownTimer";
import { GlassPanel } from "./GlassPanel";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Props = {
  loser: Player;
  dare: Dare | null;
  timerSeconds: number;
  onComplete: () => void;
  onFail: () => void;
  onSkip: () => void;
};

export function DareCard({
  loser,
  dare,
  timerSeconds,
  onComplete,
  onFail,
  onSkip,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const reduced = useReducedMotion();

  const canSkip = loser.dareSkipsRemaining > 0;

  const reveal = () => {
    if (revealed || flipping) return;
    if (reduced) {
      setRevealed(true);
      return;
    }
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 400);
  };

  return (
    <section className="screen-center px-4">
      <div className="w-full max-w-md mx-auto space-y-5">
        <div className="text-center">
          <p className="label-caps text-rose-300">Dare time</p>
          <h2 className="font-display text-3xl text-white mt-1">
            {loser.name}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Skips left: {loser.dareSkipsRemaining}/2
          </p>
        </div>

        <button
          type="button"
          className={`dare-card ${flipping ? "dare-flipping" : ""} ${revealed ? "dare-revealed" : ""}`}
          onClick={reveal}
          aria-label={revealed ? "Dare revealed" : "Tap to reveal your dare"}
          disabled={revealed}
        >
          {!revealed ? (
            <div className="dare-face dare-back">
              <p className="font-display text-2xl text-white">?</p>
              <p className="mt-3 text-sm text-slate-200">
                Tap to reveal your dare
              </p>
            </div>
          ) : (
            <div className="dare-face dare-front">
              {dare ? (
                <>
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    <span className="badge capitalize">{dare.category}</span>
                    <span className="badge badge-amber capitalize">
                      {dare.difficulty}
                    </span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl text-white leading-snug">
                    {dare.text}
                  </p>
                </>
              ) : (
                <p className="text-slate-300">
                  No more unique dares — invent a silly challenge!
                </p>
              )}
            </div>
          )}
        </button>

        {revealed && (
          <GlassPanel className="space-y-4 animate-fade-in">
            <CountdownTimer
              key={`${dare?.id ?? "none"}-${timerSeconds}`}
              seconds={timerSeconds}
              running
            />

            <div className="grid gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={onComplete}
              >
                Completed
              </button>
              <button type="button" className="btn-secondary" onClick={onFail}>
                Failed
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={onSkip}
                disabled={!canSkip}
                title={
                  canSkip
                    ? "Skip this dare"
                    : "No skips remaining"
                }
              >
                Use Skip ({loser.dareSkipsRemaining} left)
              </button>
            </div>
          </GlassPanel>
        )}
      </div>
    </section>
  );
}
