import type { Player } from "../types/game";

type Props = {
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
};

export function ScoreBoard({ players, currentPlayerIndex }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Scores">
      {players.map((player, index) => {
        const active = index === currentPlayerIndex;
        return (
          <div
            key={player.id}
            className={`rounded-xl border px-3 py-2 text-center transition ${
              active
                ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "border-white/10 bg-white/5"
            }`}
          >
            <p className="text-xs text-slate-400 truncate">{player.name}</p>
            <p className="font-display text-2xl text-white tabular-nums">
              {player.score}
            </p>
          </div>
        );
      })}
    </div>
  );
}
