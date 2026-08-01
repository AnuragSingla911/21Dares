import { describe, expect, it } from "vitest";
import {
  doesMoveReachTwentyOne,
  getNextNumbers,
  getNextStartingPlayer,
  getValidMoves,
  isConsecutiveSequence,
  isValidMove,
  remainingToTwentyOne,
  switchPlayer,
} from "../logic/counting";
import {
  awardRoundPoint,
  createInitialGameState,
  createPlayer,
  getMatchWinner,
  isMatchOver,
  prepareNextRound,
  validatePlayerNames,
} from "../logic/game";
import { getOptimalMove, selectComputerMove } from "../logic/computer";
import { filterDares, markDareUsed, pickRandomDare } from "../logic/dares";
import { DARES } from "../data/dares";
import { restoreGameState } from "../utils/storage";
import type { GameState } from "../types/game";

describe("getNextNumbers", () => {
  it("generates consecutive numbers from the current position", () => {
    expect(getNextNumbers(0, 1)).toEqual([1]);
    expect(getNextNumbers(0, 2)).toEqual([1, 2]);
    expect(getNextNumbers(0, 3)).toEqual([1, 2, 3]);
    expect(getNextNumbers(8, 1)).toEqual([9]);
    expect(getNextNumbers(8, 2)).toEqual([9, 10]);
    expect(getNextNumbers(8, 3)).toEqual([9, 10, 11]);
  });

  it("returns empty array when the move would exceed 21", () => {
    expect(getNextNumbers(19, 3)).toEqual([]);
    expect(getNextNumbers(20, 2)).toEqual([]);
    expect(getNextNumbers(21, 1)).toEqual([]);
  });
});

describe("isValidMove", () => {
  it("allows moves that stay within 1–21", () => {
    expect(isValidMove(0, 1)).toBe(true);
    expect(isValidMove(18, 3)).toBe(true);
    expect(isValidMove(19, 2)).toBe(true);
    expect(isValidMove(20, 1)).toBe(true);
  });

  it("prevents numbers above 21", () => {
    expect(isValidMove(19, 3)).toBe(false);
    expect(isValidMove(20, 2)).toBe(false);
    expect(isValidMove(20, 3)).toBe(false);
  });

  it("disables invalid options near the end", () => {
    expect(getValidMoves(19)).toEqual([1, 2]);
    expect(getValidMoves(20)).toEqual([1]);
  });
});

describe("switchPlayer", () => {
  it("switches between player indices", () => {
    expect(switchPlayer(0)).toBe(1);
    expect(switchPlayer(1)).toBe(0);
  });
});

describe("doesMoveReachTwentyOne", () => {
  it("detects when a move contains 21", () => {
    expect(doesMoveReachTwentyOne([21])).toBe(true);
    expect(doesMoveReachTwentyOne([19, 20, 21])).toBe(true);
    expect(doesMoveReachTwentyOne([20, 21])).toBe(true);
    expect(doesMoveReachTwentyOne([18, 19, 20])).toBe(false);
    expect(doesMoveReachTwentyOne([9, 10])).toBe(false);
  });
});

describe("alternating round starter", () => {
  it("alternates the starting player each round", () => {
    expect(getNextStartingPlayer(0)).toBe(1);
    expect(getNextStartingPlayer(1)).toBe(0);

    const state = createInitialGameState({
      player1Name: "Ada",
      player2Name: "Ben",
      totalRounds: 3,
      mode: "local",
      computerDifficulty: "medium",
      dareCategory: "mixed",
      dareDifficulty: "easy",
      familyFriendly: true,
    });

    expect(state.startingPlayerIndex).toBe(0);
    const round2 = prepareNextRound(state);
    expect(round2.startingPlayerIndex).toBe(1);
    expect(round2.currentPlayerIndex).toBe(1);
    expect(round2.currentNumber).toBe(0);
    expect(round2.roundNumber).toBe(2);

    const round3 = prepareNextRound(round2);
    expect(round3.startingPlayerIndex).toBe(0);
    expect(round3.roundNumber).toBe(3);
  });
});

describe("awardRoundPoint", () => {
  it("awards one point to the non-losing player", () => {
    const players: [ReturnType<typeof createPlayer>, ReturnType<typeof createPlayer>] = [
      createPlayer("player-1", "Ada"),
      createPlayer("player-2", "Ben"),
    ];
    const next = awardRoundPoint(players, "player-1");
    expect(next[0].score).toBe(0);
    expect(next[1].score).toBe(1);

    const next2 = awardRoundPoint(next, "player-2");
    expect(next2[0].score).toBe(1);
    expect(next2[1].score).toBe(1);
  });
});

