/**
 * ============================================================
 * useDeepgram — Real-Time Speech-to-Text Hook
 * ============================================================
 *
 * WHAT IS DEEPGRAM?
 * Deepgram is an AI-powered speech recognition service.
 * It listens to audio from your microphone and converts it
 * to text in real-time (like live captions).
 *
 * HOW DOES THIS HOOK WORK?
 * 1. When you call startListening():
 *    a. Fetches a Deepgram API key from our server (/api/deepgram/key)
 *    b. Asks the browser for microphone access
 *    c. Opens a WebSocket connection to Deepgram's streaming API
 *    d. Starts recording audio and sending it to Deepgram
 *    e. Deepgram sends back text transcriptions in real-time
 *
 * 2. When you call stopListening():
 *    a. Stops the microphone recording
 *    b. Closes the WebSocket connection
 *    c. Releases the microphone
 *
 * WHAT IS A WEBSOCKET?
 * Normal HTTP requests work like sending a letter:
 *   You send a request → wait → get a response → done.
 * WebSockets work like a phone call:
 *   You open a connection → data flows both ways continuously → you hang up.
 * This is perfect for streaming audio because we need to send audio chunks
 * continuously and receive transcription results back instantly.
 *
 * WHAT IS A REACT HOOK?
 * A hook is a reusable piece of React logic. Instead of putting all
 * this code inside a component, we put it in a hook so any component
 * can use speech-to-text by just calling: const { ... } = useDeepgram();
 *
 * ============================================================
 */

import { useState, useRef, useCallback } from 'react';

// ─── TypeScript Interface ────────────────────────────────────
// This defines the "shape" of what this hook returns.
// TypeScript uses these to catch bugs before your code runs.
interface UseDeepgramReturn {
  /** The transcribed text from your speech */
  transcript: string;
  /** The partial/interim text currently being spoken (updates live) */
  interimText: string;
  /** Whether the microphone is currently recording */
  isListening: boolean;
  /** Start recording and transcribing */
  startListening: () => Promise<void>;
  /** Stop recording and transcribing */
  stopListening: () => void;
  /** Reset the transcript to empty */
  resetTranscript: () => void;
  /** Any error that occurred (null if no error) */
  error: string | null;
}

