import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings, GameState } from "../types/game";
import type { CountChoice } from "../logic/counting";
import {
  doesMoveReachTwentyOne,
  getNextNumbers,
  isValidMove,
  switchPlayer,
} from "../logic/counting";
import {
  awardRoundPoint,
  createInitialGameState,
  DEFAULT_SETTINGS,
  getMatchWinner,
  isComputerPlayer,
  isMatchOver,
  prepareNextRound,
  type CreateGameOptions,
} from "../logic/game";
import { getComputerDelayMs, selectComputerMove } from "../logic/computer";
import { markDareUsed, pickRandomDare } from "../logic/dares";
import { DARES } from "../data/dares";
import {
  clearProgress,
  loadProgress,
  loadSettings,
  restoreGameState,
  savePlayerNames,
  saveProgress,
  saveSettings,
} from "../utils/storage";
import { speakNumbers, cancelSpeech } from "../utils/speech";

const ANIMATION_MS = 650;
const LOSING_MS = 2200;

export function useGame() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<
    | "welcome"
    | "setup"
    | "playing"
    | "losing"
    | "dare"
    | "round-complete"
    | "match-complete"
  >("welcome");
  const [hasResume, setHasResume] = useState(() => loadProgress() !== null);
  const [setupDefaults, setSetupDefaults] = useState<Partial<CreateGameOptions>>(
    {},
  );

  const lockRef = useRef(false);
  const computerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const losingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(gameState);
  const settingsRef = useRef(settings);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Persist progress whenever game is active
  useEffect(() => {
    if (!gameState) return;
    if (
      gameState.status === "playing" ||
      gameState.status === "dare" ||
      gameState.status === "losing" ||
      gameState.status === "round-complete"
    ) {
      saveProgress(gameState, settings);
    }
    if (gameState.status === "match-complete") {
      clearProgress();
    }
  }, [gameState, settings]);

  const clearTimers = useCallback(() => {
    if (computerTimerRef.current) clearTimeout(computerTimerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    if (losingTimerRef.current) clearTimeout(losingTimerRef.current);
    computerTimerRef.current = null;
    animTimerRef.current = null;
    losingTimerRef.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const goWelcome = useCallback(() => {
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    setHasResume(loadProgress() !== null);
    setScreen("welcome");
  }, [clearTimers]);

  const goSetup = useCallback((defaults?: Partial<CreateGameOptions>) => {
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    if (defaults) setSetupDefaults(defaults);
    setScreen("setup");
  }, [clearTimers]);

  const startGame = useCallback((options: CreateGameOptions) => {
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    savePlayerNames(options.player1Name, options.player2Name);
    const state = createInitialGameState(options);
    setGameState(state);
    setSetupDefaults({});
    setHasResume(true);
    setScreen("playing");
  }, [clearTimers]);

  const resumeGame = useCallback(() => {
    const saved = loadProgress();
    if (!saved) return;
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    const restored = restoreGameState(saved.gameState);
    setSettings(saved.settings ?? DEFAULT_SETTINGS);
    setGameState(restored);
    if (restored.status === "dare") setScreen("dare");
    else if (restored.status === "round-complete") setScreen("round-complete");
    else if (restored.status === "match-complete") setScreen("match-complete");
    else setScreen("playing");
  }, [clearTimers]);

  const finishMove = useCallback(
    (prev: GameState, numbers: number[], playerIndex: 0 | 1) => {
      const player = prev.players[playerIndex]!;
      const reached21 = doesMoveReachTwentyOne(numbers);
      const newHistory = [
        ...prev.turnHistory,
        {
          playerId: player.id,
          playerName: player.name,
          numbers,
        },
      ];
      const nextNumber = numbers[numbers.length - 1] ?? prev.currentNumber;

      if (reached21) {
        const scored = awardRoundPoint(prev.players, player.id);
        const dare = pickRandomDare(DARES, {
          category: prev.dareCategory,
          difficulty: prev.dareDifficulty,
          familyFriendly: prev.familyFriendly,
          usedDareIds: prev.usedDareIds,
        });

        return {
          ...prev,
          players: scored,
          currentNumber: nextNumber,
          turnHistory: newHistory,
          lastSpokenNumbers: numbers,
          roundLoserId: player.id,
          currentDareId: dare?.id ?? null,
          usedDareIds: dare
            ? markDareUsed(prev.usedDareIds, dare.id)
            : prev.usedDareIds,
          status: "losing" as const,
          isAnimating: false,
          isComputerThinking: false,
        };
      }

      return {
        ...prev,
        currentNumber: nextNumber,
        currentPlayerIndex: switchPlayer(playerIndex),
        turnHistory: newHistory,
        lastSpokenNumbers: numbers,
        isAnimating: false,
        isComputerThinking: false,
        status: "playing" as const,
      };
    },
    [],
  );

  const applyMove = useCallback(
    (count: CountChoice) => {
      const state = stateRef.current;
      if (!state || state.status !== "playing") return;
      if (lockRef.current || state.isAnimating || state.isComputerThinking) return;
      if (!isValidMove(state.currentNumber, count)) return;

      lockRef.current = true;
      const playerIndex = state.currentPlayerIndex;
      const numbers = getNextNumbers(state.currentNumber, count);

      setGameState((prev) =>
        prev
          ? {
              ...prev,
              isAnimating: true,
              lastSpokenNumbers: numbers,
            }
          : prev,
      );

      speakNumbers(numbers, settingsRef.current.soundEnabled);

      animTimerRef.current = setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return finishMove(prev, numbers, playerIndex);
        });

        losingTimerRef.current = setTimeout(() => {
          const latest = stateRef.current;
          if (latest?.status === "losing") {
            setScreen("losing");
            window.setTimeout(() => {
              setGameState((p) =>
                p ? { ...p, status: "dare" } : p,
              );
              setScreen("dare");
              lockRef.current = false;
            }, LOSING_MS);
          } else {
            lockRef.current = false;
          }
        }, 50);
      }, ANIMATION_MS);
    },
    [finishMove],
  );

  // Computer turn — mark thinking asynchronously to avoid sync setState-in-effect
  useEffect(() => {
    if (!gameState || screen !== "playing") return;
    if (gameState.status !== "playing") return;
    if (gameState.isAnimating) return;
    if (lockRef.current) return;
    if (!isComputerPlayer(gameState, gameState.currentPlayerIndex)) return;

    let cancelled = false;
    const difficulty = gameState.computerDifficulty;

    const thinkTimer = window.setTimeout(() => {
      if (cancelled) return;
      setGameState((prev) =>
        prev ? { ...prev, isComputerThinking: true } : prev,
      );

      const delay = getComputerDelayMs(difficulty);
      computerTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        const current = stateRef.current;
        if (!current || current.status !== "playing") {
          lockRef.current = false;
          return;
        }
        const move = selectComputerMove(
          current.currentNumber,
          current.computerDifficulty,
        );
        setGameState((prev) =>
          prev ? { ...prev, isComputerThinking: false } : prev,
        );
        window.setTimeout(() => {
          if (!cancelled) applyMove(move);
        }, 30);
      }, delay);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(thinkTimer);
      if (computerTimerRef.current) clearTimeout(computerTimerRef.current);
    };
    // Intentionally omit isComputerThinking / full gameState so marking
    // "thinking" does not cancel the scheduled computer move.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gated on turn fields only
  }, [
    gameState?.status,
    gameState?.currentPlayerIndex,
    gameState?.currentNumber,
    gameState?.isAnimating,
    gameState?.mode,
    gameState?.computerDifficulty,
    screen,
    applyMove,
  ]);

  const completeDare = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.roundLoserId) return prev;
      const players = prev.players.map((p) =>
        p.id === prev.roundLoserId
          ? { ...p, completedDares: p.completedDares + 1 }
          : p,
      ) as GameState["players"];
      return { ...prev, players, status: "round-complete" };
    });
    setScreen("round-complete");
  }, []);

  const failDare = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.roundLoserId) return prev;
      const players = prev.players.map((p) =>
        p.id === prev.roundLoserId
          ? { ...p, failedDares: p.failedDares + 1 }
          : p,
      ) as GameState["players"];
      return { ...prev, players, status: "round-complete" };
    });
    setScreen("round-complete");
  }, []);

  const skipDare = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.roundLoserId) return prev;
      const loser = prev.players.find((p) => p.id === prev.roundLoserId);
      if (!loser || loser.dareSkipsRemaining <= 0) return prev;

      const players = prev.players.map((p) =>
        p.id === prev.roundLoserId
          ? {
              ...p,
              dareSkipsRemaining: p.dareSkipsRemaining - 1,
              skippedDares: p.skippedDares + 1,
            }
          : p,
      ) as GameState["players"];

      const dare = pickRandomDare(DARES, {
        category: prev.dareCategory,
        difficulty: prev.dareDifficulty,
        familyFriendly: prev.familyFriendly,
        usedDareIds: prev.usedDareIds,
      });

      return {
        ...prev,
        players,
        currentDareId: dare?.id ?? null,
        usedDareIds: dare
          ? markDareUsed(prev.usedDareIds, dare.id)
          : prev.usedDareIds,
        status: "dare",
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    clearTimers();
    lockRef.current = false;

    const current = stateRef.current;
    const finished =
      current != null && isMatchOver(current.roundNumber, current.totalRounds);

    setGameState((prev) => {
      if (!prev) return prev;
      if (isMatchOver(prev.roundNumber, prev.totalRounds)) {
        return { ...prev, status: "match-complete" };
      }
      return prepareNextRound(prev);
    });

    if (finished) {
      clearProgress();
      setHasResume(false);
      setScreen("match-complete");
    } else {
      setScreen("playing");
    }
  }, [clearTimers]);

  const playAgain = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      goSetup();
      return;
    }
    startGame({
      player1Name: state.players[0].name,
      player2Name: state.mode === "computer" ? "You" : state.players[1].name,
      totalRounds: state.totalRounds,
      mode: state.mode,
      computerDifficulty: state.computerDifficulty,
      dareCategory: state.dareCategory,
      dareDifficulty: state.dareDifficulty,
      familyFriendly: state.familyFriendly,
    });
  }, [goSetup, startGame]);

  const changePlayers = useCallback(() => {
    const state = stateRef.current;
    clearProgress();
    setHasResume(false);
    goSetup({
      mode: state?.mode,
      totalRounds: state?.totalRounds,
      computerDifficulty: state?.computerDifficulty,
      dareCategory: state?.dareCategory,
      dareDifficulty: state?.dareDifficulty,
      familyFriendly: state?.familyFriendly,
    });
  }, [goSetup]);

  const changeSettings = useCallback(() => {
    const state = stateRef.current;
    clearProgress();
    setHasResume(false);
    goSetup({
      player1Name: state?.players[0].name,
      player2Name: state?.mode === "local" ? state.players[1].name : "",
      mode: state?.mode,
      totalRounds: state?.totalRounds,
      computerDifficulty: state?.computerDifficulty,
      dareCategory: state?.dareCategory,
      dareDifficulty: state?.dareDifficulty,
      familyFriendly: state?.familyFriendly,
    });
  }, [goSetup]);

  const quitToWelcome = useCallback(() => {
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    setHasResume(loadProgress() !== null);
    setScreen("welcome");
  }, [clearTimers]);

  const abandonAndWelcome = useCallback(() => {
    clearTimers();
    cancelSpeech();
    lockRef.current = false;
    clearProgress();
    setGameState(null);
    setHasResume(false);
    setScreen("welcome");
  }, [clearTimers]);

  const matchWinner = gameState ? getMatchWinner(gameState.players) : null;

  return {
    screen,
    gameState,
    settings,
    hasResume,
    setupDefaults,
    matchWinner,
    updateSettings,
    goWelcome,
    goSetup,
    startGame,
    resumeGame,
    applyMove,
    completeDare,
    failDare,
    skipDare,
    nextRound,
    playAgain,
    changePlayers,
    changeSettings,
    quitToWelcome,
    abandonAndWelcome,
    setScreen,
  };
}

export type UseGameReturn = ReturnType<typeof useGame>;
