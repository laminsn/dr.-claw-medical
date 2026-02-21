import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  Shield,
  Lock,
  Plus,
  Building2,
  Heart,
  X,
  AlertTriangle,
  GitBranch,
  ChevronDown,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { containsPhi, redactPhi, sanitizeInput } from "@/lib/security";

type ChannelType = "sms" | "email" | "voice" | "chat" | "web";
type ContactType = "patient" | "external-partner";

interface Message {
  id: string;
  sender: "agent" | "contact";
  text: string;
  timestamp: string;
  channel: ChannelType;
  read: boolean;
  threadId?: string;
}

interface Thread {
  id: string;
  subject: string;
  createdAt: string;
  status: "open" | "closed";
  messages: Message[];
}

interface Conversation {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactType: ContactType;
  organization?: string;
  agentName: string;
  agentId: string;
  channel: ChannelType;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  zone: AgentZone;
  status: "active" | "resolved" | "pending";
  tags: string[];
  messages: Message[];
  threads: Thread[];
}

type AgentZone = "clinical" | "operations" | "external";

const AGENT_ZONE_MAP: Record<string, AgentZone> = {
  "Dr. Front Desk": "clinical",
  "Clinical Coordinator": "clinical",
  "Marketing Maven": "external",
  "Content Engine": "external",
  "Patient Outreach": "external",
  "Grant Pro": "operations",
  "Financial Analyst": "operations",
  "HR Coordinator": "operations",
};

const AVAILABLE_AGENTS = Object.entries(AGENT_ZONE_MAP).map(([name, zone], i) => ({
  id: String(i + 1),
  name,
  zone,
}));

