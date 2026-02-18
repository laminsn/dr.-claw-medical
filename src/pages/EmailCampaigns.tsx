import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Send,
  BarChart3,
  Users,
  Clock,
  Plus,
  Eye,
  Star,
  MessageSquare,
  CheckCircle2,
  Calendar,
  TrendingUp,
  FileText,
  Sparkles,
  UserCheck,
  Quote,
  ThumbsUp,
  Award,
  Search,
  MailOpen,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CampaignStatus = "scheduled" | "draft" | "active" | "paused";
type CheckInStatus = "pending" | "sent" | "responded";
type TestimonialStatus = "Pending Review" | "Approved" | "Featured";
type RecipientGroup = "all" | "new" | "active" | "custom";
type ActiveTab = "campaigns" | "testimonials";

interface Campaign {
  id: string;
  name: string;
  description: string;
  frequency: string;
  nextSendDate: string;
  status: CampaignStatus;
  recipientCount: number;
}

interface CampaignHistoryEntry {
  id: string;
  name: string;
  sentDate: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
}

interface CheckInUser {
  id: string;
  name: string;
  email: string;
  signupDate: string;
  checkInStatus: CheckInStatus;
  rating: number;
  testimonialText: string;
}

interface Testimonial {
  id: string;
  userName: string;
  date: string;
  rating: number;
  quote: string;
  status: TestimonialStatus;
}

// ---------------------------------------------------------------------------
// Config (colors only — labels are moved inside component for i18n)
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<
  CampaignStatus,
  { color: string; bg: string }
