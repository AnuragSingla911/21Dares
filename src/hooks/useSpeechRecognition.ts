import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  getSpeechErrorMessage,
  isSpeechRecognitionSupported,
} from "../utils/speechRecognition";

type Options = {
  enabled: boolean;
  active: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
};

export function useSpeechRecognition({
  enabled,
  active,
  onResult,
}: Options) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const supported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const shouldRestartRef = useRef(false);
  const activeRef = useRef(active);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    activeRef.current = active;
    enabledRef.current = enabled;
  }, [active, enabled]);

  const haltRecognition = useCallback(() => {
    shouldRestartRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {
      recognitionRef.current?.stop();
    }
  }, []);

  const stop = useCallback(() => {
    haltRecognition();
    setIsListening(false);
    setInterimTranscript("");
  }, [haltRecognition]);

  const start = useCallback(() => {
    if (!supported || !enabledRef.current) return;

    haltRecognition();
    setError(null);
    setInterimTranscript("");

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!;
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interim += text;
        }
      }

      if (interim) setInterimTranscript(interim.trim());
      if (finalText) {
        setInterimTranscript("");
        onResultRef.current(finalText.trim(), true);
      } else if (interim) {
        onResultRef.current(interim.trim(), false);
      }
    };

    recognition.onerror = (event) => {
      const message = getSpeechErrorMessage(event.error);
      if (message) setError(message);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldRestartRef.current = false;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (
        shouldRestartRef.current &&
        enabledRef.current &&
        activeRef.current
      ) {
        window.setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch {
            // ignore double-start
          }
        }, 250);
      }
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start voice input.");
    }
  }, [supported, haltRecognition]);

  // Auto-start/stop with turn activity
  useEffect(() => {
    if (!supported || !enabled || !active) {
      haltRecognition();
      return;
    }

    const timer = window.setTimeout(() => start(), 0);
    return () => {
      window.clearTimeout(timer);
      haltRecognition();
    };
  }, [supported, enabled, active, start, haltRecognition]);

  useEffect(() => () => haltRecognition(), [haltRecognition]);

  return {
    supported,
    isListening,
    interimTranscript,
    error,
    start,
    stop,
  };
}
