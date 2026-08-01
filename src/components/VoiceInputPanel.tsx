import { useState } from "react";
import type { CountChoice } from "../logic/counting";
import { isValidMove } from "../logic/counting";
import { parseSpokenTurn } from "../logic/parseSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useKeyboardTurn } from "../hooks/useKeyboardTurn";

type Props = {
  enabled: boolean;
  voiceEnabled: boolean;
  currentNumber: number;
  disabled: boolean;
  onMove: (count: CountChoice) => void;
};

export function VoiceInputPanel({
  enabled,
  voiceEnabled,
  currentNumber,
  disabled,
  onMove,
}: Props) {
  const [unrecognized, setUnrecognized] = useState<string | null>(null);
  const inputActive = enabled && !disabled;

  useKeyboardTurn({
    enabled: inputActive,
    currentNumber,
    onMove,
  });

  const handleSpeech = (transcript: string, isFinal: boolean) => {
    if (!isFinal || !inputActive) return;
    const count = parseSpokenTurn(transcript, currentNumber);
    if (count && isValidMove(currentNumber, count)) {
      setUnrecognized(null);
      onMove(count);
      return;
    }
    setUnrecognized(transcript);
  };

  const speech = useSpeechRecognition({
    enabled: voiceEnabled && inputActive,
    active: inputActive,
    onResult: handleSpeech,
  });

  if (!enabled) return null;

  return (
    <div
      className="voice-panel"
      role="region"
      aria-label="Voice and keyboard input"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps">Voice &amp; keyboard</p>
          <p className="text-sm text-slate-300 mt-1">
            Press <kbd className="kbd">1</kbd> <kbd className="kbd">2</kbd>{" "}
            <kbd className="kbd">3</kbd> or speak your numbers
          </p>
        </div>

        {voiceEnabled && speech.supported && (
          <button
            type="button"
            className={`mic-btn ${speech.isListening ? "mic-btn-active" : ""}`}
            onClick={() =>
              speech.isListening ? speech.stop() : speech.start()
            }
            disabled={disabled}
            aria-label={
              speech.isListening
                ? "Stop listening"
                : "Start voice input"
            }
            title={
              speech.isListening
                ? "Listening… tap to stop"
                : "Tap to speak your numbers"
            }
          >
            <span aria-hidden="true">{speech.isListening ? "🎙" : "🎤"}</span>
          </button>
        )}
      </div>

      {voiceEnabled && !speech.supported && (
        <p className="text-xs text-amber-300/90 mt-2">
          Voice input is not supported in this browser. Use keys 1–3 or the
          buttons below.
        </p>
      )}

      {speech.interimTranscript && (
        <p className="text-sm text-cyan-200 mt-2 truncate" aria-live="polite">
          Hearing: “{speech.interimTranscript}”
        </p>
      )}

      {speech.error && (
        <p className="text-xs text-rose-300 mt-2" role="alert">
          {speech.error}
        </p>
      )}

      {unrecognized && !speech.error && (
        <p className="text-xs text-amber-300/90 mt-2" role="status">
          Could not use “{unrecognized}”. Say the next number(s) in order, or
          press 1–3.
        </p>
      )}

      {voiceEnabled && speech.supported && speech.isListening && !speech.error && (
        <p className="text-xs text-cyan-300/80 mt-2 flex items-center gap-2">
          <span className="pulse-dot" aria-hidden="true" />
          Listening — say the next number(s), e.g. “{currentNumber + 1}” or “
          {currentNumber + 1}, {currentNumber + 2}”
        </p>
      )}
    </div>
  );
}
