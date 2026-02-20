import { useState, useCallback, useRef, useEffect } from "react";

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

/**
 * Hook for browser-native speech-to-text via the Web Speech API.
 *
 * Keyboard shortcuts (registered externally):
 *   Win: Ctrl+Shift+S   Mac: Cmd+Shift+S   — Toggle listening
 *
 * Usage:
 *   const { isListening, transcript, toggle, stop, reset } = useVoiceInput({ lang: "en-US" });
 */
export function useVoiceInput(options?: {
  lang?: string;
  continuous?: boolean;
  onResult?: (text: string) => void;
  onInterim?: (text: string) => void;
}) {
  const { lang = "en-US", continuous = true, onResult, onInterim } = options ?? {};

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    isSupported: typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
  });

  // Initialize recognition engine
  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setState((prev) => {
          const updated = prev.transcript + (prev.transcript ? " " : "") + final;
          onResult?.(updated);
          return { ...prev, transcript: updated, interimTranscript: "" };
        });
      }

      if (interim) {
        setState((prev) => ({ ...prev, interimTranscript: interim }));
        onInterim?.(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are not real errors
      if (event.error === "no-speech" || event.error === "aborted") return;
      setState((prev) => ({ ...prev, error: event.error, isListening: false }));
    };

    recognition.onend = () => {
      setState((prev) => {
        // If still supposed to be listening (continuous mode), restart
        if (prev.isListening && continuous) {
          try {
            recognition.start();
          } catch {
            // Already started
          }
          return prev;
        }
        return { ...prev, isListening: false };
      });
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Not running
      }
    };
  }, [lang, continuous, onResult, onInterim, state.isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) return;
    try {
      recognitionRef.current.start();
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    } catch {
      // Already started
    }
  }, [state.isSupported]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    setState((prev) => ({ ...prev, isListening: false }));
    try {
      recognitionRef.current.stop();
    } catch {
      // Not running
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isListening) {
      stop();
    } else {
      start();
    }
  }, [state.isListening, start, stop]);

  const reset = useCallback(() => {
    stop();
    setState((prev) => ({ ...prev, transcript: "", interimTranscript: "", error: null }));
  }, [stop]);

  const setTranscript = useCallback((text: string) => {
    setState((prev) => ({ ...prev, transcript: text }));
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    error: state.error,
    isSupported: state.isSupported,
    start,
    stop,
    toggle,
    reset,
    setTranscript,
  };
}
