import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Circle,
  Keyboard,
  X,
  AudioLines,
  Square,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  Sparkles,
  Command,
} from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useAudioRecorder, formatDuration, type AudioMessage } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────
interface AgentInfo {
  id: string;
  name: string;
  model: string;
  zone: "clinical" | "operations" | "external";
  active: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  audioUrl?: string;
  audioDurationMs?: number;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface AgentChatPanelProps {
  agents: AgentInfo[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

// ── Detect platform ────────────────────────────────────────────────
const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const MOD_KEY = isMac ? "Cmd" : "Ctrl";

// ── Audio Player Mini ──────────────────────────────────────────────
function AudioPlayer({ url, durationMs }: { url: string; durationMs: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => { setPlaying(false); setProgress(0); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
      <audio ref={audioRef} src={url} preload="metadata" />
      <button onClick={toggle} className="p-1 rounded-full hover:bg-white/10 text-white/70 transition-colors">
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-cyan-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-[10px] text-white/40 tabular-nums">{formatDuration(durationMs)}</span>
      <AudioLines className="h-3 w-3 text-cyan-400/50" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export function AgentChatPanel({ agents, selectedAgentId, onSelectAgent }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [inputText, setInputText] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const agentMessages = selectedAgentId ? messages.get(selectedAgentId) ?? [] : [];

  // ── Voice input ────────────────────────────────────────────────
  const voice = useVoiceInput({
    lang: "en-US",
    continuous: true,
    onResult: (text) => {
      setInputText(text);
    },
  });

  // ── Audio recorder ─────────────────────────────────────────────
  const recorder = useAudioRecorder({ maxDurationMs: 300_000 });

  // ── Scroll to bottom on new messages ───────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages.length]);

  // ── Stop recording handler (defined before keyboard shortcut effect) ──
  const handleStopRecordingRef = useRef<() => void>(() => {});

  // ── Global keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + Shift + S → Toggle speech-to-text
      if (modKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        voice.toggle();
        return;
      }

      // Ctrl/Cmd + Shift + R → Toggle audio recording
      if (modKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (recorder.isRecording) {
          handleStopRecordingRef.current();
        } else {
          recorder.start();
        }
        return;
      }

      // Escape → Stop voice/recording
      if (e.key === "Escape") {
        if (voice.isListening) {
          voice.stop();
          e.preventDefault();
          return;
        }
        if (recorder.isRecording) {
          recorder.cancel();
          e.preventDefault();
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [voice, recorder]);

  // ── Send text message ──────────────────────────────────────────
  const sendTextMessage = useCallback(() => {
    if (!selectedAgentId || !inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(selectedAgentId) ?? [];
      updated.set(selectedAgentId, [...existing, userMsg]);
      return updated;
    });

    // Reset input and voice transcript
    setInputText("");
    voice.reset();

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        role: "agent",
        content: generateAgentResponse(selectedAgent?.name ?? "Agent", userMsg.content),
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(selectedAgentId) ?? [];
        updated.set(selectedAgentId, [...existing, agentMsg]);
        return updated;
      });
    }, 800 + Math.random() * 1500);
  }, [selectedAgentId, inputText, voice, selectedAgent]);

  // ── Send audio message ─────────────────────────────────────────
  const handleStopRecording = useCallback(async () => {
    const audioMsg = await recorder.stopAndGet();
    if (!audioMsg || !selectedAgentId) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-audio`,
      role: "user",
      content: "Voice message",
      audioUrl: audioMsg.url,
      audioDurationMs: audioMsg.durationMs,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(selectedAgentId) ?? [];
      updated.set(selectedAgentId, [...existing, userMsg]);
      return updated;
    });

    // Simulate agent acknowledgment
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        role: "agent",
        content: `Received your voice message (${formatDuration(audioMsg.durationMs)}). I'm processing the audio now and will respond shortly.`,
        timestamp: new Date(),
        status: "sent",
      };

      setMessages((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(selectedAgentId) ?? [];
        updated.set(selectedAgentId, [...existing, agentMsg]);
        return updated;
      });
    }, 1200);
  }, [recorder, selectedAgentId]);

  // Keep ref in sync so keyboard shortcut can call latest version
  handleStopRecordingRef.current = handleStopRecording;

  // ── Handle Enter key ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  // ── Zone colors ────────────────────────────────────────────────
  const getZoneColors = (zone: string) => {
    switch (zone) {
      case "clinical": return { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400" };
      case "operations": return { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" };
      default: return { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" };
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ── RENDER ────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* ── Agent selector header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowAgentPicker(!showAgentPicker)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
            >
              {selectedAgent ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    {selectedAgent.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${selectedAgent.active ? "bg-emerald-500" : "bg-gray-600"}`} />
                  </span>
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{selectedAgent.name}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", getZoneColors(selectedAgent.zone).border, getZoneColors(selectedAgent.zone).bg, getZoneColors(selectedAgent.zone).text)}>
                    {selectedAgent.zone}
                  </span>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Select an agent...</span>
                </>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 ml-1" />
            </button>

            {/* Agent dropdown */}
            {showAgentPicker && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/50 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Select Agent to Chat</div>
                <div className="max-h-60 overflow-y-auto">
                  {agents.map((agent) => {
                    const zc = getZoneColors(agent.zone);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => { onSelectAgent(agent.id); setShowAgentPicker(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left",
                          selectedAgentId === agent.id && "bg-primary/10"
                        )}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.active ? "bg-emerald-500" : "bg-gray-600"}`} />
                        </span>
                        <Bot className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground block truncate">{agent.name}</span>
                          <span className="text-[10px] text-muted-foreground/50">{agent.model}</span>
                        </div>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", zc.border, zc.bg, zc.text)}>
                          {agent.zone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedAgent && (
            <span className="text-[10px] text-muted-foreground/40">{selectedAgent.model}</span>
          )}
        </div>

        {/* Shortcuts hint */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 text-[10px] text-muted-foreground/50 hover:text-foreground hover:border-border transition-colors"
        >
          <Keyboard className="h-3 w-3" />
          Shortcuts
        </button>
      </div>

      {/* ── Keyboard shortcuts panel ──────────────────────────── */}
      {showShortcuts && (
        <div className="px-6 py-3 border-b border-border/50 bg-card/40 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground/70">Keyboard Shortcuts</span>
            <button onClick={() => setShowShortcuts(false)} className="p-1 rounded hover:bg-white/10 text-muted-foreground/40">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { keys: `${MOD_KEY}+Shift+S`, label: "Toggle Speech-to-Text", icon: Mic },
              { keys: `${MOD_KEY}+Shift+R`, label: "Toggle Audio Recording", icon: AudioLines },
              { keys: "Enter", label: "Send Message", icon: Send },
              { keys: "Escape", label: "Stop Voice/Recording", icon: Square },
            ].map(({ keys, label, icon: Icon }) => (
              <div key={keys} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                <Icon className="h-3.5 w-3.5 text-cyan-400/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground/70">{label}</p>
                </div>
                <div className="flex items-center gap-1">
                  {keys.split("+").map((k) => (
                    <kbd key={k} className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-mono text-foreground/60">
                      {k === "Cmd" ? <>{isMac ? <span>&#8984;</span> : "Ctrl"}</> : k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {!selectedAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <Bot className="h-12 w-12 text-muted-foreground/10 mb-4" />
            <h3 className="text-lg font-semibold text-foreground/50 mb-1">Select an Agent</h3>
            <p className="text-sm text-muted-foreground/40 max-w-sm">
              Choose an agent from the dropdown above to start a conversation. You can send text, voice messages, or use speech-to-text.
            </p>
          </div>
        ) : agentMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/60 mb-1">Chat with {selectedAgent.name}</h3>
            <p className="text-sm text-muted-foreground/40 max-w-md mb-4">
              Send a message, use <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-mono">{MOD_KEY}+Shift+S</kbd> for speech-to-text,
              or <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-mono">{MOD_KEY}+Shift+R</kbd> for voice recording.
            </p>
            <div className="flex gap-2">
              {["What are you working on?", "Give me a status report", "Any issues to report?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInputText(q); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-lg border border-border/50 bg-card/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          agentMessages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                  "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                  isUser
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-primary/20 text-primary border border-primary/30"
                )}>
                  {isUser ? "You" : <Bot className="h-4 w-4" />}
                </div>

                {/* Message bubble */}
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3 space-y-2",
                  isUser
                    ? "bg-cyan-500/10 border border-cyan-500/20 rounded-tr-sm"
                    : "bg-card border border-border/50 rounded-tl-sm"
                )}>
                  {msg.audioUrl && msg.audioDurationMs && (
                    <AudioPlayer url={msg.audioUrl} durationMs={msg.audioDurationMs} />
                  )}
                  {(!msg.audioUrl || msg.content !== "Voice message") && (
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className="text-[9px] text-muted-foreground/30">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Recording indicator bar ───────────────────────────── */}
      {recorder.isRecording && (
        <div className="px-6 py-2 border-t border-red-500/30 bg-red-500/5 flex items-center gap-3 shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">Recording</span>
          </div>
          <span className="text-xs text-red-400/70 tabular-nums">{formatDuration(recorder.durationMs)}</span>
          <div className="flex-1" />
          <button
            onClick={recorder.cancel}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
            title="Cancel recording (Esc)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-colors"
          >
            <Square className="h-3 w-3" /> Stop & Send
          </button>
        </div>
      )}

      {/* ── Voice listening indicator ─────────────────────────── */}
      {voice.isListening && (
        <div className="px-6 py-2 border-t border-cyan-500/30 bg-cyan-500/5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Mic className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-400">Listening...</span>
          </div>
          {voice.interimTranscript && (
            <span className="text-xs text-cyan-400/50 italic truncate flex-1">{voice.interimTranscript}</span>
          )}
          <button
            onClick={voice.stop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs font-medium transition-colors"
          >
            <MicOff className="h-3 w-3" /> Stop
          </button>
        </div>
      )}

      {/* ── Input area ────────────────────────────────────────── */}
      {selectedAgent && (
        <div className="px-6 py-4 border-t border-border/50 bg-card/20 shrink-0">
          <div className="flex items-end gap-3">
            {/* Speech-to-text button */}
            <button
              onClick={voice.toggle}
              disabled={!voice.isSupported}
              title={`Speech-to-Text (${MOD_KEY}+Shift+S)`}
              className={cn(
                "p-2.5 rounded-xl border transition-all shrink-0",
                voice.isListening
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_-4px_rgba(6,182,212,0.5)]"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                !voice.isSupported && "opacity-30 cursor-not-allowed"
              )}
            >
              {voice.isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            </button>

            {/* Audio record button */}
            <button
              onClick={recorder.isRecording ? handleStopRecording : () => recorder.start()}
              disabled={!recorder.isSupported}
              title={`Record Audio (${MOD_KEY}+Shift+R)`}
              className={cn(
                "p-2.5 rounded-xl border transition-all shrink-0",
                recorder.isRecording
                  ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_12px_-4px_rgba(239,68,68,0.5)]"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                !recorder.isSupported && "opacity-30 cursor-not-allowed"
              )}
            >
              {recorder.isRecording ? <Square className="h-4 w-4" /> : <AudioLines className="h-4 w-4" />}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={voice.isListening ? "Speak now... (transcript appears here)" : "Type a message or use voice..."}
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-cyan-500/40 resize-none min-h-[44px] max-h-32"
                style={{ height: "auto", overflow: "hidden" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 128) + "px";
                }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={sendTextMessage}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              title="Send (Enter)"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Input hints */}
          <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground/30">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5 font-mono">Enter</kbd> Send
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5 font-mono">Shift+Enter</kbd> New line
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5 font-mono">{MOD_KEY}+Shift+S</kbd> Voice
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5 font-mono">{MOD_KEY}+Shift+R</kbd> Record
            </span>
            {!voice.isSupported && <span className="text-amber-400/50">Speech-to-text not supported in this browser</span>}
            {!recorder.isSupported && <span className="text-amber-400/50">Audio recording not supported</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Simulated agent responses ──────────────────────────────────────
function generateAgentResponse(agentName: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("status") || lower.includes("working on")) {
    return `Currently processing 3 active tasks in my queue. Top priority: insurance verification for the morning batch. All systems operating within normal parameters. CPU at 34%, memory at 52%. No errors in the last hour.`;
  }
  if (lower.includes("issue") || lower.includes("problem") || lower.includes("error")) {
    return `I noticed one minor issue: the Availity API has been responding slower than usual today (avg 2.8s vs normal 0.9s). This is affecting insurance verification turnaround. I've already switched to batch mode to compensate. No data loss or failures — just slightly longer processing times.`;
  }
  if (lower.includes("help") || lower.includes("can you")) {
    return `Of course! I'm here to help. You can ask me to:\n\n• Process specific tasks or patient records\n• Generate reports on my activity\n• Check status on pending verifications\n• Review flagged items\n• Adjust my priority queue\n\nWhat would you like me to do?`;
  }
  if (lower.includes("report") || lower.includes("summary")) {
    return `Here's my daily summary:\n\n• Tasks completed: 47\n• Success rate: 96.2%\n• Avg response time: 1.4s\n• Tokens used: 12,450\n• Cost today: $1.87\n• Flagged items: 2 (sent to review queue)\n\nNeed me to drill into any of these?`;
  }

  return `Understood. I'll look into "${userMessage}" right away. Let me process this and I'll update you with my findings. Is there anything specific you'd like me to focus on?`;
}