> = {
  scheduled: {
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
  },
  draft: {
    color: "text-zinc-400",
    bg: "bg-zinc-500/15 border-zinc-500/30",
  },
  active: {
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
  paused: {
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
};

const CHECKIN_STATUS_COLORS: Record<
  CheckInStatus,
  { color: string; bg: string }
> = {
  pending: {
    color: "text-zinc-400",
    bg: "bg-zinc-500/15 border-zinc-500/30",
  },
  sent: {
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
  },
  responded: {
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
};

const TESTIMONIAL_STATUS_COLORS: Record<
  TestimonialStatus,
  { color: string; bg: string }
> = {
  "Pending Review": {
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  Approved: {
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
  },
  Featured: {
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Weekly Tips & Tricks",
    description:
      "Curated weekly tips for getting the most out of your AI agents. Auto-sends every Monday at 9:00 AM.",
    frequency: "Weekly (Mondays)",
    nextSendDate: "2026-02-23",
    status: "scheduled",
    recipientCount: 1247,
  },
  {
    id: "camp-2",
    name: "Monthly New Skills Spotlight",
    description:
      "Highlights newly released agent skills and features each month with usage guides and best practices.",
    frequency: "Monthly (1st of month)",
    nextSendDate: "2026-03-01",
    status: "active",
    recipientCount: 1182,
  },
  {
    id: "camp-3",
    name: "Onboarding Drip Sequence",
    description:
      "3-email onboarding series for new users: Welcome (Day 1), Getting Started (Day 3), and Power Tips (Day 7).",
    frequency: "Drip (3 emails over 7 days)",
    nextSendDate: "2026-02-17",
    status: "active",
    recipientCount: 89,
  },
  {
    id: "camp-4",
    name: "Product Update Digest",
    description:
      "Bi-weekly digest of product updates, bug fixes, and upcoming features. Keeps users informed on platform changes.",
    frequency: "Bi-weekly (Fridays)",
    nextSendDate: "2026-02-27",
    status: "draft",
    recipientCount: 0,
  },
  {
    id: "camp-5",
    name: "Re-engagement Campaign",
    description:
      "Targeted emails to users who haven't logged in for 14+ days with personalized content to bring them back.",
    frequency: "Triggered (inactive 14+ days)",
    nextSendDate: "2026-02-18",
    status: "paused",
    recipientCount: 156,
  },
];

const initialHistory: CampaignHistoryEntry[] = [
  {
    id: "hist-1",
    name: "Weekly Tips & Tricks #42",
    sentDate: "2026-02-16",
    recipientCount: 1235,
    openRate: 42.3,
    clickRate: 8.7,
  },
  {
    id: "hist-2",
    name: "February Skills Spotlight",
    sentDate: "2026-02-01",
    recipientCount: 1180,
    openRate: 38.1,
    clickRate: 12.4,
  },
  {
    id: "hist-3",
    name: "Weekly Tips & Tricks #41",
    sentDate: "2026-02-09",
    recipientCount: 1220,
    openRate: 40.5,
    clickRate: 7.9,
  },
  {
    id: "hist-4",
    name: "Product Update v2.8",
    sentDate: "2026-02-07",
    recipientCount: 1195,
    openRate: 45.2,
    clickRate: 15.1,
  },
  {
    id: "hist-5",
    name: "Weekly Tips & Tricks #40",
    sentDate: "2026-02-02",
    recipientCount: 1210,
    openRate: 39.8,
    clickRate: 9.2,
  },
];

const initialCheckInUsers: CheckInUser[] = [
  {
    id: "user-1",
    name: "Amanda Foster",
    email: "amanda.foster@example.com",
    signupDate: "2026-01-15",
    checkInStatus: "responded",
    rating: 5,
    testimonialText:
      "Dr. Claw has completely transformed how we manage our front desk. The AI agents handle scheduling flawlessly!",
  },
  {
    id: "user-2",
    name: "Brian Mitchell",
    email: "brian.mitchell@example.com",
    signupDate: "2026-01-16",
    checkInStatus: "responded",
    rating: 4,
    testimonialText:
      "Great product overall. The onboarding was smooth and the agents learned our workflows quickly.",
  },
  {
    id: "user-3",
    name: "Carla Reyes",
    email: "carla.reyes@example.com",
    signupDate: "2026-01-17",
    checkInStatus: "sent",
    rating: 0,
    testimonialText: "",
  },
  {
    id: "user-4",
    name: "Derek Washington",
    email: "derek.washington@example.com",
    signupDate: "2026-01-18",
    checkInStatus: "responded",
    rating: 5,
    testimonialText:
      "The grant writing agent alone has saved us dozens of hours. Truly impressive AI capabilities.",
  },
  {
    id: "user-5",
    name: "Elena Kovacs",
    email: "elena.kovacs@example.com",
    signupDate: "2026-01-19",
    checkInStatus: "pending",
    rating: 0,
    testimonialText: "",
  },
  {
    id: "user-6",
    name: "Frank Delgado",
    email: "frank.delgado@example.com",
    signupDate: "2026-01-20",
    checkInStatus: "responded",
    rating: 4,
    testimonialText:
      "Very helpful for managing patient communications. Would recommend to other medical practices.",
  },
  {
    id: "user-7",
    name: "Grace Huang",
    email: "grace.huang@example.com",
    signupDate: "2026-01-21",
    checkInStatus: "sent",
    rating: 0,
    testimonialText: "",
  },
  {
    id: "user-8",
    name: "Harold Bennett",
    email: "harold.bennett@example.com",
    signupDate: "2026-01-22",
    checkInStatus: "responded",
    rating: 3,
    testimonialText:
      "Good tool with some room for improvement. The marketing agent needs more customization options.",
  },
];

const initialTestimonials: Testimonial[] = [
  {
    id: "test-1",
    userName: "Amanda Foster",
    date: "2026-02-14",
    rating: 5,
    quote:
      "Dr. Claw has completely transformed how we manage our front desk. The AI agents handle scheduling flawlessly!",
    status: "Featured",
  },
  {
    id: "test-2",
    userName: "Derek Washington",
    date: "2026-02-15",
    rating: 5,
    quote:
      "The grant writing agent alone has saved us dozens of hours. Truly impressive AI capabilities.",
    status: "Approved",
  },
  {
    id: "test-3",
    userName: "Brian Mitchell",
    date: "2026-02-14",
    rating: 4,
    quote:
      "Great product overall. The onboarding was smooth and the agents learned our workflows quickly.",
    status: "Approved",
  },
  {
    id: "test-4",
    userName: "Frank Delgado",
    date: "2026-02-16",
    rating: 4,
    quote:
      "Very helpful for managing patient communications. Would recommend to other medical practices.",
    status: "Pending Review",
  },
  {
    id: "test-5",
    userName: "Harold Bennett",
    date: "2026-02-16",
    rating: 3,
    quote:
      "Good tool with some room for improvement. The marketing agent needs more customization options.",
    status: "Pending Review",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const renderStars = (rating: number, size = "h-4 w-4") =>
  Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`${size} ${
        i < rating ? "text-amber-400 fill-amber-400" : "text-zinc-600"
      }`}
    />
  ));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EmailCampaigns = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // --- i18n label maps (inside component so t() is accessible) ---
  const STATUS_LABELS: Record<CampaignStatus, string> = {
    scheduled: t("emailCampaigns.statusScheduled"),
    draft: t("emailCampaigns.statusDraft"),
    active: t("emailCampaigns.statusActive"),
    paused: t("emailCampaigns.statusPaused"),
  };

  const CHECKIN_STATUS_LABELS: Record<CheckInStatus, string> = {
    pending: t("emailCampaigns.checkInPending"),
    sent: t("emailCampaigns.checkInSent"),
    responded: t("emailCampaigns.checkInResponded"),
  };

  const TESTIMONIAL_STATUS_LABELS: Record<TestimonialStatus, string> = {
    "Pending Review": t("emailCampaigns.testimonialPendingReview"),
    Approved: t("emailCampaigns.testimonialApproved"),
    Featured: t("emailCampaigns.testimonialFeatured"),
  };

  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("campaigns");

  // --- Campaigns state ---
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [campaignHistory] = useState<CampaignHistoryEntry[]>(initialHistory);

  // --- Campaign editor dialog state ---
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSubject, setEditorSubject] = useState("");
  const [editorBody, setEditorBody] = useState("");
  const [editorRecipients, setEditorRecipients] =
    useState<RecipientGroup>("all");
  const [editorScheduleMode, setEditorScheduleMode] = useState<
    "now" | "later"
  >("now");
  const [editorScheduleDate, setEditorScheduleDate] = useState("");
  const [editorSkillsTips, setEditorSkillsTips] = useState(false);
  const [editorPreview, setEditorPreview] = useState(false);

  // --- Testimonial state ---
  const [checkInUsers, setCheckInUsers] =
    useState<CheckInUser[]>(initialCheckInUsers);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);

  // ---------------------------------------------------------------------------
  // Computed stats — Email Campaigns
  // ---------------------------------------------------------------------------

  const campaignStats = {
    totalSent: campaignHistory.length,
    avgOpenRate:
      campaignHistory.length > 0
        ? (
            campaignHistory.reduce((sum, h) => sum + h.openRate, 0) /
            campaignHistory.length
          ).toFixed(1)
        : "0",
    avgClickRate:
      campaignHistory.length > 0
        ? (
            campaignHistory.reduce((sum, h) => sum + h.clickRate, 0) /
            campaignHistory.length
          ).toFixed(1)
        : "0",
    activeSubscribers: 1247,
  };

  // ---------------------------------------------------------------------------
  // Computed stats — Testimonials
  // ---------------------------------------------------------------------------

  const respondedUsers = checkInUsers.filter(
    (u) => u.checkInStatus === "responded"
  );
  const testimonialStats = {
    responseRate:
      checkInUsers.length > 0
        ? ((respondedUsers.length / checkInUsers.length) * 100).toFixed(0)
        : "0",
    avgRating:
      respondedUsers.length > 0
        ? (
            respondedUsers.reduce((sum, u) => sum + u.rating, 0) /
            respondedUsers.length
          ).toFixed(1)
        : "0",
    totalTestimonials: testimonials.length,
    featuredCount: testimonials.filter((t) => t.status === "Featured").length,
  };

  // ---------------------------------------------------------------------------
  // Campaign actions
  // ---------------------------------------------------------------------------

  const recipientLabels: Record<RecipientGroup, string> = {
    all: t("emailCampaigns.recipientAll"),
    new: t("emailCampaigns.recipientNew"),
    active: t("emailCampaigns.recipientActive"),
    custom: t("emailCampaigns.recipientCustom"),
  };

  const recipientCounts: Record<RecipientGroup, number> = {
    all: 1247,
    new: 89,
    active: 934,
    custom: 0,
  };

  const resetEditor = () => {
    setEditorSubject("");
    setEditorBody("");
    setEditorRecipients("all");
    setEditorScheduleMode("now");
    setEditorScheduleDate("");
    setEditorSkillsTips(false);
    setEditorPreview(false);
  };

  const handleCreateCampaign = () => {
    if (!editorSubject.trim()) return;

    const newCampaign: Campaign = {
      id: nextId("camp"),
      name: editorSubject.trim(),
      description: editorBody.trim() || t("emailCampaigns.noDescription"),
      frequency: editorScheduleMode === "now" ? "One-time" : "Scheduled",
      nextSendDate:
        editorScheduleMode === "later" && editorScheduleDate
          ? editorScheduleDate
          : new Date().toISOString().split("T")[0],
      status: editorScheduleMode === "now" ? "active" : "scheduled",
      recipientCount: recipientCounts[editorRecipients],
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    setEditorOpen(false);
    resetEditor();
    toast({
      title: t("emailCampaigns.toastCampaignCreated"),
      description:
        editorScheduleMode === "now"
          ? t("emailCampaigns.toastCampaignSendingNow")
          : t("emailCampaigns.toastCampaignScheduled", { date: newCampaign.nextSendDate }),
    });
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next: CampaignStatus =
          c.status === "paused"
            ? "active"
            : c.status === "active"
              ? "paused"
              : c.status;
        return { ...c, status: next };
      })
    );
  };

  // ---------------------------------------------------------------------------
  // Testimonial actions
  // ---------------------------------------------------------------------------

  const sendCheckIn = (userId: string) => {
    setCheckInUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, checkInStatus: "sent" as CheckInStatus } : u
      )
    );
    toast({
      title: t("emailCampaigns.toastCheckInSent"),
      description: t("emailCampaigns.toastCheckInSentDesc"),
    });
  };

  const requestTestimonial = (userId: string) => {
    const user = checkInUsers.find((u) => u.id === userId);
    if (!user) return;
    toast({
      title: t("emailCampaigns.toastTestimonialRequested"),
      description: t("emailCampaigns.toastTestimonialRequestedDesc", { name: user.name }),
    });
  };

  const approveTestimonial = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Approved" as TestimonialStatus } : t))
    );
    toast({
      title: t("emailCampaigns.toastTestimonialApproved"),
      description: t("emailCampaigns.toastTestimonialApprovedDesc"),
    });
  };

  const featureTestimonial = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Featured" as TestimonialStatus } : t))
    );
    toast({
      title: t("emailCampaigns.toastTestimonialFeatured"),
      description: t("emailCampaigns.toastTestimonialFeaturedDesc"),
    });
  };

  // ---------------------------------------------------------------------------
  // Render: Email Campaigns Tab
  // ---------------------------------------------------------------------------

  const renderCampaignsTab = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: t("emailCampaigns.campaignsSent"),
            value: campaignStats.totalSent,
            icon: Send,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: t("emailCampaigns.openRate"),
            value: `${campaignStats.avgOpenRate}%`,
            icon: MailOpen,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: t("emailCampaigns.clickRate"),
            value: `${campaignStats.avgClickRate}%`,
            icon: MousePointerClick,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: t("emailCampaigns.activeSubscribers"),
            value: campaignStats.activeSubscribers.toLocaleString(),
            icon: Users,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Header + Create button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t("emailCampaigns.upcomingCampaigns")}
        </h2>
        <Button
          className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 text-sm"
          onClick={() => {
            resetEditor();
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("emailCampaigns.createCampaign")}
        </Button>
      </div>

      {/* Upcoming Campaigns List */}
      <div className="space-y-3 mb-8">
        {campaigns.map((campaign) => {
          const statusColors = STATUS_COLORS[campaign.status];
          const statusLabel = STATUS_LABELS[campaign.status];
          return (
            <div
              key={campaign.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {campaign.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] border ${statusColors.bg} ${statusColors.color} px-1.5 py-0`}
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {campaign.description}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      {campaign.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t("emailCampaigns.next")}: {campaign.nextSendDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.recipientCount.toLocaleString()} {t("emailCampaigns.recipients")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(campaign.status === "active" ||
                    campaign.status === "paused") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:text-foreground text-xs"
                      onClick={() => toggleCampaignStatus(campaign.id)}
                    >
                      {campaign.status === "active" ? t("emailCampaigns.pause") : t("emailCampaigns.resume")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign History */}
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t("emailCampaigns.campaignHistory")}
        </h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>{t("emailCampaigns.columnCampaign")}</span>
            <span>{t("emailCampaigns.columnSentDate")}</span>
            <span className="text-right">{t("emailCampaigns.columnRecipients")}</span>
            <span className="text-right">{t("emailCampaigns.columnOpenRate")}</span>
            <span className="text-right">{t("emailCampaigns.columnClickRate")}</span>
          </div>
          {campaignHistory.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-foreground truncate">
                {entry.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {entry.sentDate}
              </span>
              <span className="text-sm text-muted-foreground text-right">
                {entry.recipientCount.toLocaleString()}
              </span>
              <span className="text-sm text-right">
                <span
                  className={
                    entry.openRate >= 40
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                  }
                >
                  {entry.openRate}%
                </span>
              </span>
              <span className="text-sm text-right">
                <span
                  className={
                    entry.clickRate >= 10
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                  }
                >
                  {entry.clickRate}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------------------------
  // Render: Testimonial Tracker Tab
  // ---------------------------------------------------------------------------

  const renderTestimonialsTab = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: t("emailCampaigns.responseRate"),
            value: `${testimonialStats.responseRate}%`,
            icon: MessageSquare,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: t("emailCampaigns.averageRating"),
            value: testimonialStats.avgRating,
            icon: Star,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: t("emailCampaigns.totalTestimonials"),
            value: testimonialStats.totalTestimonials,
            icon: Quote,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: t("emailCampaigns.featured"),
            value: testimonialStats.featuredCount,
            icon: Award,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              {stat.label === t("emailCampaigns.averageRating") && (
                <div className="flex gap-0.5">{renderStars(Math.round(Number(stat.value)), "h-3 w-3")}</div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* One Month Check-in System */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary" />
          {t("emailCampaigns.oneMonthCheckIn")}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {t("emailCampaigns.oneMonthCheckInDesc")}
        </p>
        <div className="space-y-3">
          {checkInUsers.map((user) => {
            const statusColors = CHECKIN_STATUS_COLORS[user.checkInStatus];
            const statusLabel = CHECKIN_STATUS_LABELS[user.checkInStatus];
            return (
              <div
                key={user.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] border ${statusColors.bg} ${statusColors.color} px-1.5 py-0`}
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{user.email}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("emailCampaigns.signedUp")}: {user.signupDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user.checkInStatus === "responded" && user.rating > 0 && (
                      <div className="flex gap-0.5 mr-2">
                        {renderStars(user.rating, "h-3.5 w-3.5")}
                      </div>
                    )}
                    {user.checkInStatus === "pending" && (
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 text-xs"
                        onClick={() => sendCheckIn(user.id)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {t("emailCampaigns.sendCheckIn")}
                      </Button>
                    )}
                    {user.checkInStatus === "sent" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-muted-foreground hover:text-foreground text-xs"
                        onClick={() => requestTestimonial(user.id)}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        {t("emailCampaigns.followUp")}
                      </Button>
                    )}
                    {user.checkInStatus === "responded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-muted-foreground hover:text-foreground text-xs"
                        onClick={() => requestTestimonial(user.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        {t("emailCampaigns.requestTestimonial")}
                      </Button>
                    )}
                  </div>
                </div>
                {user.checkInStatus === "responded" && user.testimonialText && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &ldquo;{user.testimonialText}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="my-8 border-border" />

      {/* Testimonial Collection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Quote className="h-5 w-5 text-primary" />
          {t("emailCampaigns.collectedTestimonials")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => {
            const statusColors =
              TESTIMONIAL_STATUS_COLORS[testimonial.status];
            const statusLabel = TESTIMONIAL_STATUS_LABELS[testimonial.status];
            return (
              <div
                key={testimonial.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.userName}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {testimonial.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] border ${statusColors.bg} ${statusColors.color} px-1.5 py-0`}
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  {testimonial.status === "Pending Review" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:text-foreground text-xs"
                      onClick={() => approveTestimonial(testimonial.id)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      {t("emailCampaigns.approve")}
                    </Button>
                  )}
                  {(testimonial.status === "Pending Review" ||
                    testimonial.status === "Approved") && (
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 text-xs"
                      onClick={() => featureTestimonial(testimonial.id)}
                    >
                      <Award className="h-3.5 w-3.5 mr-1" />
                      {t("emailCampaigns.feature")}
                    </Button>
                  )}
                  {testimonial.status === "Featured" && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("emailCampaigns.displayedOnPublicPage")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------------------------
  // Render: Campaign Editor Dialog
  // ---------------------------------------------------------------------------

  const renderEditorDialog = () => (
    <Dialog
      open={editorOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditorOpen(false);
          resetEditor();
        }
      }}
    >
      <DialogContent className="sm:max-w-[640px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t("emailCampaigns.createCampaign")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Subject line */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("emailCampaigns.subjectLine")}
            </Label>
            <Input
              value={editorSubject}
              onChange={(e) => setEditorSubject(e.target.value)}
              placeholder={t("emailCampaigns.subjectPlaceholder")}
              className="bg-white/[0.03] border-white/10 focus:border-primary/50"
            />
          </div>

          {/* Email body with preview toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t("emailCampaigns.emailBody")}
              </Label>
              <button
                onClick={() => setEditorPreview(!editorPreview)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                  editorPreview
                    ? "text-primary bg-primary/10 border-primary/30"
                    : "text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Eye className="h-3 w-3 inline mr-1" />
                {editorPreview ? t("emailCampaigns.edit") : t("emailCampaigns.preview")}
              </button>
            </div>
            {editorPreview ? (
              <div className="bg-white/[0.02] rounded-xl border border-border p-4 min-h-[160px]">
                {editorSubject && (
                  <h3 className="text-sm font-bold text-foreground mb-2">
                    {editorSubject}
                  </h3>
                )}
                <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {editorBody || (
                    <span className="italic">{t("emailCampaigns.noContentYet")}</span>
                  )}
                </div>
                {editorSkillsTips && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        {t("emailCampaigns.skillsAndTips")}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>
                        <strong className="text-foreground">{t("emailCampaigns.tip")}:</strong>{" "}
                        {t("emailCampaigns.tipContent")}
                      </p>
                      <p>
                        <strong className="text-foreground">
                          {t("emailCampaigns.newSkill")}:
                        </strong>{" "}
                        {t("emailCampaigns.newSkillContent")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={editorBody}
                onChange={(e) => setEditorBody(e.target.value)}
                placeholder={t("emailCampaigns.bodyPlaceholder")}
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 min-h-[160px]"
              />
            )}
          </div>

          {/* Skills & Tips toggle */}
          <div className="flex items-center justify-between bg-white/[0.02] rounded-xl border border-border p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("emailCampaigns.includeSkillsTips")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("emailCampaigns.includeSkillsTipsDesc")}
                </p>
              </div>
            </div>
            <Switch
              checked={editorSkillsTips}
              onCheckedChange={setEditorSkillsTips}
            />
          </div>

          <Separator className="border-border" />

          {/* Recipient selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("emailCampaigns.recipientsLabel")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["all", "new", "active", "custom"] as RecipientGroup[]
              ).map((group) => (
                <button
                  key={group}
                  onClick={() => setEditorRecipients(group)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    editorRecipients === group
                      ? "text-primary bg-primary/10 border-primary/30"
                      : "text-muted-foreground border-border hover:text-foreground hover:border-white/15"
                  }`}
                >
                  <p>{recipientLabels[group]}</p>
                  <p className="text-[10px] mt-0.5 opacity-60">
                    {recipientCounts[group].toLocaleString()} {t("emailCampaigns.users")}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Separator className="border-border" />

          {/* Schedule options */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">{t("emailCampaigns.schedule")}</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setEditorScheduleMode("now")}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  editorScheduleMode === "now"
                    ? "text-primary bg-primary/10 border-primary/30"
                    : "text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                {t("emailCampaigns.sendNow")}
              </button>
              <button
                onClick={() => setEditorScheduleMode("later")}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  editorScheduleMode === "later"
                    ? "text-primary bg-primary/10 border-primary/30"
                    : "text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {t("emailCampaigns.scheduleForLater")}
              </button>
            </div>
            {editorScheduleMode === "later" && (
              <Input
                type="date"
                value={editorScheduleDate}
                onChange={(e) => setEditorScheduleDate(e.target.value)}
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 max-w-[220px]"
              />
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            className="border-border text-muted-foreground"
            onClick={() => {
              setEditorOpen(false);
              resetEditor();
            }}
          >
            {t("emailCampaigns.cancel")}
          </Button>
          <Button
            className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
            disabled={!editorSubject.trim()}
            onClick={handleCreateCampaign}
          >
            <Send className="h-4 w-4 mr-1.5" />
            {editorScheduleMode === "now" ? t("emailCampaigns.sendCampaign") : t("emailCampaigns.scheduleCampaign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Mail className="h-7 w-7 text-primary" />
              {t("emailCampaigns.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("emailCampaigns.subtitle")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-8 bg-card/50 border border-border rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "campaigns"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {t("emailCampaigns.emailCampaignsTab")}
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "testimonials"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              {t("emailCampaigns.testimonialTrackerTab")}
              <Badge
                variant="outline"
                className="text-[9px] border-border ml-1 px-1.5 py-0"
              >
                {testimonials.length}
              </Badge>
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "campaigns" && renderCampaignsTab()}
          {activeTab === "testimonials" && renderTestimonialsTab()}
        </div>
      </main>

      {/* Campaign Editor Dialog */}
      {renderEditorDialog()}
    </div>
  );
};

export default EmailCampaigns;
