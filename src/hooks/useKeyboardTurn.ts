import { useEffect, useRef } from "react";
import type { CountChoice } from "../logic/counting";
import { isValidMove } from "../logic/counting";
import { parseKeyboardTurn } from "../logic/keyboard";

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
 * Single stable keydown listener for keys 1, 2, 3 (and numpad).
 */
export function useKeyboardTurn({
  enabled,
  currentNumber,
  onMove,
}: Options) {
  const enabledRef = useRef(enabled);
  const currentRef = useRef(currentNumber);
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    currentRef.current = currentNumber;
  }, [currentNumber]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;

      const count = parseKeyboardTurn(event.key);
      if (!count || !isValidMove(currentRef.current, count)) return;

      event.preventDefault();
      onMoveRef.current(count);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
