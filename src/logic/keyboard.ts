import type { CountChoice } from "./counting";

/**
 * Map keyboard key to a move count (1, 2, or 3).
 */
export function parseKeyboardTurn(key: string): CountChoice | null {
  if (key === "1" || key === "Digit1") return 1;
  if (key === "2" || key === "Digit2") return 2;
  if (key === "3" || key === "Digit3") return 3;
  return null;
}