export function useDeepgram(): UseDeepgramReturn {
  // ─── State Variables ─────────────────────────────────────
  // useState = React's way of storing data that, when changed,
  // causes the component to re-render (update the screen).

  const [transcript, setTranscript] = useState('');          // Final transcribed text
  const [interimText, setInterimText] = useState('');        // Partial text (while speaking)
  const [isListening, setIsListening] = useState(false);     // Are we recording?
  const [error, setError] = useState<string | null>(null);   // Error message (if any)

  // ─── Refs ────────────────────────────────────────────────
  // useRef = stores a value that persists across re-renders WITHOUT
  // causing a re-render when changed. Perfect for storing objects
  // like WebSocket connections and MediaRecorder instances.

  const socketRef = useRef<WebSocket | null>(null);           // The Deepgram WebSocket
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // The audio recorder
  const streamRef = useRef<MediaStream | null>(null);          // The microphone stream

  // ─── START LISTENING ─────────────────────────────────────
  // useCallback = memoizes the function so it doesn't get recreated
  // on every render. This prevents unnecessary re-renders in child components.
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setInterimText('');

      // ── Step 1: Get the Deepgram API key from our server ──
      // We don't hardcode the key in the frontend for security.
      // Our Express server (server.js) returns it from the .env file.
      const keyResponse = await fetch('/api/deepgram/key');
      if (!keyResponse.ok) {
        throw new Error('Could not get Deepgram API key from server. Is server.js running?');
      }
      const { key } = await keyResponse.json();
      if (!key) throw new Error('Deepgram API key is empty. Check your .env file.');

      // ── Step 2: Get microphone access ──
      // navigator.mediaDevices.getUserMedia() asks the browser for mic permission.
      // The user will see a popup asking "Allow microphone access?"
      // If they deny it, this throws a "NotAllowedError".
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // Reduce echo from speakers
          noiseSuppression: true,   // Reduce background noise
          sampleRate: 16000,        // 16kHz sample rate (good for speech)
        },
      });
      streamRef.current = stream;

      // ── Step 3: Open WebSocket connection to Deepgram ──
      // This URL connects to Deepgram's real-time transcription API.
      // The query parameters configure how Deepgram processes the audio:
      const dgUrl =
        'wss://api.deepgram.com/v1/listen?' +
        'model=nova-2&' +            // nova-2 = Deepgram's latest & most accurate model
        'language=en&' +              // Transcribe English speech
        'smart_format=true&' +        // Auto-add punctuation and formatting
        'interim_results=true&' +     // Send partial results while still speaking
        'utterance_end_ms=1000&' +    // Detect end of speech after 1 second of silence
        'vad_events=true&' +          // Voice Activity Detection events
        'endpointing=300';            // Detect pauses after 300ms

      // Create the WebSocket connection
      // The second argument passes the API key as a WebSocket sub-protocol
      const socket = new WebSocket(dgUrl, ['token', key]);
      socketRef.current = socket;

      // ── Step 4: When WebSocket opens, start recording audio ──
      socket.onopen = () => {
        setIsListening(true);

        // MediaRecorder captures audio from the microphone stream
        // It records in chunks and fires 'ondataavailable' for each chunk
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',  // WebM format works in Chrome, Edge, Firefox
        });
        mediaRecorderRef.current = mediaRecorder;

        // Every time an audio chunk is ready, send it to Deepgram
        mediaRecorder.ondataavailable = (event) => {
          // Only send if there's data and the WebSocket is still open
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        // Start recording! The number is the timeslice in milliseconds.
        // 250ms = send audio every quarter second (good balance of latency vs efficiency)
        mediaRecorder.start(250);
      };

      // ── Step 5: Handle transcription results from Deepgram ──
      socket.onmessage = (event) => {
        // Deepgram sends JSON messages with transcription results
        const data = JSON.parse(event.data);

        // Skip non-transcript messages (like metadata or VAD events)
        if (data.type !== 'Results') return;

        // Extract the transcript text from Deepgram's response
        // The response structure: channel.alternatives[0].transcript
        const text = data.channel?.alternatives?.[0]?.transcript;

        if (text) {
          if (data.is_final) {
            // ── FINAL result ──
            // Deepgram is confident about this portion of speech.
            // Append it to the full transcript.
            setTranscript((prev) => (prev ? prev + ' ' + text : text));
            setInterimText(''); // Clear interim since we have the final
          } else {
            // ── INTERIM result ──
            // The user is still speaking. Show partial text that may change.
            // This gives a responsive feel (like live captions).
            setInterimText(text);
          }
        }
      };

      // ── Handle WebSocket errors ──
      socket.onerror = (event) => {
        console.error('Deepgram WebSocket error:', event);
        setError('Connection to Deepgram failed. Check your API key and internet connection.');
        stopListening();
      };

      // ── Handle WebSocket closing ──
      socket.onclose = () => {
        setIsListening(false);
      };

    } catch (err: unknown) {
      // ── Handle specific error types ──
      const error = err as Error & { name?: string };

      if (error.name === 'NotAllowedError') {
        // User denied microphone permission
        setError(
          'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
        );
      } else if (error.name === 'NotFoundError') {
        // No microphone found on the device
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(error.message || 'Failed to start speech recognition.');
      }

      setIsListening(false);
    }
  }, []);

  // ─── STOP LISTENING ──────────────────────────────────────
  const stopListening = useCallback(() => {
    // Stop the MediaRecorder (stops capturing audio)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Close the WebSocket connection to Deepgram
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Send a special "CloseStream" message to tell Deepgram we're done
      socketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      socketRef.current.close();
    }

    // Stop all audio tracks (releases the microphone — the browser
    // mic icon disappears from the tab)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsListening(false);
    setInterimText('');
  }, []);

  // ─── RESET TRANSCRIPT ────────────────────────────────────
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimText('');
  }, []);

  // ─── RETURN VALUES ───────────────────────────────────────
  // These are the values and functions that components can use
  return {
    transcript,
    interimText,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
