type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="modal-panel max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-xl text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`flex-1 ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
