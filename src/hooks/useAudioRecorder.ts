import { useState, useCallback, useRef } from "react";

export interface AudioMessage {
  id: string;
  blob: Blob;
  url: string;
  durationMs: number;
  createdAt: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  error: string | null;
  isSupported: boolean;
}

/**
 * Hook for recording audio messages via the MediaRecorder API.
 *
 * Keyboard shortcuts (registered externally):
 *   Win: Ctrl+Shift+R   Mac: Cmd+Shift+R   — Toggle recording
 *
 * Usage:
 *   const { isRecording, durationMs, toggleRecording, stopAndGet } = useAudioRecorder();
 *   const audioMsg = await stopAndGet(); // returns AudioMessage
 */
export function useAudioRecorder(options?: {
  maxDurationMs?: number;
  mimeType?: string;
}) {
  const { maxDurationMs = 300_000, mimeType } = options ?? {}; // 5 min max

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveRef = useRef<((msg: AudioMessage | null) => void) | null>(null);

  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    durationMs: 0,
    error: null,
    isSupported: typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia,
  });

  const getSupportedMimeType = useCallback((): string => {
    if (mimeType && MediaRecorder.isTypeSupported(mimeType)) return mimeType;
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "audio/webm";
  }, [mimeType]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "Audio recording is not supported in this browser" }));
      return;
    }

    try {
      cleanup();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType(),
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const durationMs = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);

        const audioMsg: AudioMessage = {
          id: `audio-${Date.now()}`,
          blob,
          url,
          durationMs,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({ ...prev, isRecording: false, isPaused: false }));
        cleanup();

        if (resolveRef.current) {
          resolveRef.current(audioMsg);
          resolveRef.current = null;
        }
      };

      recorder.onerror = () => {
        setState((prev) => ({ ...prev, error: "Recording error occurred", isRecording: false }));
        cleanup();
        if (resolveRef.current) {
          resolveRef.current(null);
          resolveRef.current = null;
        }
      };

      recorder.start(250); // Collect data every 250ms

      // Duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState((prev) => ({ ...prev, durationMs: elapsed }));

        // Auto-stop at max duration
        if (elapsed >= maxDurationMs) {
          recorder.stop();
        }
      }, 100);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        durationMs: 0,
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setState((prev) => ({ ...prev, error: msg, isRecording: false }));
      cleanup();
    }
  }, [state.isSupported, cleanup, getSupportedMimeType, maxDurationMs]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * Stop recording and return the audio message as a promise.
   */
  const stopAndGet = useCallback((): Promise<AudioMessage | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }
      resolveRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (state.isRecording) {
      stop();
    } else {
      await start();
    }
  }, [state.isRecording, start, stop]);

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null; // Prevent delivering the result
      mediaRecorderRef.current.stop();
    }
    setState((prev) => ({ ...prev, isRecording: false, isPaused: false, durationMs: 0 }));
    cleanup();
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
  }, [cleanup]);

  return {
    isRecording: state.isRecording,
    isPaused: state.isPaused,
    durationMs: state.durationMs,
    error: state.error,
    isSupported: state.isSupported,
    start,
    stop,
    stopAndGet,
    pause,
    resume,
    toggleRecording,
    cancel,
  };
}

/** Format milliseconds as M:SS */
export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
