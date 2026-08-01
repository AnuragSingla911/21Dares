import type { AppSettings, GameState, SavedProgress } from "../types/game";
import { DEFAULT_SETTINGS } from "../logic/game";

const STORAGE_KEYS = {
  progress: "twenty-one-dares:progress",
  settings: "twenty-one-dares:settings",
  playerNames: "twenty-one-dares:player-names",
} as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveProgress(
  gameState: GameState,
  settings: AppSettings,
): void {
  const payload: SavedProgress = {
    gameState,
    settings,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function loadProgress(): SavedProgress | null {
  const parsed = safeParse<SavedProgress>(
    localStorage.getItem(STORAGE_KEYS.progress),
  );
  if (!parsed?.gameState) return null;

  // Only resume mid-match states
  const resumable = ["playing", "dare", "losing", "round-complete"] as const;
  if (!resumable.includes(parsed.gameState.status as (typeof resumable)[number])) {
    return null;
  }

  return parsed;
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.progress);
  } catch {
    // ignore
  }
}

export function hasSavedProgress(): boolean {
  return loadProgress() !== null;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadSettings(): AppSettings {
  const parsed = safeParse<AppSettings>(
    localStorage.getItem(STORAGE_KEYS.settings),
  );
  if (!parsed) return { ...DEFAULT_SETTINGS };
  return {
    soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    dareTimerSeconds:
      parsed.dareTimerSeconds ?? DEFAULT_SETTINGS.dareTimerSeconds,
  };
}

export type SavedNames = {
  player1: string;
  player2: string;
};

export function savePlayerNames(player1: string, player2: string): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.playerNames,
      JSON.stringify({ player1, player2 } satisfies SavedNames),
    );
  } catch {
    // ignore
  }
}

export function loadPlayerNames(): SavedNames {
  const parsed = safeParse<SavedNames>(
    localStorage.getItem(STORAGE_KEYS.playerNames),
  );
  return {
    player1: parsed?.player1 ?? "",
    player2: parsed?.player2 ?? "",
  };
}

/**
 * Restore a previously saved game state, ensuring required fields exist.
 */
export function restoreGameState(raw: GameState): GameState {
  return {
    ...raw,
    players: raw.players.map((p) => ({
      ...p,
      skippedDares: p.skippedDares ?? 0,
      completedDares: p.completedDares ?? 0,
      failedDares: p.failedDares ?? 0,
      dareSkipsRemaining: p.dareSkipsRemaining ?? 2,
      score: p.score ?? 0,
    })) as [GameState["players"][0], GameState["players"][1]],
    turnHistory: raw.turnHistory ?? [],
    usedDareIds: raw.usedDareIds ?? [],
    lastSpokenNumbers: raw.lastSpokenNumbers ?? [],
    isAnimating: false,
    isComputerThinking: false,
    // If we saved mid-animation/losing, resume at dare or playing
    status:
      raw.status === "losing"
        ? "dare"
        : raw.status === "welcome" || raw.status === "setup"
          ? "playing"
          : raw.status,
  };
}
