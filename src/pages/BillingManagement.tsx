import { useState } from "react";
import {
  CreditCard,
  Download,
  Zap,
  Bot,
  HardDrive,
  Users,
  Check,
  Crown,
  ArrowUpRight,
  Bell,
  Mail,
  AlertTriangle,
  Receipt,
  Shield,
  Star,
  Phone,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type InvoiceStatus = "Paid" | "Pending" | "Failed";

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  isCurrent: boolean;
  isPopular: boolean;
  ctaLabel: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const plans: Plan[] = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "For small practices getting started with AI agents.",
    features: [
      { text: "3 AI Agents", included: true },
      { text: "5,000 API Calls/mo", included: true },
      { text: "Basic Skills", included: true },
      { text: "Email Support", included: true },
      { text: "PHI Monitoring", included: false },
      { text: "Custom Integrations", included: false },
    ],
    isCurrent: false,
    isPopular: false,
    ctaLabel: "Downgrade",
  },
  {
    name: "Professional",
    price: "$299",
    period: "/mo",
    description: "For growing practices that need powerful AI capabilities.",
    features: [
      { text: "15 AI Agents", included: true },
      { text: "50,000 API Calls/mo", included: true },
      { text: "All Skills", included: true },
      { text: "Priority Support", included: true },
      { text: "PHI Monitoring", included: true },
      { text: "Custom Integrations", included: false },
    ],
    isCurrent: true,
    isPopular: true,
    ctaLabel: "Current Plan",
  },
  {
    name: "Enterprise",
    price: "$799",
    period: "/mo",
    description: "For large organizations with advanced compliance needs.",
    features: [
      { text: "Unlimited Agents", included: true },
      { text: "500,000 API Calls/mo", included: true },
      { text: "Custom Skills", included: true },
      { text: "Dedicated Support", included: true },
      { text: "HIPAA BAA", included: true },
      { text: "Custom Integrations", included: true },
    ],
    isCurrent: false,
    isPopular: false,
    ctaLabel: "Upgrade",
  },
  {
    name: "Custom",
    price: "Contact",
    period: " Sales",
    description: "Everything in Enterprise plus on-premise, SLA, and custom development.",
    features: [
      { text: "Everything in Enterprise", included: true },
      { text: "On-Premise Deployment", included: true },
      { text: "Custom SLA", included: true },
      { text: "Custom Development", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "White-Label Options", included: true },
    ],
    isCurrent: false,
    isPopular: false,
    ctaLabel: "Contact Sales",
  },
];

const invoices: Invoice[] = [
  { id: "1", number: "INV-2026-002", date: "Feb 1, 2026", amount: "$299.00", status: "Pending" },
  { id: "2", number: "INV-2026-001", date: "Jan 1, 2026", amount: "$299.00", status: "Paid" },
  { id: "3", number: "INV-2025-012", date: "Dec 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "4", number: "INV-2025-011", date: "Nov 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "5", number: "INV-2025-010", date: "Oct 1, 2025", amount: "$299.00", status: "Failed" },
  { id: "6", number: "INV-2025-009", date: "Sep 1, 2025", amount: "$299.00", status: "Paid" },
  { id: "7", number: "INV-2025-008", date: "Aug 1, 2025", amount: "$49.00", status: "Paid" },
  { id: "8", number: "INV-2025-007", date: "Jan 15, 2025", amount: "$49.00", status: "Paid" },
];

