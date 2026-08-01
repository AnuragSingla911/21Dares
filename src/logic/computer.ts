import type { ComputerDifficulty } from "../types/game";
import {
  getValidMoves,
  type CountChoice,
  TARGET,
} from "./counting";

/**
 * Optimal strategy for the 21 counting game:
 * Leave the opponent on a multiple of 4 (4, 8, 12, 16, 20).
 * Saying 21 loses, so leaving 20 forces the opponent to take 21.
 */
export function getOptimalMove(currentNumber: number): CountChoice {
  const valid = getValidMoves(currentNumber);
  if (valid.length === 0) {
    return 1;
  }

  // Prefer a move that leaves currentNumber + count ≡ 0 (mod 4)
  for (const count of valid) {
    const leaveAt = currentNumber + count;
    if (leaveAt % 4 === 0 && leaveAt < TARGET) {
      return count;
    }
    // Also take a winning finish if forced? Never willingly take 21.
  }

  // If already on a losing position (multiple of 4), delay the loss
  // by taking the smallest safe move when possible
  const nonLosing = valid.filter((c) => currentNumber + c < TARGET);
  if (nonLosing.length > 0) {
    return nonLosing[0]!;
  }

  return valid[0]!;
}

function getRandomMove(currentNumber: number): CountChoice {
  const valid = getValidMoves(currentNumber);
  if (valid.length === 0) return 1;
  const index = Math.floor(Math.random() * valid.length);
  return valid[index]!;
}

/**
 * Select a computer move based on difficulty.
 * Internal strategy is not exposed to the UI.
 */
export function selectComputerMove(
  currentNumber: number,
  difficulty: ComputerDifficulty,
): CountChoice {
  const valid = getValidMoves(currentNumber);
  if (valid.length === 0) return 1;
  if (valid.length === 1) return valid[0]!;

  switch (difficulty) {
    case "easy":
      return getRandomMove(currentNumber);

    case "medium": {
      // ~55% chance of optimal play
      if (Math.random() < 0.55) {
        return getOptimalMove(currentNumber);
      }
      return getRandomMove(currentNumber);
    }

    case "hard":
      return getOptimalMove(currentNumber);

    default:
      return getRandomMove(currentNumber);
  }
}

/** Brief pause so computer turns feel natural (ms). */
export function getComputerDelayMs(difficulty: ComputerDifficulty): number {
  switch (difficulty) {
    case "easy":
      return 700 + Math.floor(Math.random() * 500);
    case "medium":
      return 900 + Math.floor(Math.random() * 600);
    case "hard":
      return 1100 + Math.floor(Math.random() * 700);
    default:
      return 800;
  }
}
