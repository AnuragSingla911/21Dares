import type { DareCategoryFilter, DareDifficulty } from "./dare";

export type Player = {
  id: string;
  name: string;
  score: number;
  dareSkipsRemaining: number;
  completedDares: number;
  failedDares: number;
  skippedDares: number;
};

export type TurnRecord = {
  playerId: string;
  playerName: string;
  numbers: number[];
};

export type GameStatus =
  | "welcome"
  | "setup"
  | "playing"
  | "losing"
  | "dare"
  | "round-complete"
  | "match-complete";

export type GameMode = "local" | "computer";

export type ComputerDifficulty = "easy" | "medium" | "hard";

export type RoundOption = 3 | 5 | 7 | "custom";

export type GameState = {
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  startingPlayerIndex: 0 | 1;
  currentNumber: number;
  roundNumber: number;
  totalRounds: number;
  turnHistory: TurnRecord[];
  usedDareIds: string[];
  status: GameStatus;
  roundLoserId: string | null;
  currentDareId: string | null;
  lastSpokenNumbers: number[];
  mode: GameMode;
  computerDifficulty: ComputerDifficulty;
  dareCategory: DareCategoryFilter;
  dareDifficulty: DareDifficulty;
  familyFriendly: boolean;
  isAnimating: boolean;
  isComputerThinking: boolean;
};

export type AppSettings = {
  soundEnabled: boolean;
  dareTimerSeconds: number;
};

export type SavedProgress = {
  gameState: GameState;
  settings: AppSettings;
  savedAt: number;
};

export type Screen =
  | "welcome"
  | "setup"
  | "playing"
  | "losing"
  | "dare"
  | "round-complete"
  | "match-complete";
