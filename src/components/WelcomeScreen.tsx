import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Props = {
  onStart: () => void;
  onHowToPlay: () => void;
  onResume?: () => void;
  hasResume: boolean;
  onSettings: () => void;
};

export function WelcomeScreen({
  onStart,
  onHowToPlay,
  onResume,
  hasResume,
  onSettings,
}: Props) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section className="screen-center relative overflow-hidden">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-orbs" aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-md mx-auto px-4 text-center transition-all duration-700 ${
          visible || reduced
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-cyan-300/90 text-sm tracking-[0.25em] uppercase mb-3">
          Party counting challenge
        </p>
        <h1 className="font-display text-5xl sm:text-6xl text-white leading-none">
          <span className="text-gradient">21</span> Dares
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300">
          Count smart. Avoid 21. Or face the dare!
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <button type="button" className="btn-primary btn-lg" onClick={onStart}>
            Start Game
          </button>
          {hasResume && onResume && (
            <button
              type="button"
              className="btn-accent btn-lg"
              onClick={onResume}
            >
              Resume Game
            </button>
          )}
          <button
            type="button"
            className="btn-secondary btn-lg"
            onClick={onHowToPlay}
          >
            How to Play
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={onSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </section>
  );
}
