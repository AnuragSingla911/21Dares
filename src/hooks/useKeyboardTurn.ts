import { useEffect } from "react";
import type { CountChoice } from "../logic/counting";
import { isValidMove } from "../logic/counting";
import { parseKeyboardTurn } from "../logic/parseSpeech";

type Options = {
  enabled: boolean;
  currentNumber: number;
  onMove: (count: CountChoice) => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Listen for keys 1, 2, 3 (and numpad) to make a move.
 */
export function useKeyboardTurn({
  enabled,
  currentNumber,
  onMove,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;

      const count = parseKeyboardTurn(event.key);
      if (!count || !isValidMove(currentNumber, count)) return;

      event.preventDefault();
      onMove(count);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, currentNumber, onMove]);
}
