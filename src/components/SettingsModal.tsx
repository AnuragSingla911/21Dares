import { useId, useState } from "react";
import type { AppSettings } from "../types/game";

type Props = {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => void;
};

export function SettingsModal({ open, settings, onClose, onSave }: Props) {
  if (!open) return null;

  return (
    <SettingsModalInner
      key={`${settings.soundEnabled}-${settings.dareTimerSeconds}`}
      settings={settings}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function SettingsModalInner({
  settings,
  onClose,
  onSave,
}: {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => void;
}) {
  const titleId = useId();
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [dareTimerSeconds, setDareTimerSeconds] = useState(
    settings.dareTimerSeconds,
  );

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-xl text-white">
          Settings
        </h2>

        <label className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Sound (read numbers aloud)</span>
          <input
            type="checkbox"
            className="toggle"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
        </label>

        <label className="mt-4 block text-sm text-slate-200">
          <span className="mb-2 block">Dare timer (seconds)</span>
          <input
            type="range"
            min={0}
            max={120}
            step={15}
            value={dareTimerSeconds}
            onChange={(e) => setDareTimerSeconds(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <span className="mt-1 block text-xs text-slate-400">
            {dareTimerSeconds === 0
              ? "Off"
              : `${dareTimerSeconds} seconds`}
          </span>
        </label>

        <div className="mt-5 flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              onSave({ soundEnabled, dareTimerSeconds });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
