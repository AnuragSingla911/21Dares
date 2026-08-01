type Props = {
  name: string;
  isComputerThinking?: boolean;
};

export function ActivePlayerBanner({ name, isComputerThinking }: Props) {
  return (
    <div
      className="active-banner"
      role="status"
      aria-live="polite"
    >
      <span className="pulse-dot" aria-hidden="true" />
      <p className="text-sm sm:text-base text-white">
        {isComputerThinking ? (
          <>
            <span className="font-semibold text-cyan-300">{name}</span>
            {" is thinking…"}
          </>
        ) : (
          <>
            <span className="font-semibold text-cyan-300">{name}</span>
            {"'s turn"}
          </>
        )}
      </p>
    </div>
  );
}