const ZONE_ALLOWED_CHANNELS: Record<AgentZone, ChannelType[]> = {
  clinical: ["chat"], // Internal platform only
  operations: ["chat"], // Internal only
  external: ["sms", "email", "voice", "chat", "web"], // All channels
};

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Sarah Mitchell",
    contactEmail: "sarah.m@email.com",
    contactPhone: "(555) 234-5678",
    contactType: "patient",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "chat",
    zone: "clinical",
    lastMessage: "Your appointment has been confirmed for Thursday at 2:00 PM via internal platform.",
    lastTimestamp: "2 min ago",
    unread: 2,
    status: "active",
    tags: ["appointment", "new-patient"],
    messages: [
      { id: "m1", sender: "contact", text: "Hi, I'd like to schedule an appointment for this week.", timestamp: "10:32 AM", channel: "chat", read: true },
      { id: "m2", sender: "agent", text: "Hello Sarah! I'd be happy to help you schedule an appointment. We have availability on Thursday at 2:00 PM or Friday at 10:00 AM. Which works best for you?", timestamp: "10:33 AM", channel: "chat", read: true },
      { id: "m3", sender: "contact", text: "Thursday at 2 PM works great!", timestamp: "10:35 AM", channel: "chat", read: true },
      { id: "m4", sender: "agent", text: "Your appointment has been confirmed for Thursday at 2:00 PM. You'll receive a reminder 24 hours before. Is there anything else I can help with?", timestamp: "10:35 AM", channel: "chat", read: true },
      { id: "m5", sender: "contact", text: "Do I need to bring anything?", timestamp: "10:41 AM", channel: "chat", read: false },
      { id: "m6", sender: "contact", text: "Also, do you accept Blue Cross insurance?", timestamp: "10:42 AM", channel: "chat", read: false },
    ],
    threads: [
      {
        id: "t1",
        subject: "Insurance Verification",
        createdAt: "10:42 AM",
        status: "open",
        messages: [
          { id: "t1-m1", sender: "contact", text: "Also, do you accept Blue Cross insurance?", timestamp: "10:42 AM", channel: "chat", read: false },
        ],
      },
    ],
  },
  {
    id: "conv-2",
    contactName: "James Rodriguez",
    contactEmail: "j.rodriguez@company.com",
    contactPhone: "(555) 345-6789",
    contactType: "external-partner",
    organization: "Rodriguez Media Group",
    agentName: "Marketing Maven",
    agentId: "2",
    channel: "email",
    zone: "external",
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
    threads: [],
  },
  {
    id: "conv-3",
    contactName: "Dr. Emily Chen",
    contactEmail: "e.chen@hospital.org",
    contactPhone: "(555) 456-7890",
    contactType: "external-partner",
    organization: "Metro General Hospital",
    agentName: "Grant Pro",
    agentId: "3",
    channel: "chat",
    zone: "operations",
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
    threads: [
      {
        id: "t2",
        subject: "Budget Justification Review",
        createdAt: "8:30 AM",
        status: "open",
        messages: [
          { id: "t2-m1", sender: "agent", text: "I've drafted the budget justification section separately for your review. Personnel costs, equipment, and travel are itemized.", timestamp: "8:35 AM", channel: "chat", read: true },
        ],
      },
    ],
  },
  {
    id: "conv-4",
    contactName: "Michael Torres",
    contactEmail: "m.torres@clinic.com",
    contactPhone: "(555) 567-8901",
    contactType: "patient",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "chat",
    zone: "clinical",
    lastMessage: "Internal note — prescription refill confirmed with pharmacy via platform.",
    lastTimestamp: "2 hrs ago",
    unread: 0,
    status: "resolved",
    tags: ["prescription", "follow-up"],
    messages: [
      { id: "m1", sender: "contact", text: "[Internal request] Patient requesting prescription refill for Metformin 500mg", timestamp: "7:45 AM", channel: "chat", read: true },
      { id: "m2", sender: "agent", text: "Verified patient identity and checked prescription history. Confirmed last refill was 28 days ago. Contacted pharmacy for renewal.", timestamp: "7:48 AM", channel: "chat", read: true },
      { id: "m3", sender: "agent", text: "Internal note — prescription refill confirmed with pharmacy. Patient notified pickup will be ready in 2 hours.", timestamp: "7:52 AM", channel: "chat", read: true },
    ],
    threads: [],
  },
  {
    id: "conv-5",
    contactName: "Priya Patel",
    contactEmail: "priya@startup.io",
    contactPhone: "(555) 678-9012",
    contactType: "external-partner",
    organization: "HealthTech Startup",
    agentName: "Marketing Maven",
    agentId: "2",
    channel: "web",
    zone: "external",
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
    threads: [],
  },
  {
    id: "conv-6",
    contactName: "Linda Nakamura",
    contactEmail: "l.nakamura@firm.com",
    contactPhone: "(555) 789-0123",
    contactType: "patient",
    agentName: "Dr. Front Desk",
    agentId: "1",
    channel: "chat",
    zone: "clinical",
    lastMessage: "Internal reminder logged: Follow-up is tomorrow at 9 AM.",
    lastTimestamp: "5 hrs ago",
    unread: 0,
    status: "pending",
    tags: ["reminder", "follow-up"],
    messages: [
      { id: "m1", sender: "agent", text: "Internal platform reminder: Linda's follow-up appointment is scheduled for tomorrow (Wednesday) at 9:00 AM. Confirmation pending via front desk.", timestamp: "3:00 PM", channel: "chat", read: true },
      { id: "m2", sender: "agent", text: "Internal reminder logged: Follow-up is tomorrow at 9 AM.", timestamp: "3:00 PM", channel: "chat", read: true },
    ],
    threads: [],
  },
  {
    id: "conv-7",
    contactName: "Riverside Pharmacy",
    contactEmail: "orders@riversidepharmacy.com",
    contactPhone: "(555) 890-1234",
    contactType: "external-partner",
    organization: "Riverside Pharmacy Inc.",
    agentName: "Patient Outreach",
    agentId: "5",
    channel: "email",
    zone: "external",
    lastMessage: "Prescription coordination confirmed — pickup available after 3 PM.",
    lastTimestamp: "4 hrs ago",
    unread: 0,
    status: "resolved",
    tags: ["pharmacy", "coordination"],
    messages: [
      { id: "m1", sender: "agent", text: "Hi, we have a prescription refill coordination request. Order reference attached. No PHI included per policy.", timestamp: "11:00 AM", channel: "email", read: true },
      { id: "m2", sender: "contact", text: "Received. We'll have it ready by 3 PM today.", timestamp: "11:15 AM", channel: "email", read: true },
      { id: "m3", sender: "agent", text: "Prescription coordination confirmed — pickup available after 3 PM.", timestamp: "11:16 AM", channel: "email", read: true },
    ],
    threads: [],
  },
];

/* -- PHI validation helper -- */

function validateFieldsForPhi(fields: Record<string, string>): string[] {
  const warnings: string[] = [];
  for (const [label, value] of Object.entries(fields)) {
    if (value && containsPhi(value)) {
      warnings.push(`${label} may contain PHI — this will be redacted before transmission.`);
    }
  }
  return warnings;
}

/* -- Zone violation check for external partner + clinical -- */

function isExternalPartnerZoneViolation(contactType: ContactType, zone: AgentZone): boolean {
  // External partners should NEVER be routed to clinical agents (Zone 1 has PHI)
  // But patients CAN use clinical agents on internal chat
  if (contactType === "external-partner" && zone === "clinical") return true;
  return false;
}

