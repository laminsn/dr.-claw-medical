import { useState } from "react";
import {
  CreditCard,
  Bot,
  DollarSign,
  Plus,
  Settings,
  Shield,
  AlertTriangle,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wallet,
  Receipt,
  PieChart,
  Clock,
  Search,
  Filter,
  Snowflake,
  Flame,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CardStatus = "Active" | "Frozen" | "Expired";
type CardType = "Visa" | "Mastercard" | "Amex";
type TransactionStatus = "Completed" | "Pending" | "Declined";
type SpendingCategory =
  | "API Costs"
  | "SaaS Subscriptions"
  | "Communication Tools"
  | "Marketing"
  | "Training Data"
  | "Infrastructure";
type AlertSeverity = "warning" | "critical" | "info";
type TabKey = "cards" | "limits" | "transactions" | "alerts";

interface CompanyCard {
  id: string;
  name: string;
  last4: string;
  cardType: CardType;
  expiry: string;
  billingAddress: string;
  status: CardStatus;
  assignedAgents: string[];
}

interface AgentLimit {
  agentId: string;
  agentName: string;
  cardId: string;
  dailyLimit: number;
  dailySpent: number;
  monthlyLimit: number;
  monthlySpent: number;
  perTransactionLimit: number;
  categoryLimits: Record<SpendingCategory, { limit: number; spent: number }>;
}

interface Transaction {
  id: string;
  agentName: string;
  cardId: string;
  amount: number;
  category: SpendingCategory;
  timestamp: string;
  status: TransactionStatus;
  description: string;
}

interface SpendAlert {
  id: string;
  agentName: string;
  message: string;
  severity: AlertSeverity;
  threshold: number;
  currentPercent: number;
  timestamp: string;
  dismissed: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const cardStatusColors: Record<CardStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Frozen: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Expired: "bg-red-500/15 text-red-400 border-red-500/30",
};

const txStatusColors: Record<TransactionStatus, string> = {
  Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Declined: "bg-red-500/15 text-red-400 border-red-500/30",
};

const categoryColors: Record<SpendingCategory, string> = {
  "API Costs": "bg-violet-500",
  "SaaS Subscriptions": "bg-blue-500",
  "Communication Tools": "bg-emerald-500",
  Marketing: "bg-amber-500",
  "Training Data": "bg-rose-500",
  Infrastructure: "bg-cyan-500",
};

const cardGradients: Record<CardType, string> = {
  Visa: "from-blue-600/40 via-indigo-600/30 to-purple-700/40",
  Mastercard: "from-orange-600/40 via-red-600/30 to-pink-700/40",
  Amex: "from-emerald-600/40 via-teal-600/30 to-cyan-700/40",
};

const SPENDING_CATEGORIES: SpendingCategory[] = [
  "API Costs",
  "SaaS Subscriptions",
  "Communication Tools",
  "Marketing",
  "Training Data",
  "Infrastructure",
];

const AGENTS = [
  { id: "a1", name: "Dr. Front Desk" },
  { id: "a2", name: "Billing Bot" },
  { id: "a3", name: "Intake Specialist" },
  { id: "a4", name: "Claims Processor" },
  { id: "a5", name: "Patient Outreach" },
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const initialCards: CompanyCard[] = [
  {
    id: "c1",
    name: "Operations Card",
    last4: "4242",
    cardType: "Visa",
    expiry: "09/27",
    billingAddress: "123 Medical Pkwy, Suite 200, Austin TX 78701",
    status: "Active",
    assignedAgents: ["a1", "a2"],
  },
  {
    id: "c2",
    name: "Marketing Card",
    last4: "8819",
    cardType: "Mastercard",
    expiry: "03/26",
    billingAddress: "123 Medical Pkwy, Suite 200, Austin TX 78701",
    status: "Active",
    assignedAgents: ["a5"],
  },
  {
    id: "c3",
    name: "Infrastructure Card",
    last4: "3711",
    cardType: "Amex",
    expiry: "12/24",
    billingAddress: "456 Health Blvd, Floor 5, Austin TX 78702",
    status: "Expired",
    assignedAgents: ["a3", "a4"],
  },
];

const initialAgentLimits: AgentLimit[] = [
  {
    agentId: "a1",
    agentName: "Dr. Front Desk",
    cardId: "c1",
    dailyLimit: 500,
    dailySpent: 312,
    monthlyLimit: 8000,
    monthlySpent: 5240,
    perTransactionLimit: 200,
    categoryLimits: {
      "API Costs": { limit: 3000, spent: 2100 },
      "SaaS Subscriptions": { limit: 2000, spent: 1400 },
      "Communication Tools": { limit: 1500, spent: 890 },
      Marketing: { limit: 500, spent: 120 },
      "Training Data": { limit: 500, spent: 430 },
      Infrastructure: { limit: 500, spent: 300 },
    },
  },
  {
    agentId: "a2",
    agentName: "Billing Bot",
    cardId: "c1",
    dailyLimit: 1000,
    dailySpent: 870,
    monthlyLimit: 15000,
    monthlySpent: 12800,
    perTransactionLimit: 500,
    categoryLimits: {
      "API Costs": { limit: 5000, spent: 4800 },
      "SaaS Subscriptions": { limit: 4000, spent: 3200 },
      "Communication Tools": { limit: 2000, spent: 1600 },
      Marketing: { limit: 1000, spent: 200 },
      "Training Data": { limit: 1500, spent: 1500 },
      Infrastructure: { limit: 1500, spent: 1500 },
    },
  },
  {
    agentId: "a5",
    agentName: "Patient Outreach",
    cardId: "c2",
    dailyLimit: 300,
    dailySpent: 45,
    monthlyLimit: 5000,
    monthlySpent: 1820,
    perTransactionLimit: 150,
    categoryLimits: {
      "API Costs": { limit: 1000, spent: 320 },
      "SaaS Subscriptions": { limit: 800, spent: 500 },
      "Communication Tools": { limit: 2000, spent: 700 },
      Marketing: { limit: 800, spent: 200 },
      "Training Data": { limit: 200, spent: 60 },
      Infrastructure: { limit: 200, spent: 40 },
    },
  },
  {
    agentId: "a3",
    agentName: "Intake Specialist",
    cardId: "c3",
    dailyLimit: 400,
    dailySpent: 0,
    monthlyLimit: 6000,
    monthlySpent: 0,
    perTransactionLimit: 200,
    categoryLimits: {
      "API Costs": { limit: 2000, spent: 0 },
      "SaaS Subscriptions": { limit: 1500, spent: 0 },
      "Communication Tools": { limit: 1000, spent: 0 },
      Marketing: { limit: 500, spent: 0 },
      "Training Data": { limit: 500, spent: 0 },
      Infrastructure: { limit: 500, spent: 0 },
    },
  },
  {
    agentId: "a4",
    agentName: "Claims Processor",
    cardId: "c3",
    dailyLimit: 750,
    dailySpent: 0,
    monthlyLimit: 10000,
    monthlySpent: 0,
    perTransactionLimit: 350,
    categoryLimits: {
      "API Costs": { limit: 3000, spent: 0 },
      "SaaS Subscriptions": { limit: 2500, spent: 0 },
      "Communication Tools": { limit: 1500, spent: 0 },
      Marketing: { limit: 500, spent: 0 },
      "Training Data": { limit: 1000, spent: 0 },
      Infrastructure: { limit: 1500, spent: 0 },
    },
  },
];

const initialTransactions: Transaction[] = [
  { id: "t1", agentName: "Dr. Front Desk", cardId: "c1", amount: 45.00, category: "API Costs", timestamp: "2026-02-18 09:14", status: "Completed", description: "OpenAI GPT-5 inference batch" },
  { id: "t2", agentName: "Billing Bot", cardId: "c1", amount: 120.00, category: "SaaS Subscriptions", timestamp: "2026-02-18 08:30", status: "Completed", description: "Stripe billing platform renewal" },
  { id: "t3", agentName: "Patient Outreach", cardId: "c2", amount: 32.50, category: "Communication Tools", timestamp: "2026-02-18 08:15", status: "Completed", description: "Twilio SMS campaign batch" },
  { id: "t4", agentName: "Billing Bot", cardId: "c1", amount: 550.00, category: "Infrastructure", timestamp: "2026-02-18 07:45", status: "Declined", description: "AWS reserved instance — exceeded limit" },
  { id: "t5", agentName: "Dr. Front Desk", cardId: "c1", amount: 89.99, category: "SaaS Subscriptions", timestamp: "2026-02-17 16:20", status: "Completed", description: "Calendly enterprise plan" },
  { id: "t6", agentName: "Patient Outreach", cardId: "c2", amount: 12.50, category: "Marketing", timestamp: "2026-02-17 14:10", status: "Pending", description: "Mailchimp email campaign" },
  { id: "t7", agentName: "Billing Bot", cardId: "c1", amount: 200.00, category: "API Costs", timestamp: "2026-02-17 11:30", status: "Completed", description: "Anthropic Claude API batch" },
  { id: "t8", agentName: "Dr. Front Desk", cardId: "c1", amount: 75.00, category: "Training Data", timestamp: "2026-02-17 10:00", status: "Completed", description: "Medical NLP dataset license" },
  { id: "t9", agentName: "Billing Bot", cardId: "c1", amount: 340.00, category: "Infrastructure", timestamp: "2026-02-16 22:00", status: "Completed", description: "GCP compute engine hours" },
  { id: "t10", agentName: "Patient Outreach", cardId: "c2", amount: 28.00, category: "Communication Tools", timestamp: "2026-02-16 17:45", status: "Completed", description: "SendGrid email delivery" },
  { id: "t11", agentName: "Dr. Front Desk", cardId: "c1", amount: 15.00, category: "API Costs", timestamp: "2026-02-16 14:30", status: "Completed", description: "Google Maps geocoding calls" },
  { id: "t12", agentName: "Billing Bot", cardId: "c1", amount: 450.00, category: "SaaS Subscriptions", timestamp: "2026-02-16 09:00", status: "Completed", description: "Salesforce Health Cloud license" },
  { id: "t13", agentName: "Patient Outreach", cardId: "c2", amount: 65.00, category: "Marketing", timestamp: "2026-02-15 16:00", status: "Completed", description: "Facebook Ads API spend" },
  { id: "t14", agentName: "Dr. Front Desk", cardId: "c1", amount: 110.00, category: "Training Data", timestamp: "2026-02-15 11:00", status: "Completed", description: "ICD-10 code dataset update" },
  { id: "t15", agentName: "Billing Bot", cardId: "c1", amount: 180.00, category: "API Costs", timestamp: "2026-02-15 08:30", status: "Completed", description: "OpenAI embeddings generation" },
  { id: "t16", agentName: "Patient Outreach", cardId: "c2", amount: 22.00, category: "Communication Tools", timestamp: "2026-02-14 15:20", status: "Completed", description: "Vonage voice API calls" },
];

const initialAlerts: SpendAlert[] = [
  { id: "al1", agentName: "Billing Bot", message: "Monthly spend at 85% of limit ($12,800 / $15,000)", severity: "warning", threshold: 80, currentPercent: 85, timestamp: "2026-02-18 08:00", dismissed: false },
  { id: "al2", agentName: "Billing Bot", message: "API Costs category at 96% ($4,800 / $5,000)", severity: "critical", threshold: 90, currentPercent: 96, timestamp: "2026-02-18 07:50", dismissed: false },
  { id: "al3", agentName: "Billing Bot", message: "Training Data limit reached (100%)", severity: "critical", threshold: 100, currentPercent: 100, timestamp: "2026-02-18 07:45", dismissed: false },
  { id: "al4", agentName: "Billing Bot", message: "Infrastructure limit reached (100%)", severity: "critical", threshold: 100, currentPercent: 100, timestamp: "2026-02-18 07:45", dismissed: false },
  { id: "al5", agentName: "Dr. Front Desk", message: "Daily spend at 62% of limit ($312 / $500)", severity: "info", threshold: 80, currentPercent: 62, timestamp: "2026-02-18 09:14", dismissed: false },
  { id: "al6", agentName: "Billing Bot", message: "Daily spend at 87% of limit ($870 / $1,000)", severity: "warning", threshold: 80, currentPercent: 87, timestamp: "2026-02-18 08:30", dismissed: false },
  { id: "al7", agentName: "Billing Bot", message: "Transaction declined — $550 exceeds per-transaction limit of $500", severity: "critical", threshold: 100, currentPercent: 110, timestamp: "2026-02-18 07:45", dismissed: false },
  { id: "al8", agentName: "Dr. Front Desk", message: "Monthly spend at 66% of limit ($5,240 / $8,000)", severity: "info", threshold: 80, currentPercent: 66, timestamp: "2026-02-17 16:20", dismissed: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const pct = (spent: number, limit: number) =>
  limit === 0 ? 0 : Math.min(Math.round((spent / limit) * 100), 100);

const barColor = (percent: number) => {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 90) return "bg-red-400";
  if (percent >= 80) return "bg-amber-400";
  return "bg-emerald-400";
};

const alertSeverityStyles: Record<AlertSeverity, string> = {
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const CompanyCards = () => {
  const { toast } = useToast();

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("cards");
  const [cards, setCards] = useState<CompanyCard[]>(initialCards);
  const [agentLimits] = useState<AgentLimit[]>(initialAgentLimits);
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [alerts, setAlerts] = useState<SpendAlert[]>(initialAlerts);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState<Record<string, boolean>>({});
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState<TransactionStatus | "All">("All");

  // Add-card form
  const [newCardName, setNewCardName] = useState("");
  const [newCardLast4, setNewCardLast4] = useState("");
  const [newCardType, setNewCardType] = useState<CardType>("Visa");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardAddress, setNewCardAddress] = useState("");

  // ── Computed ──────────────────────────────────────────────────────────────
  const todaySpend = transactions
    .filter((t) => t.timestamp.startsWith("2026-02-18") && t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const weekSpend = transactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthSpend = weekSpend; // same dataset window

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      txSearch === "" ||
      t.agentName.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === "All" || t.status === txFilter;
    return matchesSearch && matchesFilter;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleCardStatus = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        if (c.status === "Expired") return c;
        const next: CardStatus = c.status === "Active" ? "Frozen" : "Active";
        toast({
          title: next === "Frozen" ? "Card Frozen" : "Card Unfrozen",
          description: `${c.name} (****${c.last4}) has been ${next === "Frozen" ? "frozen" : "unfrozen"}.`,
        });
        return { ...c, status: next };
      }),
    );
  };

  const toggleShowNumber = (cardId: string) => {
    setShowCardNumbers((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleAddCard = () => {
    if (!newCardName || !newCardLast4 || !newCardExpiry || !newCardAddress) {
      toast({ title: "Missing Fields", description: "Please fill out all card details." });
      return;
    }
    if (newCardLast4.length !== 4 || !/^\d{4}$/.test(newCardLast4)) {
      toast({ title: "Invalid Digits", description: "Last 4 digits must be exactly 4 numbers." });
      return;
    }
    const card: CompanyCard = {
      id: `c${Date.now()}`,
      name: newCardName,
      last4: newCardLast4,
      cardType: newCardType,
      expiry: newCardExpiry,
      billingAddress: newCardAddress,
      status: "Active",
      assignedAgents: [],
    };
    setCards((prev) => [...prev, card]);
    setNewCardName("");
    setNewCardLast4("");
    setNewCardType("Visa");
    setNewCardExpiry("");
    setNewCardAddress("");
    setShowAddCard(false);
    toast({ title: "Card Added", description: `${card.name} (****${card.last4}) has been added.` });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)));
    toast({ title: "Alert Dismissed", description: "The alert has been dismissed." });
  };

  // ── Tab Definitions ───────────────────────────────────────────────────────
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "cards", label: "Cards", icon: <CreditCard className="h-4 w-4" /> },
    { key: "limits", label: "Agent Limits", icon: <Shield className="h-4 w-4" /> },
    { key: "transactions", label: "Transactions", icon: <Receipt className="h-4 w-4" /> },
    { key: "alerts", label: "Alerts", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  // ── Render: Cards Tab ─────────────────────────────────────────────────────
  const renderCardsTab = () => (
    <div className="space-y-6">
      {/* Spend overview row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today", value: todaySpend, icon: <Clock className="h-5 w-5 text-white" />, trend: "+12%", up: true },
          { label: "This Week", value: weekSpend, icon: <TrendingUp className="h-5 w-5 text-white" />, trend: "+8%", up: true },
          { label: "This Month", value: monthSpend, icon: <Wallet className="h-5 w-5 text-white" />, trend: "-3%", up: false },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{fmt(s.value)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {s.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className={s.up ? "text-emerald-400" : "text-red-400"}>{s.trend}</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Card List Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Company Cards
        </h2>
        <Button
          className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
          onClick={() => setShowAddCard(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => {
          const revealed = showCardNumbers[card.id] ?? false;
          const assignedAgentNames = AGENTS.filter((a) =>
            card.assignedAgents.includes(a.id),
          ).map((a) => a.name);

          return (
            <div key={card.id} className="space-y-3">
              {/* Visual credit card */}
              <div
                className={`relative rounded-2xl border border-white/10 p-6 overflow-hidden bg-gradient-to-br ${cardGradients[card.cardType]} backdrop-blur-xl`}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

                <div className="relative z-10 space-y-6">
                  {/* Top row: name + status */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white/80">{card.name}</p>
                    <Badge variant="outline" className={`text-[11px] ${cardStatusColors[card.status]}`}>
                      {card.status === "Frozen" ? (
                        <Lock className="h-3 w-3 mr-1" />
                      ) : card.status === "Active" ? (
                        <Unlock className="h-3 w-3 mr-1" />
                      ) : null}
                      {card.status}
                    </Badge>
                  </div>

                  {/* Card number */}
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono tracking-[0.25em] text-white">
                      {revealed
                        ? `**** **** **** ${card.last4}`
                        : "**** **** **** ****"}
                    </p>
                    <button
                      onClick={() => toggleShowNumber(card.id)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/50">Expires</p>
                      <p className="text-sm text-white font-medium">{card.expiry}</p>
                    </div>
                    <p className="text-base font-bold text-white tracking-wider">
                      {card.cardType.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card info panel */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Billing Address</p>
                  <div className="flex gap-1">
                    {card.status !== "Expired" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5"
                        onClick={() => toggleCardStatus(card.id)}
                        title={card.status === "Active" ? "Freeze card" : "Unfreeze card"}
                      >
                        {card.status === "Active" ? (
                          <Snowflake className="h-3.5 w-3.5" />
                        ) : (
                          <Flame className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5"
                      title="Card settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-foreground">{card.billingAddress}</p>

                {/* Assigned agents */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Assigned Agents</p>
                  {assignedAgentNames.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 italic">No agents assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedAgentNames.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[10px] bg-primary/10 text-primary border-primary/30"
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Spend Breakdown */}
      <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
        <h3 className="text-base font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Category Breakdown (This Month)
        </h3>
        <div className="space-y-3">
          {SPENDING_CATEGORIES.map((cat) => {
            const catTotal = agentLimits.reduce(
              (sum, al) => sum + al.categoryLimits[cat].spent,
              0,
            );
            const catLimit = agentLimits.reduce(
              (sum, al) => sum + al.categoryLimits[cat].limit,
              0,
            );
            const percent = pct(catTotal, catLimit);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${categoryColors[cat]}`} />
                    <span className="text-foreground">{cat}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {fmt(catTotal)} / {fmt(catLimit)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(percent)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Render: Agent Limits Tab ──────────────────────────────────────────────
  const renderLimitsTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold font-heading text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Per-Agent Spending Limits
      </h2>

      {agentLimits.map((al) => {
        const card = cards.find((c) => c.id === al.cardId);
        const dailyPct = pct(al.dailySpent, al.dailyLimit);
        const monthlyPct = pct(al.monthlySpent, al.monthlyLimit);

        return (
          <div
            key={al.agentId}
            className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover space-y-5"
          >
            {/* Agent header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{al.agentName}</p>
                  <p className="text-xs text-muted-foreground">
                    Primary card: {card ? `${card.name} (****${card.last4})` : "None"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] bg-violet-500/15 text-violet-400 border-violet-500/30 w-fit">
                <DollarSign className="h-3 w-3 mr-1" />
                Per-txn limit: {fmt(al.perTransactionLimit)}
              </Badge>
            </div>

            {/* Daily + Monthly bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily Spend</span>
                  <span className="text-foreground font-medium">
                    {fmt(al.dailySpent)} / {fmt(al.dailyLimit)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(dailyPct)}`}
                    style={{ width: `${dailyPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-right">{dailyPct}%</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Spend</span>
                  <span className="text-foreground font-medium">
                    {fmt(al.monthlySpent)} / {fmt(al.monthlyLimit)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(monthlyPct)}`}
                    style={{ width: `${monthlyPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-right">{monthlyPct}%</p>
              </div>
            </div>

            {/* Category limits */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Category Limits
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SPENDING_CATEGORIES.map((cat) => {
                  const cl = al.categoryLimits[cat];
                  const catPct = pct(cl.spent, cl.limit);
                  return (
                    <div
                      key={cat}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${categoryColors[cat]}`} />
                          <span className="text-xs text-foreground">{cat}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{catPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor(catPct)}`}
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {fmt(cl.spent)} / {fmt(cl.limit)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Render: Transactions Tab ──────────────────────────────────────────────
  const renderTransactionsTab = () => (
    <div className="space-y-6">
      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            className="pl-10 bg-card border-white/[0.06] text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Completed", "Pending", "Declined"] as const).map((f) => (
            <Button
              key={f}
              variant={txFilter === f ? "default" : "outline"}
              size="sm"
              className={
                txFilter === f
                  ? "gradient-primary text-white shadow-glow-sm"
                  : "border-white/[0.06] text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }
              onClick={() => setTxFilter(f)}
            >
              {f === "All" && <Filter className="h-3.5 w-3.5 mr-1.5" />}
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Per-Agent Spend Breakdown */}
      <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
        <h3 className="text-base font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Per-Agent Spend (This Month)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentLimits.map((al) => {
            const monthPct = pct(al.monthlySpent, al.monthlyLimit);
            return (
              <div
                key={al.agentId}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{al.agentName}</p>
                  {monthPct >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-amber-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-lg font-bold text-foreground">{fmt(al.monthlySpent)}</p>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(monthPct)}`}
                    style={{ width: `${monthPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {monthPct}% of {fmt(al.monthlyLimit)} limit
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
        <h3 className="text-base font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Transaction History
        </h3>

        <div className="rounded-lg border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Agent
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Description
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Category
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Time
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                        <span className="text-foreground font-medium">{tx.agentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${categoryColors[tx.category]}`} />
                        <span className="text-foreground text-xs">{tx.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {fmt(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${txStatusColors[tx.status]}`}>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No transactions match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render: Alerts Tab ────────────────────────────────────────────────────
  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Alert summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Critical",
            count: activeAlerts.filter((a) => a.severity === "critical").length,
            color: "from-red-600/40 to-red-800/40",
            textColor: "text-red-400",
            icon: <X className="h-5 w-5 text-white" />,
          },
          {
            label: "Warnings",
            count: activeAlerts.filter((a) => a.severity === "warning").length,
            color: "from-amber-600/40 to-amber-800/40",
            textColor: "text-amber-400",
            icon: <AlertTriangle className="h-5 w-5 text-white" />,
          },
          {
            label: "Info",
            count: activeAlerts.filter((a) => a.severity === "info").length,
            color: "from-blue-600/40 to-blue-800/40",
            textColor: "text-blue-400",
            icon: <Check className="h-5 w-5 text-white" />,
          },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.textColor}`}>{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active alerts */}
      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Active Alerts
        </h2>
        <div className="space-y-3">
          {activeAlerts.length === 0 && (
            <div className="bg-card rounded-xl border border-white/[0.06] p-8 text-center">
              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-foreground font-medium">All Clear</p>
              <p className="text-sm text-muted-foreground">No active spending alerts.</p>
            </div>
          )}
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-card rounded-xl border p-4 card-hover flex flex-col sm:flex-row sm:items-center gap-4 ${
                alert.severity === "critical"
                  ? "border-red-500/30"
                  : alert.severity === "warning"
                    ? "border-amber-500/30"
                    : "border-blue-500/30"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 ${
                    alert.severity === "critical"
                      ? "bg-red-500/15"
                      : alert.severity === "warning"
                        ? "bg-amber-500/15"
                        : "bg-blue-500/15"
                  }`}
                >
                  {alert.severity === "critical" ? (
                    <X className="h-4 w-4 text-red-400" />
                  ) : alert.severity === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${alertSeverityStyles[alert.severity]}`}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {alert.agentName}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(alert.currentPercent)}`}
                      style={{ width: `${Math.min(alert.currentPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                    {alert.currentPercent}%
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dismissed alerts */}
      {alerts.some((a) => a.dismissed) && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Dismissed Alerts</h3>
          <div className="space-y-2">
            {alerts
              .filter((a) => a.dismissed)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="bg-card rounded-lg border border-white/[0.04] p-3 opacity-50 flex items-center gap-3"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${alertSeverityStyles[alert.severity]}`}
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex-1">{alert.message}</p>
                  <span className="text-[10px] text-muted-foreground">{alert.agentName}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Render: Active tab content ────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "cards":
        return renderCardsTab();
      case "limits":
        return renderLimitsTab();
      case "transactions":
        return renderTransactionsTab();
      case "alerts":
        return renderAlertsTab();
    }
  };

  // ── Main Return ───────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                Company Cards
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage payment cards, agent assignments, and spending limits
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeAlerts.length > 0 && (
                <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {activeAlerts.length} active alert{activeAlerts.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────── */}
          <div className="flex gap-1 p-1 rounded-lg bg-card border border-white/[0.06] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "gradient-primary text-white shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "alerts" && activeAlerts.length > 0 && (
                  <span className="ml-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ────────────────────────────── */}
          {renderTabContent()}
        </div>
      </main>

      {/* ── Add Card Dialog ──────────────────────────── */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="bg-card border-white/[0.06] text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Add Company Card
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Card Name</Label>
              <Input
                placeholder="e.g. Operations Card"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="bg-white/[0.03] border-white/[0.06] text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Last 4 Digits</Label>
                <Input
                  placeholder="1234"
                  maxLength={4}
                  value={newCardLast4}
                  onChange={(e) => setNewCardLast4(e.target.value.replace(/\D/g, ""))}
                  className="bg-white/[0.03] border-white/[0.06] text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Expiry</Label>
                <Input
                  placeholder="MM/YY"
                  maxLength={5}
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.06] text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Card Type</Label>
              <div className="flex gap-2">
                {(["Visa", "Mastercard", "Amex"] as CardType[]).map((ct) => (
                  <Button
                    key={ct}
                    variant={newCardType === ct ? "default" : "outline"}
                    size="sm"
                    className={
                      newCardType === ct
                        ? "gradient-primary text-white shadow-glow-sm"
                        : "border-white/[0.06] text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }
                    onClick={() => setNewCardType(ct)}
                  >
                    {ct}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Billing Address</Label>
              <Input
                placeholder="123 Main St, City, State ZIP"
                value={newCardAddress}
                onChange={(e) => setNewCardAddress(e.target.value)}
                className="bg-white/[0.03] border-white/[0.06] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              className="border-white/[0.06] hover:bg-white/5"
              onClick={() => setShowAddCard(false)}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
              onClick={handleAddCard}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyCards;
