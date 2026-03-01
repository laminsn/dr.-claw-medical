/**
 * ============================================================
 * AIConversation.tsx — Main AI Conversation Page
 * ============================================================
 *
 * This is the main page that brings all three AI services together:
 *
 *   1. DEEPGRAM  → Converts your speech to text in real-time
 *   2. OPENAI    → The AI "brain" (GPT-4o-mini) that generates responses
 *   3. TAVUS CVI → Shows a talking video avatar
 *
 * PAGE LAYOUT:
 * ┌──────────────────────────────────────────────────────┐
 * │   ← Back            AI Medical Assistant             │
 * ├─────────────────────────┬────────────────────────────┤
 * │                         │                            │
 * │   🎥 Video Avatar      │   💬 Chat Messages         │
 * │   (Tavus CVI iframe)   │   ┌──────────────────┐     │
 * │                         │   │ AI: Hello!       │     │
 * │   [Start Video Avatar]  │   │ You: Hi there    │     │
 * │                         │   │ AI: How can I    │     │
 * │   ┌─────────────────┐   │   │     help?        │     │
 * │   │ Service Status  │   │   └──────────────────┘     │
 * │   │ 🟢 Deepgram     │   │                            │
 * │   │ 🟢 OpenAI       │   │   ┌──────────────────┐     │
 * │   │ 🟢 Tavus        │   │   │ 🎤 [Type here  ] │     │
 * │   └─────────────────┘   │   │ [   Send   ]     │     │
 * │                         │   └──────────────────┘     │
 * └─────────────────────────┴────────────────────────────┘
 *
 * HOW THE USER INTERACTS:
 * 1. Click "Start Video Avatar" → Tavus avatar appears
 * 2. Click the 🎤 microphone → speak → Deepgram transcribes your speech
 * 3. Release mic → transcribed text is sent to GPT-4o-mini
 * 4. AI response appears in the chat panel
 * 5. (Optional) Type messages manually in the text input
 *
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  Video,
  VideoOff,
  Bot,
  User,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Import our custom hooks (the three AI services)
import { useDeepgram } from '@/hooks/useDeepgram';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import type { ChatMessage } from '@/hooks/useOpenAIChat';
import { useTavusConversation } from '@/hooks/useTavusConversation';

// Import shadcn/ui components (pre-built UI pieces from the project)
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AIConversation() {
  // ─── Initialize the three AI service hooks ───────────────
  const deepgram = useDeepgram();
  const chat = useOpenAIChat();
  const tavus = useTavusConversation();

  // ─── Local State ─────────────────────────────────────────
  // Text the user has typed (or that Deepgram transcribed)
  const [inputText, setInputText] = useState('');

  // Track server health status for the status panel
  const [serverHealth, setServerHealth] = useState<{
    deepgram: boolean;
    openai: boolean;
    tavus: boolean;
  } | null>(null);

  // Reference to the chat messages container (for auto-scrolling)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Auto-scroll to bottom when new messages arrive ──────
  useEffect(() => {
    // scrollIntoView smoothly scrolls the chat to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // ─── Check server health on page load ────────────────────
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerHealth(data.services);
        }
      } catch {
        // Server is not running
        setServerHealth(null);
      }
    }
    checkHealth();
  }, []);

  // ─── When Deepgram finishes transcribing, put text in input ──
  // This watches the transcript and updates the input field
  useEffect(() => {
    if (deepgram.transcript) {
      setInputText(deepgram.transcript);
    }
  }, [deepgram.transcript]);

  // ─── HANDLE SENDING A MESSAGE ────────────────────────────
  async function handleSend() {
    const text = inputText.trim();
    if (!text || chat.isLoading) return;

    // Clear the input and reset Deepgram transcript
    setInputText('');
    deepgram.resetTranscript();

    // Send the message to OpenAI via our chat hook
    await chat.sendMessage(text);
  }

  // ─── HANDLE KEYBOARD SHORTCUTS ───────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    // Send message on Enter (but not Shift+Enter, which adds a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a newline
      handleSend();
    }
  }

  // ─── TOGGLE MICROPHONE ───────────────────────────────────
  function toggleMic() {
    if (deepgram.isListening) {
      deepgram.stopListening();
    } else {
      deepgram.startListening();
    }
  }

  // ─── RENDER THE PAGE ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Back button */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>

          {/* Page title */}
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            AI Medical Assistant
          </h1>

          {/* Clear chat button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={chat.clearChat}
            className="text-white/60 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-120px)]">

          {/* ════════════════════════════════════════════════════ */}
          {/* LEFT PANEL — Video Avatar + Status (2 columns wide) */}
          {/* ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* ── Video Avatar Panel ── */}
            <div
              className="flex-1 rounded-2xl overflow-hidden
                backdrop-blur-xl bg-white/[0.03]
                border border-white/10 border-t-white/20
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.1),0_10px_25px_rgba(0,0,0,0.3)]
                flex flex-col"
            >
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  Video Avatar
                </span>
                {tavus.conversationUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={tavus.endConversation}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <VideoOff className="w-3 h-3 mr-1" />
                    End
                  </Button>
                )}
              </div>

              {/* Video area */}
              <div className="flex-1 flex items-center justify-center p-4">
                {tavus.conversationUrl ? (
                  /* ── Active conversation: show the Tavus avatar iframe ── */
                  <iframe
                    src={tavus.conversationUrl}
                    className="w-full h-full rounded-xl border border-white/10"
                    allow="camera;microphone;display-capture"
                    allowFullScreen
                    title="AI Video Avatar"
                  />
                ) : (
                  /* ── No conversation yet: show start button ── */
                  <div className="text-center space-y-4">
                    {/* Decorative avatar placeholder */}
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                      <Bot className="w-10 h-10 text-cyan-400/60" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-white/50 text-sm">
                        Start a video conversation with your AI avatar
                      </p>
                      <Button
                        onClick={tavus.createConversation}
                        disabled={tavus.isCreating}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30
                          text-cyan-200 rounded-full px-6"
                      >
                        {tavus.isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            Start Video Avatar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Show Tavus errors */}
                    {tavus.error && (
                      <p className="text-red-400 text-xs mt-2 max-w-xs mx-auto">
                        {tavus.error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Service Status Panel ── */}
            <div
              className="rounded-2xl p-4
                backdrop-blur-xl bg-white/[0.03]
                border border-white/10 border-t-white/20
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.1)]"
            >
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Service Status
              </h3>
              <div className="space-y-2">
                {/* Each status row shows a service name and whether it's configured */}
                <StatusRow
                  label="Deepgram (Speech-to-Text)"
                  configured={serverHealth?.deepgram}
                  serverRunning={serverHealth !== null}
                />
                <StatusRow
                  label="OpenAI (AI Brain)"
                  configured={serverHealth?.openai}
                  serverRunning={serverHealth !== null}
                />
                <StatusRow
                  label="Tavus (Video Avatar)"
                  configured={serverHealth?.tavus}
                  serverRunning={serverHealth !== null}
                />
              </div>

              {/* Show warning if server isn't running */}
              {serverHealth === null && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Server not running. Start it with: <code className="font-mono bg-black/30 px-1 rounded">node server.js</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════ */}
          {/* RIGHT PANEL — Chat Messages + Input (3 columns wide) */}
          {/* ════════════════════════════════════════════════════ */}
          <div
            className="lg:col-span-3 flex flex-col rounded-2xl overflow-hidden
              backdrop-blur-xl bg-white/[0.03]
              border border-white/10 border-t-white/20
              shadow-[inset_0_2px_5px_rgba(255,255,255,0.1),0_10px_25px_rgba(0,0,0,0.3)]"
          >
            {/* ── Chat Header ── */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <span className="text-sm font-medium text-white/70">Chat</span>
              <span className="text-xs text-white/30">
                {chat.messages.length} messages
              </span>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message (shown when chat is empty) */}
              {chat.messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-cyan-400/60" />
                  </div>
                  <h2 className="text-lg font-medium text-white/80">
                    Welcome to AI Medical Assistant
                  </h2>
                  <p className="text-sm text-white/40 max-w-sm mx-auto">
                    Ask me anything about health, symptoms, or appointments.
                    Use the microphone to speak or type your message below.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {/* Suggested questions (clickable) */}
                    {[
                      'What causes headaches?',
                      'How do I schedule an appointment?',
                      'Tips for better sleep',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputText(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10
                          text-white/50 hover:text-white/80 hover:border-cyan-500/30
                          hover:bg-cyan-500/10 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Render each message ── */}
              {chat.messages.map((msg: ChatMessage, index: number) => (
                <MessageBubble key={index} message={msg} />
              ))}

              {/* ── Loading indicator while AI is thinking ── */}
              {chat.isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/10">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              {/* ── Show live transcription while speaking ── */}
              {deepgram.isListening && (deepgram.transcript || deepgram.interimText) && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-purple-500/[0.05] border border-purple-500/20">
                    <p className="text-sm text-white/70">
                      {deepgram.transcript}
                      {deepgram.interimText && (
                        <span className="text-white/40 italic"> {deepgram.interimText}</span>
                      )}
                    </p>
                    <p className="text-xs text-purple-300/50 mt-1">Listening...</p>
                  </div>
                </div>
              )}

              {/* Invisible element at the bottom — we scroll to this */}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Error Display ── */}
            {(chat.error || deepgram.error) && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                <p className="text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  {chat.error || deepgram.error}
                </p>
              </div>
            )}

            {/* ── Input Area ── */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-3">
                {/* Microphone button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMic}
                  className={`rounded-full w-10 h-10 flex-shrink-0 transition-all ${
                    deepgram.isListening
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-2 ring-red-500/30 animate-pulse'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  title={deepgram.isListening ? 'Stop recording' : 'Start recording'}
                >
                  {deepgram.isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>

                {/* Text input */}
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    deepgram.isListening
                      ? 'Listening... speak now'
                      : 'Type a message or click 🎤 to speak...'
                  }
                  className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl
                    bg-white/5 border-white/10 text-white placeholder:text-white/30
                    focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
                  rows={1}
                />

                {/* Send button */}
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || chat.isLoading}
                  className="rounded-full w-10 h-10 flex-shrink-0
                    bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30
                    text-cyan-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {chat.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Microphone status hint */}
              <p className="text-xs text-white/30 mt-2 text-center">
                Press Enter to send · Shift+Enter for new line · Click 🎤 to use voice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════
// These are small, reusable components used only on this page.
// Keeping them in the same file is fine for page-specific pieces.


/**
 * MessageBubble — Displays a single chat message
 *
 * User messages appear on the right with a blue-ish style.
 * AI messages appear on the left with a darker style.
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-500/20' : 'bg-cyan-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-blue-400" />
        ) : (
          <Bot className="w-4 h-4 text-cyan-400" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-2xl rounded-tr-sm bg-blue-500/10 border border-blue-500/20 text-white/90'
            : 'rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/10 text-white/80'
        }`}
      >
        {/* Render message with line breaks preserved */}
        {message.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split('\n').length - 1 && <br />}
          </span>
        ))}

        {/* Timestamp */}
        <p className="text-xs text-white/30 mt-1.5">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}


/**
 * StatusRow — Shows the status of a single service
 *
 * Shows a green dot if configured, red if not, gray if server isn't running.
 */
function StatusRow({
  label,
  configured,
  serverRunning,
}: {
  label: string;
  configured: boolean | undefined;
  serverRunning: boolean;
}) {
  if (!serverRunning) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30">
        <XCircle className="w-3 h-3" />
        <span>{label}</span>
        <span className="ml-auto text-white/20">Server offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {configured ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : (
        <XCircle className="w-3 h-3 text-red-400" />
      )}
      <span className="text-white/60">{label}</span>
      <span className={`ml-auto ${configured ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
        {configured ? 'Ready' : 'Not configured'}
      </span>
    </div>
  );
}
