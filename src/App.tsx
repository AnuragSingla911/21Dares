import { useState } from "react";
import { useGame } from "./hooks/useGame";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { PlayerSetup } from "./components/PlayerSetup";
import { HowToPlayModal } from "./components/HowToPlayModal";
import { SettingsModal } from "./components/SettingsModal";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { GameBoard } from "./components/GameBoard";
import { LosingAnimation } from "./components/LosingAnimation";
import { DareCard } from "./components/DareCard";
import { RoundResult } from "./components/RoundResult";
import { MatchResult } from "./components/MatchResult";
import { getDareById } from "./data/dares";

export default function App() {
  const game = useGame();
  const [howToOpen, setHowToOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quitConfirm, setQuitConfirm] = useState(false);

  const loser =
    game.gameState?.roundLoserId != null
      ? game.gameState.players.find(
          (p) => p.id === game.gameState!.roundLoserId,
        )
      : undefined;

  const currentDare = game.gameState?.currentDareId
    ? getDareById(game.gameState.currentDareId) ?? null
    : null;

  return (
    <div className="app-shell">
      {game.screen === "welcome" && (
        <WelcomeScreen
          hasResume={game.hasResume}
          onStart={() => game.goSetup()}
          onResume={game.resumeGame}
          onHowToPlay={() => setHowToOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {game.screen === "setup" && (
        <PlayerSetup
          defaults={game.setupDefaults}
          onStart={game.startGame}
          onBack={game.goWelcome}
        />
      )}

      {game.screen === "playing" && game.gameState && (
        <GameBoard
          state={game.gameState}
          onMove={game.applyMove}
          onQuit={() => setQuitConfirm(true)}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {game.screen === "losing" && loser && (
        <LosingAnimation playerName={loser.name} />
      )}

      {game.screen === "dare" && loser && game.gameState && (
        <DareCard
          loser={loser}
          dare={currentDare}
          timerSeconds={game.settings.dareTimerSeconds}
          onComplete={game.completeDare}
          onFail={game.failDare}
          onSkip={game.skipDare}
        />
      )}

      {game.screen === "round-complete" && game.gameState && (
        <RoundResult state={game.gameState} onNext={game.nextRound} />
      )}

      {game.screen === "match-complete" && game.gameState && (
        <MatchResult
          state={game.gameState}
          winner={game.matchWinner}
          onPlayAgain={game.playAgain}
          onChangePlayers={game.changePlayers}
          onChangeSettings={game.changeSettings}
        />
      )}

      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />

      <SettingsModal
        open={settingsOpen}
        settings={game.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={game.updateSettings}
      />

      <ConfirmationModal
        open={quitConfirm}
        title="Leave match?"
        message="Your progress will be saved so you can resume later."
        confirmLabel="Leave"
        cancelLabel="Keep Playing"
        onCancel={() => setQuitConfirm(false)}
        onConfirm={() => {
          setQuitConfirm(false);
          game.quitToWelcome();
        }}
      />
    </div>
  );
}
