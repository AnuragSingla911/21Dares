/**
 * Speak numbers aloud using the browser Speech Synthesis API.
 */
export function speakNumbers(
  numbers: number[],
  enabled: boolean,
): void {
  if (!enabled) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(numbers.join(", "));
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const english = voices.find(
    (v) => v.lang.startsWith("en") && v.localService,
  );
  if (english) utterance.voice = english;

  window.speechSynthesis.speak(utterance);
}

export function speakText(text: string, enabled: boolean): void {
  if (!enabled) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
