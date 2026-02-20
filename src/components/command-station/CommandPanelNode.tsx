import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Send, Bot, MessageSquare, Terminal } from "lucide-react";

export interface CommandPanelNodeData {
  agentName: string;
  agentId: string;
  messages: { id: string; from: "commander" | "agent"; content: string; timestamp: string }[];
  onSendCommand: (agentId: string, command: string) => void;
}

function CommandPanelNodeComponent({ data }: NodeProps & { data: CommandPanelNodeData }) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    data.onSendCommand(data.agentId, trimmed);
    setInput("");
  };

  return (
    <div className="w-[320px] rounded-2xl border border-cyan-500/40 shadow-[0_0_40px_-5px_rgba(6,182,212,0.25)] bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-400/50 !-left-1.5"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/10 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-400">Command Terminal</span>
        </div>
        <p className="text-[10px] text-white/40 mt-0.5">Connected to {data.agentName}</p>
      </div>

      {/* Messages */}
      <div className="h-[200px] overflow-y-auto p-3 space-y-2">
        {data.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-6 w-6 text-white/10 mb-2" />
            <p className="text-[10px] text-white/30">Send a command to {data.agentName}</p>
          </div>
        )}
        {data.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "commander" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.from === "commander"
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/20 rounded-br-sm"
                  : "bg-white/5 text-white/80 border border-white/5 rounded-bl-sm"
              }`}
            >
              {msg.from === "agent" && (
                <div className="flex items-center gap-1 mb-1">
                  <Bot className="h-2.5 w-2.5 text-cyan-400" />
                  <span className="text-[9px] font-semibold text-cyan-400">
                    {data.agentName}
                  </span>
                </div>
              )}
              <p>{msg.content}</p>
              <p className="text-[8px] opacity-40 mt-1 text-right">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Command ${data.agentName}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-1 mt-2">
          {["Status", "Pause", "Prioritize", "Report"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(cmd);
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(CommandPanelNodeComponent);
