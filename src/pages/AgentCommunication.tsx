import { useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Phone,
  Send,
  Bot,
  User,
  Clock,
  ChevronRight,
  Paperclip,
  Smile,
  MoreVertical,
  Circle,
  CheckCheck,
  ArrowLeft,
  MessageCircle,
  Globe,
  Tag,
  Calendar,
  FileText,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ChannelType = "sms" | "email" | "voice" | "chat" | "web";

interface Message {
  id: string;
  sender: "agent" | "contact";
  text: string;
  timestamp: string;
  channel: ChannelType;
  read: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  agentName: string;
  agentId: string;
  channel: ChannelType;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  status: "active" | "resolved" | "pending";
  tags: string[];
  messages: Message[];
}

const CHANNEL_CONFIG: Record<ChannelType, { icon: typeof MessageSquare; label: string; color: string }> = {
  sms: { icon: MessageCircle, label: "SMS", color: "text-green-400 bg-green-500/15 border-green-500/30" },
  email: { icon: Mail, label: "Email", color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  voice: { icon: Phone, label: "Voice", color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
  chat: { icon: MessageSquare, label: "Chat", color: "text-violet-400 bg-violet-500/15 border-violet-500/30" },
  web: { icon: Globe, label: "Web", color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
};

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Sarah Mitchell",
    contactEmail: "sarah.m@email.com",
    contactPhone: "(555) 234-5678",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "sms",
    lastMessage: "Your appointment has been confirmed for Thursday at 2:00 PM.",
    lastTimestamp: "2 min ago",
    unread: 2,
    status: "active",
    tags: ["appointment", "new-patient"],
    messages: [
      { id: "m1", sender: "contact", text: "Hi, I'd like to schedule an appointment for this week.", timestamp: "10:32 AM", channel: "sms", read: true },
      { id: "m2", sender: "agent", text: "Hello Sarah! I'd be happy to help you schedule an appointment. We have availability on Thursday at 2:00 PM or Friday at 10:00 AM. Which works best for you?", timestamp: "10:33 AM", channel: "sms", read: true },
      { id: "m3", sender: "contact", text: "Thursday at 2 PM works great!", timestamp: "10:35 AM", channel: "sms", read: true },
      { id: "m4", sender: "agent", text: "Your appointment has been confirmed for Thursday at 2:00 PM. You'll receive a reminder 24 hours before. Is there anything else I can help with?", timestamp: "10:35 AM", channel: "sms", read: true },
      { id: "m5", sender: "contact", text: "Do I need to bring anything?", timestamp: "10:41 AM", channel: "sms", read: false },
      { id: "m6", sender: "contact", text: "Also, do you accept Blue Cross insurance?", timestamp: "10:42 AM", channel: "sms", read: false },
    ],
  },
  {
    id: "conv-2",
    contactName: "James Rodriguez",
    contactEmail: "j.rodriguez@company.com",
    contactPhone: "(555) 345-6789",
    agentName: "Marketing Maven",
    agentId: "2",
    channel: "email",
    lastMessage: "Draft campaign copy attached for your review.",
    lastTimestamp: "15 min ago",
    unread: 1,
    status: "active",
    tags: ["campaign", "q1-launch"],
    messages: [
      { id: "m1", sender: "contact", text: "We need social media copy for the Q1 product launch. Can you draft something?", timestamp: "9:15 AM", channel: "email", read: true },
      { id: "m2", sender: "agent", text: "Absolutely! I'll prepare a comprehensive social media campaign package. Let me analyze your brand guidelines and recent engagement data first.", timestamp: "9:16 AM", channel: "email", read: true },
      { id: "m3", sender: "agent", text: "Draft campaign copy attached for your review. I've created 5 LinkedIn posts, 10 Twitter threads, and 3 Instagram carousel concepts. Each aligns with your brand voice and targets your key demographics.", timestamp: "9:45 AM", channel: "email", read: false },
    ],
  },
  {
    id: "conv-3",
    contactName: "Dr. Emily Chen",
    contactEmail: "e.chen@hospital.org",
    contactPhone: "(555) 456-7890",
    agentName: "Grant Pro",
    agentId: "3",
    channel: "chat",
    lastMessage: "The NIH R01 application draft is ready for your review.",
    lastTimestamp: "1 hr ago",
    unread: 0,
    status: "resolved",
    tags: ["grant", "nih"],
    messages: [
      { id: "m1", sender: "contact", text: "I need help with the NIH R01 grant application for our clinical trial.", timestamp: "Yesterday", channel: "chat", read: true },
      { id: "m2", sender: "agent", text: "I'll help you with the R01 application. I've reviewed the FOA and your preliminary data. Let me draft the specific aims and significance sections first.", timestamp: "Yesterday", channel: "chat", read: true },
      { id: "m3", sender: "agent", text: "The NIH R01 application draft is ready for your review. I've structured the specific aims around your three primary hypotheses and included budget justification.", timestamp: "8:30 AM", channel: "chat", read: true },
    ],
  },
  {
    id: "conv-4",
    contactName: "Michael Torres",
    contactEmail: "m.torres@clinic.com",
    contactPhone: "(555) 567-8901",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "voice",
    lastMessage: "Call completed — prescription refill confirmed with pharmacy.",
    lastTimestamp: "2 hrs ago",
    unread: 0,
    status: "resolved",
    tags: ["prescription", "follow-up"],
    messages: [
      { id: "m1", sender: "contact", text: "[Incoming call] Patient requesting prescription refill for Metformin 500mg", timestamp: "7:45 AM", channel: "voice", read: true },
      { id: "m2", sender: "agent", text: "Verified patient identity and checked prescription history. Confirmed last refill was 28 days ago. Contacted pharmacy for renewal.", timestamp: "7:48 AM", channel: "voice", read: true },
      { id: "m3", sender: "agent", text: "Call completed — prescription refill confirmed with pharmacy. Patient notified pickup will be ready in 2 hours.", timestamp: "7:52 AM", channel: "voice", read: true },
    ],
  },
  {
    id: "conv-5",
    contactName: "Priya Patel",
    contactEmail: "priya@startup.io",
    contactPhone: "(555) 678-9012",
    agentName: "Marketing Maven",
    agentId: "2",
    channel: "web",
    lastMessage: "Here's the competitor analysis report you requested.",
    lastTimestamp: "3 hrs ago",
    unread: 0,
    status: "resolved",
    tags: ["research", "competitor"],
    messages: [
      { id: "m1", sender: "contact", text: "Can you run a competitor analysis on our top 5 competitors for our investor deck?", timestamp: "6:00 AM", channel: "web", read: true },
      { id: "m2", sender: "agent", text: "Starting the competitor analysis now. I'll evaluate market positioning, pricing, feature sets, and growth metrics for each competitor.", timestamp: "6:01 AM", channel: "web", read: true },
      { id: "m3", sender: "agent", text: "Here's the competitor analysis report you requested. Includes SWOT analysis for each competitor, market positioning maps, and key differentiators for your investor deck.", timestamp: "6:45 AM", channel: "web", read: true },
    ],
  },
  {
    id: "conv-6",
    contactName: "Linda Nakamura",
    contactEmail: "l.nakamura@firm.com",
    contactPhone: "(555) 789-0123",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "sms",
    lastMessage: "Reminder: Your follow-up is tomorrow at 9 AM.",
    lastTimestamp: "5 hrs ago",
    unread: 0,
    status: "pending",
    tags: ["reminder", "follow-up"],
    messages: [
      { id: "m1", sender: "agent", text: "Hi Linda, this is a friendly reminder from our office: Your follow-up appointment is scheduled for tomorrow (Wednesday) at 9:00 AM. Please reply CONFIRM to confirm or RESCHEDULE if you need a new time.", timestamp: "3:00 PM", channel: "sms", read: true },
      { id: "m2", sender: "agent", text: "Reminder: Your follow-up is tomorrow at 9 AM.", timestamp: "3:00 PM", channel: "sms", read: true },
    ],
  },
];

const AgentCommunication = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelType | "all">("all");
  const [composeText, setComposeText] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "all" || conv.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Bar */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Patient Communication Center
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Unified clinical inbox — monitor all patient-agent conversations in real time
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <Badge className="gradient-primary text-primary-foreground border-0 text-xs px-2.5">
                {totalUnread} unread
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Panel: Conversation List ── */}
          <div className="w-80 border-r border-border flex flex-col shrink-0">
            {/* Search & Filter */}
            <div className="p-3 space-y-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50 h-9 text-sm"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {(["all", "sms", "email", "voice", "chat", "web"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      channelFilter === ch
                        ? "gradient-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {ch === "all" ? "All" : CHANNEL_CONFIG[ch].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => {
                const ChannelIcon = CHANNEL_CONFIG[conv.channel].icon;
                const isActive = selectedConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                      isActive
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {conv.unread > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm font-semibold truncate ${conv.unread > 0 ? "text-foreground" : "text-foreground/80"}`}>
                            {conv.contactName}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {conv.lastTimestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <ChannelIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[11px] text-muted-foreground truncate">
                            via {conv.agentName}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No conversations match your filters.
                </div>
              )}
            </div>
          </div>

          {/* ── Center Panel: Message Thread ── */}
          {selectedConv ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Thread Header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground">
                      {selectedConv.contactName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] border ${CHANNEL_CONFIG[selectedConv.channel].color} px-1.5 py-0`}>
                        {CHANNEL_CONFIG[selectedConv.channel].label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        Handled by <span className="text-primary font-medium">{selectedConv.agentName}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      selectedConv.status === "active"
                        ? "text-green-400 border-green-500/30"
                        : selectedConv.status === "pending"
                        ? "text-amber-400 border-amber-500/30"
                        : "text-muted-foreground border-border"
                    }`}
                  >
                    <Circle className={`h-1.5 w-1.5 mr-1 fill-current`} />
                    {selectedConv.status}
                  </Badge>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedConv.messages.map((msg) => {
                  const isAgent = msg.sender === "agent";
                  return (
                    <div key={msg.id} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[70%] ${isAgent ? "order-1" : "order-1"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {isAgent && (
                            <div className="h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
                              <Bot className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {isAgent ? selectedConv.agentName : selectedConv.contactName} · {msg.timestamp}
                          </span>
                          {!isAgent && msg.read && (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <div
                          className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                            isAgent
                              ? "bg-card border border-border text-foreground rounded-tl-sm"
                              : "gradient-primary text-primary-foreground rounded-tr-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compose Bar */}
              <div className="border-t border-border px-5 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <Input
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="Type a message or override agent response..."
                    className="flex-1 bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                  />
                  <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 gap-1.5 rounded-lg"
                    disabled={!composeText.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 ml-10">
                  Messages sent here will override the agent and be sent directly to the contact.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Choose from the list to view messages</p>
              </div>
            </div>
          )}

          {/* ── Right Panel: Contact Details ── */}
          {selectedConv && showDetails && (
            <div className="w-72 border-l border-border overflow-y-auto shrink-0">
              <div className="p-4 space-y-5">
                {/* Contact Card */}
                <div className="text-center">
                  <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm">
                    {selectedConv.contactName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedConv.contactEmail}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact Info
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedConv.contactEmail}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedConv.contactPhone}
                    </div>
                  </div>
                </div>

                {/* Assigned Agent */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned Agent
                  </h4>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{selectedConv.agentName}</p>
                      <p className="text-[10px] text-muted-foreground">AI Agent</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConv.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0 capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Conversation Stats */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Conversation Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-foreground">{selectedConv.messages.length}</p>
                      <p className="text-[10px] text-muted-foreground">Messages</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-foreground">
                        {selectedConv.messages.filter((m) => m.sender === "agent").length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Agent Msgs</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Activity
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-foreground/80">Conversation started</p>
                        <p className="text-[10px] text-muted-foreground">{selectedConv.messages[0]?.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-foreground/80">Last activity</p>
                        <p className="text-[10px] text-muted-foreground">{selectedConv.lastTimestamp}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentCommunication;
