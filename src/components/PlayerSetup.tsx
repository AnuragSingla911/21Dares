import { useMemo, useState, type FormEvent } from "react";
import type {
  ComputerDifficulty,
  GameMode,
  RoundOption,
} from "../types/game";
import type { DareCategoryFilter, DareDifficulty } from "../types/dare";
import type { CreateGameOptions } from "../logic/game";
import { validatePlayerNames } from "../logic/game";
import { loadPlayerNames } from "../utils/storage";
import { GlassPanel } from "./GlassPanel";

type Props = {
  defaults?: Partial<CreateGameOptions>;
  onStart: (options: CreateGameOptions) => void;
  onBack: () => void;
};

const CATEGORIES: { value: DareCategoryFilter; label: string }[] = [
  { value: "fun", label: "Fun" },
  { value: "funny", label: "Funny" },
  { value: "creative", label: "Creative" },
  { value: "friends", label: "Friends" },
  { value: "couples", label: "Couples" },
  { value: "mixed", label: "Mixed" },
];

const DIFFICULTIES: { value: DareDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "bold", label: "Bold" },
];

export function PlayerSetup({ defaults = {}, onStart, onBack }: Props) {
  const saved = useMemo(() => loadPlayerNames(), []);

  const [mode, setMode] = useState<GameMode>(defaults.mode ?? "local");
  const [player1, setPlayer1] = useState(
    defaults.player1Name ?? (saved.player1 || ""),
  );
  const [player2, setPlayer2] = useState(
    defaults.player2Name ?? (saved.player2 || ""),
  );
  const [roundOption, setRoundOption] = useState<RoundOption>(
    defaults.totalRounds === 3 ||
      defaults.totalRounds === 5 ||
      defaults.totalRounds === 7
      ? defaults.totalRounds
      : defaults.totalRounds
        ? "custom"
        : 3,
  );
  const [customRounds, setCustomRounds] = useState(
    typeof defaults.totalRounds === "number" &&
      ![3, 5, 7].includes(defaults.totalRounds)
      ? defaults.totalRounds
      : 4,
  );
  const [dareCategory, setDareCategory] = useState<DareCategoryFilter>(
    defaults.dareCategory ?? "mixed",
  );
  const [dareDifficulty, setDareDifficulty] = useState<DareDifficulty>(
    defaults.dareDifficulty ?? "easy",
  );
  const [familyFriendly, setFamilyFriendly] = useState(
    defaults.familyFriendly ?? true,
  );
  const [computerDifficulty, setComputerDifficulty] =
    useState<ComputerDifficulty>(defaults.computerDifficulty ?? "medium");
  const [error, setError] = useState<string | null>(null);

  const totalRounds =
    roundOption === "custom" ? Math.max(1, Math.min(21, customRounds)) : roundOption;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validatePlayerNames(player1, player2, mode);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    onStart({
      player1Name: player1.trim(),
      player2Name: mode === "computer" ? "Computer" : player2.trim(),
      totalRounds,
      mode,
      computerDifficulty,
      dareCategory,
      dareDifficulty,
      familyFriendly,
    });
  };

  return (
    <section className="screen-scroll">
      <div className="w-full max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <button type="button" className="btn-ghost" onClick={onBack}>
            ← Back
          </button>
          <h1 className="font-display text-2xl text-white">Player Setup</h1>
          <span className="w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassPanel>
            <p className="label-caps mb-3">Game Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={mode === "local"}
                onClick={() => setMode("local")}
                title="Local Two-Player"
                subtitle="Same device"
              />
              <ModeButton
                active={mode === "computer"}
                onClick={() => setMode("computer")}
                title="Vs Computer"
                subtitle="Solo challenge"
              />
            </div>

            {mode === "computer" && (
              <div className="mt-4">
                <p className="label-caps mb-2">Computer Difficulty</p>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`chip flex-1 capitalize ${computerDifficulty === d ? "chip-active" : ""}`}
                      onClick={() => setComputerDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>

          <GlassPanel>
            <label className="block">
              <span className="label-caps">Player 1</span>
              <input
                className="field mt-2"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                placeholder="Enter name"
                maxLength={20}
                autoComplete="off"
                required
              />
            </label>

            {mode === "local" ? (
              <label className="block mt-4">
                <span className="label-caps">Player 2</span>
                <input
                  className="field mt-2"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="Enter name"
                  maxLength={20}
                  autoComplete="off"
                  required
                />
              </label>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Opponent: <span className="text-cyan-300">Computer</span>
              </p>
            )}
          </GlassPanel>

          <GlassPanel>
            <p className="label-caps mb-3">Number of Rounds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([3, 5, 7, "custom"] as const).map((opt) => (
                <button
                  key={String(opt)}
                  type="button"
                  className={`chip ${roundOption === opt ? "chip-active" : ""}`}
                  onClick={() => setRoundOption(opt)}
                >
                  {opt === "custom" ? "Custom" : `Best of ${opt}`}
                </button>
              ))}
            </div>
            {roundOption === "custom" && (
              <label className="block mt-3">
                <span className="text-xs text-slate-400">Rounds (1–21)</span>
                <input
                  type="number"
                  min={1}
                  max={21}
                  className="field mt-1"
                  value={customRounds}
                  onChange={(e) => setCustomRounds(Number(e.target.value))}
                />
              </label>
            )}
          </GlassPanel>

          <GlassPanel>
            <p className="label-caps mb-3">Dare Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`chip ${dareCategory === c.value ? "chip-active" : ""}`}
                  onClick={() => setDareCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <p className="label-caps mt-5 mb-3">Dare Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`chip flex-1 ${dareDifficulty === d.value ? "chip-active" : ""}`}
                  onClick={() => setDareDifficulty(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <label className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-200">
              <span>Family-Friendly Mode</span>
              <input
                type="checkbox"
                className="toggle"
                checked={familyFriendly}
                onChange={(e) => setFamilyFriendly(e.target.checked)}
              />
            </label>
          </GlassPanel>

          {error && (
            <p className="text-sm text-rose-300 text-center" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary btn-lg w-full">
            Let&apos;s Play
          </button>
        </form>
      </div>
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-cyan-400/60 bg-cyan-400/15 text-white"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block text-xs opacity-70 mt-0.5">{subtitle}</span>
    </button>
  );
}
