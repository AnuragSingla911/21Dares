import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`glass-panel rounded-2xl p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
