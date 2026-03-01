/**
 * ============================================================
 * useTavusConversation — Video Avatar Hook (Tavus CVI)
 * ============================================================
 *
 * WHAT IS TAVUS CVI?
 * Tavus "Conversational Video Interface" is an AI service that
 * creates a real-time video avatar — a digital replica of a
 * real person that talks with natural lip-sync, facial expressions,
 * and head movements. Think of it as a video chatbot.
 *
 * HOW DOES IT WORK?
 * 1. We call our server to create a new Tavus "conversation"
 * 2. Our server calls Tavus's API with:
 *    - replica_id:  Which avatar face/appearance to use
 *    - persona_id:  Which personality/behavior the avatar has
 * 3. Tavus returns a conversation_url
 * 4. We embed that URL in an <iframe> on our page
 * 5. The iframe shows a live video avatar the user can talk to
 *
 * WHAT YOU NEED FROM TAVUS:
 * 1. Sign up at https://platform.tavus.io
 * 2. Create or select a "Replica" (the avatar's appearance)
 * 3. Create or select a "Persona" (the avatar's personality)
 * 4. Copy the replica_id and persona_id into your .env file
 * 5. Get your API key from the Tavus dashboard
 *
 * USAGE IN A COMPONENT:
 *   const { conversationUrl, createConversation, isCreating } = useTavusConversation();
 *
 *   // Start a conversation:
 *   await createConversation();
 *
 *   // Display the avatar:
 *   <iframe src={conversationUrl} />
 *
 * ============================================================
 */

import { useState, useCallback } from 'react';

/** What this hook returns to the component */
interface UseTavusReturn {
  /** The URL to embed in an iframe (null until conversation is created) */
  conversationUrl: string | null;
  /** The unique ID of this conversation (for tracking/debugging) */
  conversationId: string | null;
  /** True while the conversation is being created */
  isCreating: boolean;
  /** Error message if something went wrong (null otherwise) */
  error: string | null;
  /** Call this to create a new video conversation */
  createConversation: () => Promise<void>;
  /** Call this to end the current conversation */
  endConversation: () => void;
}

export function useTavusConversation(): UseTavusReturn {
  // ─── State ───────────────────────────────────────────────

  // The URL of the active Tavus conversation (embed in an iframe)
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);

  // The unique ID of the conversation (for reference/debugging)
  const [conversationId, setConversationId] = useState<string | null>(null);

  // True while we're waiting for Tavus to create the conversation
  const [isCreating, setIsCreating] = useState(false);

  // Error message (null when there's no error)
  const [error, setError] = useState<string | null>(null);

  // ─── CREATE A NEW CONVERSATION ───────────────────────────
  const createConversation = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Call our Express server, which calls the Tavus API
      // (We don't call Tavus directly from the browser because
      // that would expose the API key)
      const response = await fetch('/api/tavus/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            'Failed to create video conversation. Check your Tavus credentials in .env'
        );
      }

      const data = await response.json();

      // Store the conversation URL and ID
      // The URL is what we'll put in the <iframe> src attribute
      setConversationUrl(data.conversationUrl);
      setConversationId(data.conversationId);

    } catch (err: unknown) {
      const errorMsg =
        (err as Error).message || 'Failed to start video avatar. Is the server running?';
      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  }, []);

  // ─── END THE CONVERSATION ────────────────────────────────
  const endConversation = useCallback(() => {
    // Clear the conversation state
    // The Tavus session will automatically end when the iframe is removed
    setConversationUrl(null);
    setConversationId(null);
    setError(null);
  }, []);

  // ─── RETURN ──────────────────────────────────────────────
  return {
    conversationUrl,
    conversationId,
    isCreating,
    error,
    createConversation,
    endConversation,
  };
}
