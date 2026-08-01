import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Props = {
  playerName: string;
};

export function LosingAnimation({ playerName }: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(() => (reduced ? 2 : 0));

  useEffect(() => {
    if (reduced) return;
    const t1 = window.setTimeout(() => setPhase(1), 200);
    const t2 = window.setTimeout(() => setPhase(2), 1100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  return (
    <section className="screen-center px-4 relative overflow-hidden">
      <div className="losing-flash" aria-hidden="true" />
      <div className="relative z-10 text-center max-w-md mx-auto">
        <p
          className={`font-display text-4xl sm:text-5xl text-rose-300 transition-all duration-500 ${
            phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          You said 21!
        </p>
        <p
          className={`mt-6 text-xl sm:text-2xl text-white transition-all duration-500 delay-150 ${
            phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="font-semibold text-amber-300">{playerName}</span>
          , it&apos;s dare time!
        </p>
      </div>
    </section>
  );
}