describe("dare filtering", () => {
  it("filters by category, difficulty, and family-friendly", () => {
    const filtered = filterDares(DARES, {
      category: "fun",
      difficulty: "easy",
      familyFriendly: true,
      usedDareIds: [],
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((d) => d.category === "fun")).toBe(true);
    expect(filtered.every((d) => d.difficulty === "easy")).toBe(true);
    expect(filtered.every((d) => d.familyFriendly)).toBe(true);
  });

  it("excludes used dares and prevents repeats", () => {
    const first = pickRandomDare(DARES, {
      category: "mixed",
      difficulty: "easy",
      familyFriendly: true,
      usedDareIds: [],
    });
    expect(first).not.toBeNull();

    const used = markDareUsed([], first!.id);
    expect(used).toContain(first!.id);

    const remaining = filterDares(DARES, {
      category: "mixed",
      difficulty: "easy",
      familyFriendly: true,
      usedDareIds: used,
    });
    expect(remaining.every((d) => d.id !== first!.id)).toBe(true);
  });

  it("has at least 100 dares", () => {
    expect(DARES.length).toBeGreaterThanOrEqual(100);
  });
});

describe("computer move selection", () => {
  it("only returns valid moves", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      for (const current of [0, 5, 16, 18, 19, 20]) {
        const move = selectComputerMove(current, difficulty);
        expect(isValidMove(current, move)).toBe(true);
      }
    }
  });

  it("uses optimal strategy on hard when possible", () => {
    // From 0, optimal leaves a multiple of 4 → take 1? 0+? 
    // leaveAt % 4 === 0 and leaveAt < 21. From 0: count 0 invalid; 
    // count that makes leaveAt = 4 → count 4 invalid max 3.
    // From 0, none of 1,2,3 leave multiple of 4 (1,2,3). So hard takes smallest non-losing.
    expect(getOptimalMove(0)).toBe(1);

    // From 1, take 3 → leave 4
    expect(getOptimalMove(1)).toBe(3);
    // From 5, take 3 → leave 8
    expect(getOptimalMove(5)).toBe(3);
    // From 17, take 3 → leave 20
    expect(getOptimalMove(17)).toBe(3);
    // From 18, take 2 → leave 20
    expect(getOptimalMove(18)).toBe(2);
    // From 19, take 1 → leave 20
    expect(getOptimalMove(19)).toBe(1);
  });
});

describe("restore saved game state", () => {
  it("restores required fields and clears transient flags", () => {
    const base = createInitialGameState({
      player1Name: "Ada",
      player2Name: "Ben",
      totalRounds: 5,
      mode: "local",
      computerDifficulty: "hard",
      dareCategory: "funny",
      dareDifficulty: "medium",
      familyFriendly: true,
    });

    const dirty: GameState = {
      ...base,
      currentNumber: 12,
      status: "losing",
      isAnimating: true,
      isComputerThinking: true,
      players: [
        { ...base.players[0], score: 2 },
        { ...base.players[1], score: 1 },
      ],
    };

    const restored = restoreGameState(dirty);
    expect(restored.currentNumber).toBe(12);
    expect(restored.status).toBe("dare");
    expect(restored.isAnimating).toBe(false);
    expect(restored.isComputerThinking).toBe(false);
    expect(restored.players[0].score).toBe(2);
    expect(restored.players[1].score).toBe(1);
  });
});

describe("helpers", () => {
  it("validates player names", () => {
    expect(validatePlayerNames("", "Ben", "local")).toMatch(/required/i);
    expect(validatePlayerNames("Ada", "Ada", "local")).toMatch(/different/i);
    expect(validatePlayerNames("Ada", "Ben", "local")).toBeNull();
    expect(validatePlayerNames("Ada", "", "computer")).toBeNull();
  });

  it("detects match over and winner", () => {
    expect(isMatchOver(3, 3)).toBe(true);
    expect(isMatchOver(2, 3)).toBe(false);

    const a = createPlayer("a", "Ada");
    const b = createPlayer("b", "Ben");
    expect(getMatchWinner([{ ...a, score: 2 }, { ...b, score: 1 }])).toEqual({
      ...a,
      score: 2,
    });
    expect(getMatchWinner([{ ...a, score: 1 }, { ...b, score: 1 }])).toBeNull();
  });

  it("checks consecutive sequences and remaining distance", () => {
    expect(isConsecutiveSequence(8, [9, 10, 11])).toBe(true);
    expect(isConsecutiveSequence(8, [9, 11])).toBe(false);
    expect(remainingToTwentyOne(15)).toBe(6);
  });
});