const statusColors: Record<InvoiceStatus, string> = {
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Failed: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const BillingManagement = () => {
  const { toast } = useToast();

  // Billing alert toggles
  const [alertUsage80, setAlertUsage80] = useState(true);
  const [alertUsage90, setAlertUsage90] = useState(true);
  const [alertUsage100, setAlertUsage100] = useState(true);
  const [alertPaymentReminders, setAlertPaymentReminders] = useState(true);
  const [alertPlanChanges, setAlertPlanChanges] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Initiated",
      description: "Redirecting to plan selection. Your current billing cycle will be prorated.",
    });
  };

  const handleManageSubscription = () => {
    toast({
      title: "Subscription Portal",
      description: "Opening subscription management portal...",
    });
  };

  const handlePlanAction = (plan: Plan) => {
    if (plan.isCurrent) return;
    if (plan.name === "Custom") {
      toast({
        title: "Contact Sales",
        description: "Our team will reach out within 24 hours to discuss your custom requirements.",
      });
    } else if (plan.name === "Starter") {
      toast({
        title: "Downgrade Requested",
        description: "Your plan will change to Starter at the end of the current billing cycle.",
      });
    } else {
      toast({
        title: "Upgrade Requested",
        description: `Your plan will be upgraded to ${plan.name}. Prorated charges will apply.`,
      });
    }
  };

  const handleUpdatePayment = () => {
    toast({
      title: "Update Payment Method",
      description: "Opening secure payment form to update your card details.",
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Downloading Invoice",
      description: `Downloading ${invoice.number} as PDF...`,
    });
  };

  const handleAlertToggle = (
    alertName: string,
    value: boolean,
    setter: (v: boolean) => void,
  ) => {
    setter(value);
    toast({
      title: value ? "Alert Enabled" : "Alert Disabled",
      description: `${alertName} notifications have been ${value ? "enabled" : "disabled"}.`,
    });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              Billing & Subscription
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your practice plan, monitor usage, and track invoices.
            </p>
          </div>

          {/* ── Current Plan Banner ────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-6 card-hover relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold font-heading text-foreground">
                        Professional Plan
                      </h2>
                      <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 text-[11px]">
                        Current
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-2xl font-bold text-foreground">$299</span>
                      <span className="text-muted-foreground">/month</span>
                      <span className="text-muted-foreground ml-2">
                        &middot; Billed annually
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Renewal date:{" "}
                  <span className="text-foreground font-medium">March 15, 2026</span>
                </p>

                {/* Usage bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Agents</span>
                      <span className="text-foreground font-medium">12 / 15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API Calls</span>
                      <span className="text-foreground font-medium">28,500 / 50,000</span>
                    </div>
                    <Progress value={57} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button
                  className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                  onClick={handleUpgradePlan}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  className="border-white/[0.06] hover:bg-white/5"
                  onClick={handleManageSubscription}
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </div>

          {/* ── Plan Comparison ─────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
              Compare Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-card rounded-xl border p-5 card-hover relative flex flex-col ${
                    plan.isCurrent
                      ? "border-primary/50 shadow-glow-sm"
                      : "border-white/[0.06]"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 text-[10px]">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-4 pt-1">
                    <h3 className="text-base font-bold font-heading text-foreground">
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <Separator className="bg-white/[0.06] mb-4" />

                  <ul className="space-y-2.5 flex-1 mb-5">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-sm">
                        <Check
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            feature.included ? "text-emerald-400" : "text-white/20"
                          }`}
                        />
                        <span
                          className={
                            feature.included ? "text-foreground" : "text-muted-foreground/50"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.isCurrent
                        ? "bg-white/10 text-muted-foreground cursor-default hover:bg-white/10"
                        : plan.name === "Custom"
                          ? "border-white/[0.06] hover:bg-white/5"
                          : "gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                    }`}
                    variant={plan.isCurrent ? "secondary" : plan.name === "Custom" ? "outline" : "default"}
                    disabled={plan.isCurrent}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {plan.name === "Custom" && <Phone className="h-4 w-4 mr-2" />}
                    {plan.ctaLabel}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Usage Metrics ──────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
              Usage This Month
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* API Calls */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">API Calls</p>
                    <p className="text-lg font-bold text-foreground">28,500</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>28,500 / 50,000</span>
                  </div>
                  <Progress value={57} className="h-1.5" />
                </div>
              </div>

              {/* Active Agents */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Agents</p>
                    <p className="text-lg font-bold text-foreground">12</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>12 / 15</span>
                  </div>
                  <Progress value={80} className="h-1.5" />
                </div>
              </div>

              {/* Storage Used */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <HardDrive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Storage Used</p>
                    <p className="text-lg font-bold text-foreground">4.2 GB</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>4.2 GB / 10 GB</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
              </div>

              {/* Team Seats */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Team Seats</p>
                    <p className="text-lg font-bold text-foreground">8</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>8 / 20</span>
                  </div>
                  <Progress value={40} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Method ─────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-18 rounded-lg bg-white/5 border border-white/10 px-3">
                  <span className="text-sm font-bold text-foreground tracking-wider">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires 08/2027
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-white/[0.06] hover:bg-white/5 w-fit"
                onClick={handleUpdatePayment}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
            </div>

            <Separator className="bg-white/[0.06] my-4" />

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Billing email:</span>
              <span className="text-foreground font-medium">billing@clinic.com</span>
            </div>
          </div>

          {/* ── Invoice History ─────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice History
            </h2>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      Invoice #
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-white/[0.06] hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-sm font-medium text-foreground">
                        {invoice.number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.date}
                      </TableCell>
                      <TableCell className="text-sm text-foreground font-medium">
                        {invoice.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${statusColors[invoice.status]}`}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ── Billing Alerts ─────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Billing Alerts
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Configure when you want to receive billing and usage notifications.
            </p>

            <div className="space-y-5">
              {/* Usage Threshold Alerts */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Usage Threshold Alerts
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">80% Usage Warning</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when usage reaches 80% of your plan limit
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage80}
                      onCheckedChange={(value) =>
                        handleAlertToggle("80% usage warning", value, setAlertUsage80)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">90% Usage Alert</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when usage reaches 90% of your plan limit
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage90}
                      onCheckedChange={(value) =>
                        handleAlertToggle("90% usage alert", value, setAlertUsage90)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">100% Usage Critical</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when usage reaches your plan limit
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage100}
                      onCheckedChange={(value) =>
                        handleAlertToggle("100% usage critical", value, setAlertUsage100)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Payment & Plan Alerts */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Payment & Plan Notifications
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Payment Reminders</p>
                      <p className="text-xs text-muted-foreground">
                        Receive reminders before upcoming payments
                      </p>
                    </div>
                    <Switch
                      checked={alertPaymentReminders}
                      onCheckedChange={(value) =>
                        handleAlertToggle("Payment reminders", value, setAlertPaymentReminders)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Plan Change Confirmations</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when your plan is upgraded or downgraded
                      </p>
                    </div>
                    <Switch
                      checked={alertPlanChanges}
                      onCheckedChange={(value) =>
                        handleAlertToggle("Plan change confirmations", value, setAlertPlanChanges)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillingManagement;
