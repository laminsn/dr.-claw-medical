/**
 * ============================================================
 * useOpenAIChat — AI Conversation Hook (GPT-4o-mini)
 * ============================================================
 *
 * WHAT DOES THIS HOOK DO?
 * It manages a conversation with OpenAI's GPT-4o-mini model.
 * Think of it like a text messaging app where one participant
 * is an AI. This hook handles:
 * - Storing the full message history (who said what)
 * - Sending messages to our server (which forwards to OpenAI)
 * - Receiving and displaying AI responses
 * - Loading states and error handling
 *
 * WHY SEND THE FULL CONVERSATION HISTORY?
 * GPT-4o-mini has no memory between API calls. Each call is
 * independent. To maintain context (so the AI remembers what
 * you said earlier), we send the ENTIRE conversation every time.
 * Example:
 *   Call 1: [user: "What causes headaches?"]
 *   Call 2: [user: "What causes headaches?", ai: "Headaches...", user: "What about migraines?"]
 *   Call 3: [all previous messages + new message]
 *
 * USAGE IN A COMPONENT:
 *   const { messages, sendMessage, isLoading } = useOpenAIChat();
 *   await sendMessage("What causes headaches?");
 *   // messages now contains both the user's question and the AI's answer
 *
 * ============================================================
 */

import { useState, useCallback } from 'react';

// ─── TypeScript Types ────────────────────────────────────────

/** A single message in the conversation */
export interface ChatMessage {
  /** Who sent this message: "user" (you) or "assistant" (the AI) */
  role: 'user' | 'assistant';
  /** The actual text content of the message */
  content: string;
  /** When this message was created (used for display timestamps) */
  timestamp: Date;
}

/** What this hook returns to the component */
interface UseOpenAIChatReturn {
  /** The full conversation history (array of messages) */
  messages: ChatMessage[];
  /** Send a message and get an AI response. Returns the AI's reply text. */
  sendMessage: (text: string) => Promise<string>;
  /** True while waiting for the AI to respond */
  isLoading: boolean;
  /** Error message if something went wrong (null otherwise) */
  error: string | null;
  /** Clear the entire conversation and start fresh */
  clearChat: () => void;
}

export function useOpenAIChat(): UseOpenAIChatReturn {
  // ─── State ───────────────────────────────────────────────

  // All messages in the conversation (both user and AI messages)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // True while we're waiting for OpenAI to respond
  const [isLoading, setIsLoading] = useState(false);

  // Error message (null when there's no error)
  const [error, setError] = useState<string | null>(null);

  // ─── SEND A MESSAGE ──────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string): Promise<string> => {
      // Don't send empty messages
      if (!text.trim()) return '';

      setError(null);
      setIsLoading(true);

      // Create the user's message object
      const userMessage: ChatMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      // Immediately add the user's message to the conversation
      // so it appears in the chat UI right away (before the AI responds)
      setMessages((prev) => [...prev, userMessage]);

      try {
        // ── Send to our Express server ──
        // The server forwards this to OpenAI's API (see server.js)
        // We send the full conversation history so the AI has context
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Convert our ChatMessage[] to the format OpenAI expects
            // OpenAI only needs { role, content } — not our timestamp
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        // Handle HTTP errors (4xx, 5xx status codes)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server responded with status ${response.status}`
          );
        }

        // Parse the AI's response
        const data = await response.json();
        const aiReply = data.reply;

        // Create the AI's message object
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date(),
        };

        // Add the AI's response to the conversation
        setMessages((prev) => [...prev, aiMessage]);

        // Return the reply text (useful if the caller wants to do
        // something with it, like send it to Tavus for the avatar to speak)
        return aiReply;

      } catch (err: unknown) {
        const errorMsg =
          (err as Error).message || 'Failed to get AI response. Is the server running?';
        setError(errorMsg);
        // Return empty string on error so the caller can handle it
        return '';
      } finally {
        // Always set loading to false, whether we succeeded or failed
        // "finally" runs after both try and catch blocks
        setIsLoading(false);
      }
    },
    [messages] // Re-create this function when messages change (so it has the latest history)
  );

  // ─── CLEAR CHAT ──────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // ─── RETURN ──────────────────────────────────────────────
  return { messages, sendMessage, isLoading, error, clearChat };
}
