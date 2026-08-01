import type { GameState } from "../types/game";
import type { CountChoice } from "../logic/counting";
import { remainingToTwentyOne } from "../logic/counting";
import { isComputerPlayer } from "../logic/game";
import { ActivePlayerBanner } from "./ActivePlayerBanner";
import { GlassPanel } from "./GlassPanel";
import { NumberTrack } from "./NumberTrack";
import { ScoreBoard } from "./ScoreBoard";
import { TurnControls } from "./TurnControls";
import { TurnHistory } from "./TurnHistory";

type Props = {
  state: GameState;
  onMove: (count: CountChoice) => void;
  onQuit: () => void;
  onSettings: () => void;
};

export function GameBoard({ state, onMove, onQuit, onSettings }: Props) {
  const active = state.players[state.currentPlayerIndex]!;
  const controlsLocked =
    state.isAnimating ||
    state.isComputerThinking ||
    isComputerPlayer(state, state.currentPlayerIndex) ||
    state.status !== "playing";

  const remaining = remainingToTwentyOne(state.currentNumber);

  return (
    <section className="screen-scroll">
      <div className="w-full max-w-lg mx-auto px-4 py-4 space-y-4">
        <header className="flex items-center justify-between gap-2">
          <button type="button" className="btn-ghost text-sm" onClick={onQuit}>
            ← Menu
          </button>
          <div className="text-center">
            <p className="label-caps">Round</p>
            <p className="font-display text-lg text-white">
              {state.roundNumber}
              <span className="text-slate-500 text-base"> / {state.totalRounds}</span>
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={onSettings}
            aria-label="Open settings"
          >
            ⚙
          </button>
        </header>

        <ScoreBoard
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
        />

        <ActivePlayerBanner
          name={active.name}
          isComputerThinking={state.isComputerThinking}
        />

        <GlassPanel className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="label-caps">Last number</p>
              <p className="font-display text-4xl text-white tabular-nums">
                {state.currentNumber === 0 ? "—" : state.currentNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="label-caps">To 21</p>
              <p className="font-display text-2xl text-amber-300 tabular-nums">
                {remaining}
              </p>
            </div>
          </div>

          <NumberTrack
            currentNumber={state.currentNumber}
            lastSpokenNumbers={state.lastSpokenNumbers}
            isAnimating={state.isAnimating}
          />
        </GlassPanel>

        <TurnControls
          currentNumber={state.currentNumber}
          disabled={controlsLocked}
          onSelect={onMove}
        />

        <GlassPanel>
          <p className="label-caps mb-2">Recent turns</p>
          <TurnHistory history={state.turnHistory} />
        </GlassPanel>
      </div>
    </section>
  );
}
