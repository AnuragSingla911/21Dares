/** Target number that loses the round */
export const TARGET = 21;

/** Maximum numbers a player may say in one turn */
export const MAX_COUNT = 3;

/** Dare skips allotted to each player per match */
export const INITIAL_SKIPS = 2;

export type CountChoice = 1 | 2 | 3;

/**
 * Generate the next consecutive numbers from the current position.
 * `currentNumber` is the last number spoken (0 before the game starts).
 */
export function getNextNumbers(
  currentNumber: number,
  count: CountChoice,
): number[] {
  if (!isValidMove(currentNumber, count)) {
    return [];
  }

  const numbers: number[] = [];
  for (let i = 1; i <= count; i++) {
    numbers.push(currentNumber + i);
  }
  return numbers;
}

/**
 * A move is valid when it does not exceed 21 and count is 1–3.
 */
export function isValidMove(
  currentNumber: number,
  count: CountChoice,
): boolean {
  if (count < 1 || count > MAX_COUNT) return false;
  if (currentNumber < 0 || currentNumber >= TARGET) return false;
  return currentNumber + count <= TARGET;
}

/**
 * Returns which count choices are still legal from the current position.
 */
export function getValidMoves(currentNumber: number): CountChoice[] {
  const moves: CountChoice[] = [];
  for (const count of [1, 2, 3] as const) {
    if (isValidMove(currentNumber, count)) {
      moves.push(count);
    }
  }
  return moves;
}

/**
 * True when the spoken sequence includes 21.
 */
export function doesMoveReachTwentyOne(numbers: number[]): boolean {
  return numbers.includes(TARGET);
}

/**
 * Switch to the other player.
 */
export function switchPlayer(currentPlayerIndex: 0 | 1): 0 | 1 {
  return currentPlayerIndex === 0 ? 1 : 0;
}

/**
 * Alternate who starts each round.
 */
export function getNextStartingPlayer(
  previousStartingPlayerIndex: 0 | 1,
): 0 | 1 {
  return switchPlayer(previousStartingPlayerIndex);
}

/**
 * Remaining distance from the last spoken number to 21.
 */
export function remainingToTwentyOne(currentNumber: number): number {
  return Math.max(0, TARGET - currentNumber);
}

/**
 * Validate that numbers form a consecutive ascending sequence
 * starting immediately after `previousNumber`.
 */
export function isConsecutiveSequence(
  previousNumber: number,
  numbers: number[],
): boolean {
  if (numbers.length === 0 || numbers.length > MAX_COUNT) return false;
  return numbers.every((n, i) => n === previousNumber + i + 1);
}
