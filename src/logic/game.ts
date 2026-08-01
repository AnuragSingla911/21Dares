import type {
  AppSettings,
  ComputerDifficulty,
  GameMode,
  GameState,
  Player,
} from "../types/game";
import type { DareCategoryFilter, DareDifficulty } from "../types/dare";
import { INITIAL_SKIPS } from "./counting";

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  voiceInputEnabled: true,
  dareTimerSeconds: 60,
};

export function createPlayer(
  id: string,
  name: string,
): Player {
  return {
    id,
    name: name.trim(),
    score: 0,
    dareSkipsRemaining: INITIAL_SKIPS,
    completedDares: 0,
    failedDares: 0,
    skippedDares: 0,
  };
}

export type CreateGameOptions = {
  player1Name: string;
  player2Name: string;
  totalRounds: number;
  mode: GameMode;
  computerDifficulty: ComputerDifficulty;
  dareCategory: DareCategoryFilter;
  dareDifficulty: DareDifficulty;
  familyFriendly: boolean;
};

export function createInitialGameState(options: CreateGameOptions): GameState {
  const p2Name =
    options.mode === "computer" ? "Computer" : options.player2Name.trim();

  return {
    players: [
      createPlayer("player-1", options.player1Name),
      createPlayer("player-2", p2Name),
    ],
    currentPlayerIndex: 0,
    startingPlayerIndex: 0,
    currentNumber: 0,
    roundNumber: 1,
    totalRounds: options.totalRounds,
    turnHistory: [],
    usedDareIds: [],
    status: "playing",
    roundLoserId: null,
    currentDareId: null,
    lastSpokenNumbers: [],
    mode: options.mode,
    computerDifficulty: options.computerDifficulty,
    dareCategory: options.dareCategory,
    dareDifficulty: options.dareDifficulty,
    familyFriendly: options.familyFriendly,
    isAnimating: false,
    isComputerThinking: false,
  };
}

/**
 * Award one point to the winner of a round (the non-losing player).
 */
export function awardRoundPoint(
  players: [Player, Player],
  loserId: string,
): [Player, Player] {
  return players.map((player) =>
    player.id === loserId
      ? player
      : { ...player, score: player.score + 1 },
  ) as [Player, Player];
}

/**
 * Reset counting state for a new round, alternating the starter.
 */
export function prepareNextRound(state: GameState): GameState {
  const nextStarter =
    state.startingPlayerIndex === 0 ? (1 as const) : (0 as const);

  return {
    ...state,
    currentNumber: 0,
    roundNumber: state.roundNumber + 1,
    startingPlayerIndex: nextStarter,
    currentPlayerIndex: nextStarter,
    turnHistory: [],
    lastSpokenNumbers: [],
    roundLoserId: null,
    currentDareId: null,
    status: "playing",
    isAnimating: false,
    isComputerThinking: false,
  };
}

/**
 * Determine if the match is over after the current round finishes.
 */
export function isMatchOver(roundNumber: number, totalRounds: number): boolean {
  return roundNumber >= totalRounds;
}

/**
 * Validate player names for setup.
 */
export function validatePlayerNames(
  name1: string,
  name2: string,
  mode: GameMode,
): string | null {
  const n1 = name1.trim();
  const n2 = mode === "computer" ? "Computer" : name2.trim();

  if (!n1) return "Player 1 name is required.";
  if (mode === "local" && !name2.trim()) return "Player 2 name is required.";
  if (n1.length > 20 || n2.length > 20) {
    return "Names must be 20 characters or fewer.";
  }
  if (n1.toLowerCase() === n2.toLowerCase()) {
    return "Players must have different names.";
  }
  return null;
}

/**
 * Get the match winner (highest score). Ties return null.
 */
export function getMatchWinner(
  players: [Player, Player],
): Player | null {
  if (players[0].score === players[1].score) return null;
  return players[0].score > players[1].score ? players[0] : players[1];
}

export function isComputerPlayer(
  state: GameState,
  playerIndex: 0 | 1,
): boolean {
  return state.mode === "computer" && playerIndex === 1;
}
