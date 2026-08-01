import {
  isConsecutiveSequence,
  isValidMove,
  type CountChoice,
} from "./counting";

const WORD_TO_NUM: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const COUNT_WORDS: Record<string, CountChoice> = {
  one: 1,
  two: 2,
  three: 3,
  "1": 1,
  "2": 2,
  "3": 3,
};

/**
 * Extract spoken numbers from a transcript (e.g. "nine ten" → [9, 10]).
 */
export function extractNumbersFromSpeech(transcript: string): number[] {
  const text = transcript.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const tokens = text.split(/\s+/).filter(Boolean);
  const numbers: number[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i]!;

    if (/^\d+$/.test(token)) {
      numbers.push(Number(token));
      i++;
      continue;
    }

    if (token === "twenty" && tokens[i + 1] === "one") {
      numbers.push(21);
      i += 2;
      continue;
    }

    if (WORD_TO_NUM[token] !== undefined) {
      numbers.push(WORD_TO_NUM[token]!);
      i++;
      continue;
    }

    i++;
  }

  return numbers;
}

/**
 * Parse phrases like "two numbers", "say three", or a lone "2".
 */
export function parseCountPhrase(transcript: string): CountChoice | null {
  const text = transcript.toLowerCase().trim();

  const explicit = text.match(
    /\b(?:say\s+)?(one|two|three|1|2|3)\s*(?:numbers?)?\b/,
  );
  if (explicit?.[1]) {
    const mapped = COUNT_WORDS[explicit[1]];
    if (mapped) return mapped;
  }

  const lone = text.match(/^(one|two|three|1|2|3)$/);
  if (lone?.[1]) {
    const mapped = COUNT_WORDS[lone[1]];
    if (mapped) return mapped;
  }

  return null;
}

/**
 * Turn spoken input into a valid move (1–3 consecutive numbers).
 * Prefers spoken number sequences; falls back to count phrases.
 */
export function parseSpokenTurn(
  transcript: string,
  currentNumber: number,
): CountChoice | null {
  const trimmed = transcript.trim();
  if (!trimmed) return null;

  const numbers = extractNumbersFromSpeech(trimmed);

  if (numbers.length >= 1 && numbers.length <= 3) {
    if (isConsecutiveSequence(currentNumber, numbers)) {
      return numbers.length as CountChoice;
    }
  }

  const count = parseCountPhrase(trimmed);
  if (count && isValidMove(currentNumber, count)) {
    return count;
  }

  return null;
}

/**
 * Map keyboard key to a move count (1, 2, or 3).
 */
export function parseKeyboardTurn(key: string): CountChoice | null {
  if (key === "1" || key === "Digit1") return 1;
  if (key === "2" || key === "Digit2") return 2;
  if (key === "3" || key === "Digit3") return 3;
  return null;
}
