type Props = {
  open: boolean;
  onClose: () => void;
};

export function HowToPlayModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-lg max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="howto-title" className="font-display text-2xl text-white">
            How to Play
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close how to play"
          >
            ✕
          </button>
        </div>

        <ol className="mt-4 space-y-2 text-sm text-slate-200 list-decimal list-inside">
          <li>Players count from 1 to 21.</li>
          <li>Players take turns.</li>
          <li>
            A player may say one, two, or three consecutive numbers.
          </li>
          <li>Numbers must remain in the correct order.</li>
          <li>The player who says 21 loses the round.</li>
          <li>The losing player must complete a dare.</li>
          <li>The other player receives one point.</li>
          <li>The player with the most points wins the match.</li>
        </ol>

        <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs uppercase tracking-wider text-cyan-300 mb-2">
            Example
          </p>
          <pre className="text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
{`Player 1: 1, 2
Player 2: 3
Player 1: 4, 5, 6
Player 2: 7, 8`}
          </pre>
        </div>

        <button
          type="button"
          className="btn-primary w-full mt-5"
          onClick={onClose}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