const AgentCommunication = () => {
  const { t } = useTranslation();

  const ZONE_BADGE_CONFIG: Record<AgentZone, { label: string; color: string }> = {
    clinical: { label: t("communication.zoneClinical"), color: "text-red-400 bg-red-500/15 border-red-500/30" },
    operations: { label: t("communication.zoneOperations"), color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
    external: { label: t("communication.zoneExternal"), color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  };

  const CONTACT_TYPE_CONFIG: Record<ContactType, { icon: typeof User; label: string; color: string }> = {
    patient: { icon: Heart, label: t("communication.patient"), color: "text-rose-400 bg-rose-500/15 border-rose-500/30" },
    "external-partner": { icon: Building2, label: t("communication.partner"), color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
  };

  const CHANNEL_CONFIG: Record<ChannelType, { icon: typeof MessageSquare; label: string; color: string }> = {
    sms: { icon: MessageCircle, label: t("communication.channelSms"), color: "text-green-400 bg-green-500/15 border-green-500/30" },
    email: { icon: Mail, label: t("communication.channelEmail"), color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
    voice: { icon: Phone, label: t("communication.channelVoice"), color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
    chat: { icon: MessageSquare, label: t("communication.channelChat"), color: "text-violet-400 bg-violet-500/15 border-violet-500/30" },
    web: { icon: Globe, label: t("communication.channelWeb"), color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
  };

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelType | "all">("all");
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactType | "all">("all");
  const [composeText, setComposeText] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  // New Conversation dialog state
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [newConvContactType, setNewConvContactType] = useState<ContactType>("patient");
  const [newConvName, setNewConvName] = useState("");
  const [newConvEmail, setNewConvEmail] = useState("");
  const [newConvPhone, setNewConvPhone] = useState("");
  const [newConvOrg, setNewConvOrg] = useState("");
  const [newConvAgent, setNewConvAgent] = useState("");
  const [newConvChannel, setNewConvChannel] = useState<ChannelType>("chat");
  const [newConvSubject, setNewConvSubject] = useState("");
  const [newConvMessage, setNewConvMessage] = useState("");
  const [newConvPhiWarnings, setNewConvPhiWarnings] = useState<string[]>([]);

  // New Thread dialog state
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [newThreadMessage, setNewThreadMessage] = useState("");
  const [newThreadPhiWarnings, setNewThreadPhiWarnings] = useState<string[]>([]);

  // Thread view state
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [threadComposeText, setThreadComposeText] = useState("");

  const selectedAgentZone = newConvAgent ? AGENT_ZONE_MAP[newConvAgent] || "external" : null;
  const allowedChannels = selectedAgentZone ? ZONE_ALLOWED_CHANNELS[selectedAgentZone] : [];
  const zoneViolation = selectedAgentZone ? isExternalPartnerZoneViolation(newConvContactType, selectedAgentZone) : false;

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "all" || conv.channel === channelFilter;
    const matchesContactType = contactTypeFilter === "all" || conv.contactType === contactTypeFilter;
    return matchesSearch && matchesChannel && matchesContactType;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  /* -- New Conversation handlers -- */

  function resetNewConvForm() {
    setNewConvContactType("patient");
    setNewConvName("");
    setNewConvEmail("");
    setNewConvPhone("");
    setNewConvOrg("");
    setNewConvAgent("");
    setNewConvChannel("chat");
    setNewConvSubject("");
    setNewConvMessage("");
    setNewConvPhiWarnings([]);
  }

  function handleNewConvPhiCheck() {
    const warnings = validateFieldsForPhi({
      "Contact Name": newConvName,
      "Email": newConvEmail,
      "Phone": newConvPhone,
      "Organization": newConvOrg,
      "Subject": newConvSubject,
      "Message": newConvMessage,
    });
    setNewConvPhiWarnings(warnings);
    return warnings;
  }

  function handleCreateConversation() {
    const warnings = handleNewConvPhiCheck();

    if (!newConvName.trim() || !newConvAgent || zoneViolation) return;

    const agentEntry = AVAILABLE_AGENTS.find((a) => a.name === newConvAgent);
    if (!agentEntry) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const convId = `conv-${Date.now()}`;

    // Sanitize and redact PHI from the outgoing message content
    const safeMessage = warnings.length > 0 ? redactPhi(sanitizeInput(newConvMessage)) : sanitizeInput(newConvMessage);
    const safeName = sanitizeInput(newConvName);
    const safeSubject = sanitizeInput(newConvSubject);

    const initialMessage: Message = {
      id: `${convId}-m1`,
      sender: "agent",
      text: safeMessage || `Conversation started with ${safeName}.`,
      timestamp: timeStr,
      channel: newConvChannel,
      read: true,
    };

    const initialThread: Thread | null = newConvSubject.trim()
      ? {
          id: `${convId}-t1`,
          subject: safeSubject,
          createdAt: timeStr,
          status: "open",
          messages: [{ ...initialMessage, threadId: `${convId}-t1` }],
        }
      : null;

    const newConv: Conversation = {
      id: convId,
      contactName: safeName,
      contactEmail: sanitizeInput(newConvEmail),
      contactPhone: sanitizeInput(newConvPhone),
      contactType: newConvContactType,
      organization: newConvContactType === "external-partner" ? sanitizeInput(newConvOrg) : undefined,
      agentName: agentEntry.name,
      agentId: agentEntry.id,
      channel: newConvChannel,
      zone: agentEntry.zone,
      lastMessage: initialMessage.text,
      lastTimestamp: "Just now",
      unread: 0,
      status: "active",
      tags: [newConvContactType === "patient" ? "patient" : "partner", ...(newConvSubject.trim() ? [newConvSubject.toLowerCase().split(" ")[0]] : [])],
      messages: [initialMessage],
      threads: initialThread ? [initialThread] : [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedConv(newConv);
    setSelectedThread(null);
    setShowNewConvDialog(false);
    resetNewConvForm();
  }

  /* -- New Thread handlers -- */

  function resetNewThreadForm() {
    setNewThreadSubject("");
    setNewThreadMessage("");
    setNewThreadPhiWarnings([]);
  }

  function handleCreateThread() {
    if (!selectedConv || !newThreadSubject.trim()) return;

    const warnings = validateFieldsForPhi({
      "Subject": newThreadSubject,
      "Message": newThreadMessage,
    });
    setNewThreadPhiWarnings(warnings);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const threadId = `${selectedConv.id}-t${Date.now()}`;

    const safeSubject = sanitizeInput(newThreadSubject);
    const safeMessage = warnings.length > 0 ? redactPhi(sanitizeInput(newThreadMessage)) : sanitizeInput(newThreadMessage);

    const threadMsg: Message | null = newThreadMessage.trim()
      ? {
          id: `${threadId}-m1`,
          sender: "agent" as const,
          text: safeMessage,
          timestamp: timeStr,
          channel: selectedConv.channel,
          read: true,
          threadId,
        }
      : null;

    const newThread: Thread = {
      id: threadId,
      subject: safeSubject,
      createdAt: timeStr,
      status: "open",
      messages: threadMsg ? [threadMsg] : [],
    };

    const updatedConv: Conversation = {
      ...selectedConv,
      threads: [...selectedConv.threads, newThread],
    };

    setConversations((prev) => prev.map((c) => (c.id === selectedConv.id ? updatedConv : c)));
    setSelectedConv(updatedConv);
    setSelectedThread(newThread);
    setShowNewThreadDialog(false);
    resetNewThreadForm();
  }

  /* -- Send message in thread -- */

  function handleSendThreadMessage() {
    if (!selectedConv || !selectedThread || !threadComposeText.trim()) return;

    const phiDetected = containsPhi(threadComposeText);
    const safeText = phiDetected ? redactPhi(sanitizeInput(threadComposeText)) : sanitizeInput(threadComposeText);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const newMsg: Message = {
      id: `${selectedThread.id}-m${Date.now()}`,
      sender: "agent",
      text: safeText,
      timestamp: timeStr,
      channel: selectedConv.channel,
      read: true,
      threadId: selectedThread.id,
    };

    const updatedThread = { ...selectedThread, messages: [...selectedThread.messages, newMsg] };
    const updatedConv = {
      ...selectedConv,
      threads: selectedConv.threads.map((t2) => (t2.id === selectedThread.id ? updatedThread : t2)),
    };

    setConversations((prev) => prev.map((c) => (c.id === selectedConv.id ? updatedConv : c)));
    setSelectedConv(updatedConv);
    setSelectedThread(updatedThread);
    setThreadComposeText("");
  }

  /* -- Send message in main conversation -- */

  function handleSendMessage() {
    if (!selectedConv || !composeText.trim()) return;

    const phiDetected = containsPhi(composeText);
    const safeText = phiDetected ? redactPhi(sanitizeInput(composeText)) : sanitizeInput(composeText);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const newMsg: Message = {
      id: `${selectedConv.id}-m${Date.now()}`,
      sender: "agent",
      text: safeText,
      timestamp: timeStr,
      channel: selectedConv.channel,
      read: true,
    };

    const updatedConv: Conversation = {
      ...selectedConv,
      messages: [...selectedConv.messages, newMsg],
      lastMessage: safeText,
      lastTimestamp: "Just now",
    };

    setConversations((prev) => prev.map((c) => (c.id === selectedConv.id ? updatedConv : c)));
    setSelectedConv(updatedConv);
    setComposeText("");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Bar */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {t("communication.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("communication.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <Badge className="gradient-primary text-primary-foreground border-0 text-xs px-2.5">
                {t("communication.unreadCount", { count: totalUnread })}
              </Badge>
            )}
            <Dialog open={showNewConvDialog} onOpenChange={(open) => { setShowNewConvDialog(open); if (!open) resetNewConvForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 gap-1.5 rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                  {t("communication.newConversation")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {t("communication.startNewConversation")}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {t("communication.startNewConversationDesc")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Contact Type Toggle */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("communication.contactType")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["patient", "external-partner"] as const).map((ct) => {
                        const cfg = CONTACT_TYPE_CONFIG[ct];
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={ct}
                            onClick={() => { setNewConvContactType(ct); setNewConvAgent(""); setNewConvChannel("chat"); }}
                            className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
                              newConvContactType === ct
                                ? `${cfg.color} border-current`
                                : "border-border text-muted-foreground hover:bg-white/5"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <div className="text-left">
                              <p className="text-sm font-semibold">{cfg.label}</p>
                              <p className="text-[10px] opacity-70">
                                {ct === "patient" ? t("communication.clinicalOrOutreach") : t("communication.vendorsLabsPartners")}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="conv-name" className="text-xs">{t("communication.contactName")} *</Label>
                      <Input
                        id="conv-name"
                        value={newConvName}
                        onChange={(e) => setNewConvName(e.target.value)}
                        placeholder={newConvContactType === "patient" ? t("communication.patientNamePlaceholder") : t("communication.contactNamePlaceholder")}
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="conv-email" className="text-xs">{t("communication.email")}</Label>
                      <Input
                        id="conv-email"
                        value={newConvEmail}
                        onChange={(e) => setNewConvEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="conv-phone" className="text-xs">{t("communication.phone")}</Label>
                      <Input
                        id="conv-phone"
                        value={newConvPhone}
                        onChange={(e) => setNewConvPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                      />
                    </div>
                    {newConvContactType === "external-partner" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="conv-org" className="text-xs">{t("communication.organization")}</Label>
                        <Input
                          id="conv-org"
                          value={newConvOrg}
                          onChange={(e) => setNewConvOrg(e.target.value)}
                          placeholder={t("communication.organizationPlaceholder")}
                          className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Agent Assignment */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("communication.assignAgent")} *</Label>
                    <Select value={newConvAgent} onValueChange={(val) => { setNewConvAgent(val); const z = AGENT_ZONE_MAP[val]; if (z && !ZONE_ALLOWED_CHANNELS[z].includes(newConvChannel)) setNewConvChannel(ZONE_ALLOWED_CHANNELS[z][0]); }}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm">
                        <SelectValue placeholder={t("communication.selectAgent")} />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_AGENTS.map((agent) => {
                          const disabled = newConvContactType === "external-partner" && agent.zone === "clinical";
                          return (
                            <SelectItem key={agent.name} value={agent.name} disabled={disabled}>
                              <span className="flex items-center gap-2">
                                {agent.name}
                                <Badge variant="outline" className={`text-[8px] px-1 py-0 ${ZONE_BADGE_CONFIG[agent.zone].color}`}>
                                  {agent.zone === "clinical" ? "Z1" : agent.zone === "operations" ? "Z2" : "Z3"}
                                </Badge>
                                {disabled && <Lock className="h-3 w-3 text-red-400" />}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {zoneViolation && (
                      <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                        <Shield className="h-3 w-3" />
                        {t("communication.zoneViolationWarning")}
                      </p>
                    )}
                  </div>

                  {/* Channel Selection */}
                  {selectedAgentZone && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("communication.channel")}</Label>
                      <div className="flex gap-1.5 flex-wrap">
                        {(["chat", "sms", "email", "voice", "web"] as ChannelType[]).map((ch) => {
                          const allowed = allowedChannels.includes(ch);
                          const cfg = CHANNEL_CONFIG[ch];
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={ch}
                              onClick={() => allowed && setNewConvChannel(ch)}
                              disabled={!allowed}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                !allowed
                                  ? "text-muted-foreground/30 border-border/30 cursor-not-allowed"
                                  : newConvChannel === ch
                                  ? `${cfg.color} border-current`
                                  : "text-muted-foreground border-border hover:bg-white/5"
                              }`}
                            >
                              {!allowed && <Lock className="h-2.5 w-2.5" />}
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                      {selectedAgentZone !== "external" && (
                        <p className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {selectedAgentZone === "clinical"
                            ? t("communication.zone1Restriction")
                            : t("communication.zone2Restriction")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Subject & Initial Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="conv-subject" className="text-xs">{t("communication.subjectTopic")}</Label>
                    <Input
                      id="conv-subject"
                      value={newConvSubject}
                      onChange={(e) => setNewConvSubject(e.target.value)}
                      placeholder={t("communication.subjectPlaceholder")}
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="conv-msg" className="text-xs">{t("communication.initialMessage")}</Label>
                    <Textarea
                      id="conv-msg"
                      value={newConvMessage}
                      onChange={(e) => setNewConvMessage(e.target.value)}
                      placeholder={t("communication.initialMessagePlaceholder")}
                      rows={3}
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm resize-none"
                    />
                  </div>

                  {/* PHI Warnings */}
                  {newConvPhiWarnings.length > 0 && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t("communication.phiDetected")}
                      </div>
                      {newConvPhiWarnings.map((w, i) => (
                        <p key={i} className="text-[11px] text-amber-400/80">{w}</p>
                      ))}
                    </div>
                  )}

                  {/* PHI Compliance Notice */}
                  <div className="rounded-lg border border-border bg-red-500/5 p-3 flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-red-400/80 space-y-0.5">
                      <p className="font-semibold text-red-400">{t("communication.phiComplianceActive")}</p>
                      <p>{t("communication.phiComplianceDesc")}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => { setShowNewConvDialog(false); resetNewConvForm(); }} className="border-border text-muted-foreground hover:text-foreground">
                    {t("communication.cancel")}
                  </Button>
                  <Button
                    onClick={() => { handleNewConvPhiCheck(); handleCreateConversation(); }}
                    disabled={!newConvName.trim() || !newConvAgent || zoneViolation}
                    className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("communication.startConversation")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Zone Isolation Banner */}
        <div className="border-b border-border px-6 py-2.5 bg-red-500/5 flex items-center gap-3">
          <Shield className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400/90">
            <span className="font-semibold">{t("communication.zoneIsolationActive")}:</span> {t("communication.zoneIsolationDesc")}
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* -- Left Panel: Conversation List -- */}
          <div className="w-80 border-r border-border flex flex-col shrink-0">
            {/* Search & Filter */}
            <div className="p-3 space-y-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("communication.searchConversations")}
                  className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50 h-9 text-sm"
                />
              </div>
              {/* Contact Type Filter */}
              <div className="flex gap-1">
                {(["all", "patient", "external-partner"] as const).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setContactTypeFilter(ct)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      contactTypeFilter === ct
                        ? "gradient-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {ct === "all" ? (
                      t("communication.all")
                    ) : ct === "patient" ? (
                      <><Heart className="h-3 w-3" /> {t("communication.patients")}</>
                    ) : (
                      <><Building2 className="h-3 w-3" /> {t("communication.partners")}</>
                    )}
                  </button>
                ))}
              </div>
              {/* Channel Filter */}
              <div className="flex gap-1 overflow-x-auto">
                {(["all", "chat", "sms", "email", "voice", "web"] as const).map((ch) => {
                  const isRestricted = selectedConv && ch !== "all" && !ZONE_ALLOWED_CHANNELS[selectedConv.zone || "external"].includes(ch as ChannelType);
                  return (
                    <button
                      key={ch}
                      onClick={() => !isRestricted && setChannelFilter(ch)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                        isRestricted
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : channelFilter === ch
                          ? "gradient-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      disabled={isRestricted}
                    >
                      {isRestricted && <Lock className="h-2.5 w-2.5" />}
                      {ch === "all" ? t("communication.all") : CHANNEL_CONFIG[ch as ChannelType].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => {
                const ChannelIcon = CHANNEL_CONFIG[conv.channel].icon;
                const ContactTypeIcon = CONTACT_TYPE_CONFIG[conv.contactType].icon;
                const isActive = selectedConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => { setSelectedConv(conv); setSelectedThread(null); }}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                      isActive
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                          conv.contactType === "external-partner" ? "bg-emerald-500/15" : "bg-primary/15"
                        }`}>
                          <ContactTypeIcon className={`h-4 w-4 ${
                            conv.contactType === "external-partner" ? "text-emerald-400" : "text-primary"
                          }`} />
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
                            {t("communication.via")} {conv.agentName}
                          </span>
                          <Badge variant="outline" className={`text-[8px] px-1 py-0 ${ZONE_BADGE_CONFIG[conv.zone || "external"].color}`}>
                            {(conv.zone || "external") === "clinical" ? "Z1" : (conv.zone || "external") === "operations" ? "Z2" : "Z3"}
                          </Badge>
                          <Badge variant="outline" className={`text-[8px] px-1 py-0 ${CONTACT_TYPE_CONFIG[conv.contactType].color}`}>
                            {CONTACT_TYPE_CONFIG[conv.contactType].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs truncate flex-1 ${conv.unread > 0 ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
                            {conv.lastMessage}
                          </p>
                          {conv.threads.length > 0 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 text-violet-400 bg-violet-500/10 border-violet-500/30 shrink-0">
                              <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                              {conv.threads.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t("communication.noConversationsMatch")}
                </div>
              )}
            </div>
          </div>

          {/* -- Center Panel: Message Thread -- */}
          {selectedConv ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Thread Header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {selectedThread && (
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    selectedConv.contactType === "external-partner" ? "bg-emerald-500/15" : "bg-primary/15"
                  }`}>
                    {selectedConv.contactType === "external-partner"
                      ? <Building2 className="h-4 w-4 text-emerald-400" />
                      : <Heart className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                      {selectedThread ? (
                        <>
                          <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                          {selectedThread.subject}
                        </>
                      ) : (
                        selectedConv.contactName
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedThread && (
                        <span className="text-[11px] text-muted-foreground">
                          {t("communication.in")} {selectedConv.contactName}
                        </span>
                      )}
                      <Badge variant="outline" className={`text-[10px] border ${CHANNEL_CONFIG[selectedConv.channel].color} px-1.5 py-0`}>
                        {CHANNEL_CONFIG[selectedConv.channel].label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {t("communication.handledBy")} <span className="text-primary font-medium">{selectedConv.agentName}</span>
                      </span>
                      {selectedConv.zone && (
                        <Badge variant="outline" className={`text-[9px] ${ZONE_BADGE_CONFIG[selectedConv.zone].color}`}>
                          {ZONE_BADGE_CONFIG[selectedConv.zone].label}
                        </Badge>
                      )}
                      {selectedConv.organization && (
                        <span className="text-[10px] text-emerald-400/70 flex items-center gap-0.5">
                          <Building2 className="h-2.5 w-2.5" />
                          {selectedConv.organization}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedThread && (
                    <Dialog open={showNewThreadDialog} onOpenChange={(open) => { setShowNewThreadDialog(open); if (!open) resetNewThreadForm(); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground">
                          <GitBranch className="h-3 w-3" />
                          {t("communication.newThread")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[440px] bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="font-display text-foreground flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-violet-400" />
                            {t("communication.createThread")}
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            {t("communication.createThreadDesc", { name: selectedConv.contactName })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="thread-subject" className="text-xs">{t("communication.threadSubject")} *</Label>
                            <Input
                              id="thread-subject"
                              value={newThreadSubject}
                              onChange={(e) => setNewThreadSubject(e.target.value)}
                              placeholder={t("communication.threadSubjectPlaceholder")}
                              className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="thread-msg" className="text-xs">{t("communication.initialMessageOptional")}</Label>
                            <Textarea
                              id="thread-msg"
                              value={newThreadMessage}
                              onChange={(e) => setNewThreadMessage(e.target.value)}
                              placeholder={t("communication.startThreadPlaceholder")}
                              rows={3}
                              className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm resize-none"
                            />
                          </div>
                          {newThreadPhiWarnings.length > 0 && (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {t("communication.phiDetectedRedacted")}
                              </div>
                              {newThreadPhiWarnings.map((w, i) => (
                                <p key={i} className="text-[11px] text-amber-400/80">{w}</p>
                              ))}
                            </div>
                          )}
                          <div className="rounded-lg border border-border bg-red-500/5 p-2.5 flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            <p className="text-[10px] text-red-400/80">
                              {t("communication.threadInheritsRestrictions")}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={() => { setShowNewThreadDialog(false); resetNewThreadForm(); }} className="border-border text-muted-foreground hover:text-foreground">
                            {t("communication.cancel")}
                          </Button>
                          <Button
                            onClick={handleCreateThread}
                            disabled={!newThreadSubject.trim()}
                            className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 gap-1.5"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            {t("communication.createThread")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
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
                    {selectedConv.status === "active" ? t("communication.statusActive") : selectedConv.status === "pending" ? t("communication.statusPending") : t("communication.statusResolved")}
                  </Badge>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Threads Bar (when viewing main conversation) */}
              {!selectedThread && selectedConv.threads.length > 0 && (
                <div className="px-5 py-2 border-b border-border bg-violet-500/5 flex items-center gap-2 overflow-x-auto shrink-0">
                  <GitBranch className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider shrink-0">{t("communication.threads")}:</span>
                  {selectedConv.threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-violet-500/30 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-colors whitespace-nowrap"
                    >
                      {thread.subject}
                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-violet-500/30 text-violet-400">
                        {thread.messages.length}
                      </Badge>
                      <Badge variant="outline" className={`text-[8px] px-1 py-0 ${thread.status === "open" ? "text-green-400 border-green-500/30" : "text-muted-foreground border-border"}`}>
                        {thread.status === "open" ? t("communication.open") : t("communication.closed")}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {(selectedThread ? selectedThread.messages : selectedConv.messages).map((msg) => {
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
                    value={selectedThread ? threadComposeText : composeText}
                    onChange={(e) => selectedThread ? setThreadComposeText(e.target.value) : setComposeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (selectedThread) { handleSendThreadMessage(); } else { handleSendMessage(); }
                      }
                    }}
                    placeholder={selectedThread ? t("communication.replyInThread") : t("communication.typeMessage")}
                    className="flex-1 bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                  />
                  <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 gap-1.5 rounded-lg"
                    disabled={selectedThread ? !threadComposeText.trim() : !composeText.trim()}
                    onClick={() => selectedThread ? handleSendThreadMessage() : handleSendMessage()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("communication.send")}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 ml-10">
                  {selectedConv?.zone === "clinical" ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {t("communication.zone1MessageRestriction")}
                    </span>
                  ) : selectedConv?.contactType === "external-partner" ? (
                    <span className="text-emerald-400/80 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {t("communication.externalPartnerPhiRedaction")}
                    </span>
                  ) : (
                    t("communication.directMessageOverride")
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">{t("communication.selectConversation")}</p>
                <p className="text-xs mt-1">{t("communication.selectConversationDesc")}</p>
              </div>
            </div>
          )}

          {/* -- Right Panel: Contact Details -- */}
          {selectedConv && showDetails && (
            <div className="w-72 border-l border-border overflow-y-auto shrink-0">
              <div className="p-4 space-y-5">
                {/* Contact Card */}
                <div className="text-center">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    selectedConv.contactType === "external-partner" ? "bg-emerald-500/15" : "bg-primary/15"
                  }`}>
                    {selectedConv.contactType === "external-partner"
                      ? <Building2 className="h-7 w-7 text-emerald-400" />
                      : <Heart className="h-7 w-7 text-primary" />
                    }
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm">
                    {selectedConv.contactName}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="outline" className={`text-[10px] ${CONTACT_TYPE_CONFIG[selectedConv.contactType].color}`}>
                      {CONTACT_TYPE_CONFIG[selectedConv.contactType].label}
                    </Badge>
                  </div>
                  {selectedConv.organization && (
                    <p className="text-xs text-emerald-400/70 mt-1 flex items-center justify-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedConv.organization}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedConv.contactEmail}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("communication.contactInfo")}
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
                    {t("communication.assignedAgent")}
                  </h4>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{selectedConv.agentName}</p>
                      <p className="text-[10px] text-muted-foreground">{t("communication.aiAgent")}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {t("communication.tags")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConv.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0 capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Threads */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {t("communication.threads")}
                  </h4>
                  {selectedConv.threads.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedConv.threads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full text-left p-2 rounded-lg border transition-colors ${
                            selectedThread?.id === thread.id
                              ? "border-violet-500/40 bg-violet-500/10"
                              : "border-border hover:bg-white/5"
                          }`}
                        >
                          <p className="text-xs font-semibold text-foreground truncate">{thread.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{t("communication.msgCount", { count: thread.messages.length })}</span>
                            <Badge variant="outline" className={`text-[8px] px-1 py-0 ${thread.status === "open" ? "text-green-400 border-green-500/30" : "text-muted-foreground border-border"}`}>
                              {thread.status === "open" ? t("communication.open") : t("communication.closed")}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">{t("communication.noThreadsYet")}</p>
                  )}
                </div>

                {/* Conversation Stats */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("communication.conversationStats")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-foreground">{selectedConv.messages.length}</p>
                      <p className="text-[10px] text-muted-foreground">{t("communication.messages")}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-foreground">
                        {selectedConv.messages.filter((m) => m.sender === "agent").length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("communication.agentMsgs")}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-violet-400">{selectedConv.threads.length}</p>
                      <p className="text-[10px] text-muted-foreground">{t("communication.threads")}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-foreground">
                        {selectedConv.threads.reduce((sum, t2) => sum + t2.messages.length, 0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("communication.threadMsgs")}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t("communication.activity")}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-foreground/80">{t("communication.conversationStarted")}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedConv.messages[0]?.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-foreground/80">{t("communication.lastActivity")}</p>
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
