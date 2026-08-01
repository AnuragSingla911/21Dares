import { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;
  running: boolean;
  onComplete?: () => void;
};

export function CountdownTimer({ seconds, running, onComplete }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;

    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, seconds]);

  useEffect(() => {
    if (running && seconds > 0 && remaining === 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [remaining, running, seconds, onComplete]);

  if (seconds <= 0) return null;

  const urgent = remaining <= 10;

  return (
    <div
      className={`text-center font-mono text-lg tabular-nums ${
        urgent ? "text-rose-300" : "text-slate-300"
      }`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {formatTime(remaining)}
    </div>
  );
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
