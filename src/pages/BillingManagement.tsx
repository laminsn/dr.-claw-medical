import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import DashboardLayout from "@/components/DashboardLayout";
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
  const { t } = useTranslation();

  // Billing alert toggles
  const [alertUsage80, setAlertUsage80] = useState(true);
  const [alertUsage90, setAlertUsage90] = useState(true);
  const [alertUsage100, setAlertUsage100] = useState(true);
  const [alertPaymentReminders, setAlertPaymentReminders] = useState(true);
  const [alertPlanChanges, setAlertPlanChanges] = useState(false);

  const plans: Plan[] = [
    {
      name: t("billing.starter"),
      price: "$49",
      period: t("billing.perMonth"),
      description: t("billing.starterDesc"),
      features: [
        { text: t("billing.fiveAiAgents"), included: true },
        { text: t("billing.tenKApiCalls"), included: true },
        { text: t("billing.thirtyPlusSkills"), included: true },
        { text: t("billing.fifteenPlusTemplates"), included: true },
        { text: t("billing.trainingTaskMgmt"), included: true },
        { text: t("billing.basicVoiceHipaa"), included: true },
        { text: t("billing.phiMonitoring"), included: false },
        { text: t("billing.customIntegrations"), included: false },
      ],
      isCurrent: false,
      isPopular: false,
      ctaLabel: t("billing.downgrade"),
    },
    {
      name: t("billing.professional"),
      price: "$299",
      period: t("billing.perMonth"),
      description: t("billing.professionalDesc"),
      features: [
        { text: t("billing.twentyFiveAgents"), included: true },
        { text: t("billing.hundredKApiCalls"), included: true },
        { text: t("billing.sixtyPlusSkillsMultiLlm"), included: true },
        { text: t("billing.fullVoiceIntegrations"), included: true },
        { text: t("billing.phiMonitoringBaa"), included: true },
        { text: t("billing.workflowAnalytics"), included: true },
        { text: t("billing.tenTeamSeats"), included: true },
        { text: t("billing.customIntegrationsWhiteLabel"), included: false },
      ],
      isCurrent: true,
      isPopular: true,
      ctaLabel: t("billing.currentPlan"),
    },
    {
      name: t("billing.enterprise"),
      price: "$799",
      period: t("billing.perMonth"),
      description: t("billing.enterpriseDesc"),
      features: [
        { text: t("billing.unlimitedAgents"), included: true },
        { text: t("billing.fiveHundredKApiCalls"), included: true },
        { text: t("billing.hundredPlusSkillsSuites"), included: true },
        { text: t("billing.customIntegrationsAllLlms"), included: true },
        { text: t("billing.hipaaBaaCommandStation"), included: true },
        { text: t("billing.whiteLabelApiPortal"), included: true },
        { text: t("billing.fiftyTeamSeats"), included: true },
        { text: t("billing.dedicatedAccountManager"), included: true },
      ],
      isCurrent: false,
      isPopular: false,
      ctaLabel: t("billing.upgrade"),
    },
    {
      name: t("billing.enterprisePlus"),
      price: t("billing.contact"),
      period: " " + t("billing.sales"),
      description: t("billing.enterprisePlusDesc"),
      features: [
        { text: t("billing.everythingInEnterprise"), included: true },
        { text: t("billing.unlimitedApiStorage"), included: true },
        { text: t("billing.onPremiseDeployment"), included: true },
        { text: t("billing.customSla"), included: true },
        { text: t("billing.customDevSso"), included: true },
        { text: t("billing.unlimitedTeamSeats"), included: true },
        { text: t("billing.twentyFourSevenSupport"), included: true },
        { text: t("billing.customTrainingOnboarding"), included: true },
      ],
      isCurrent: false,
      isPopular: false,
      ctaLabel: t("billing.contactSales"),
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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleUpgradePlan = () => {
    toast({
      title: t("billing.upgradeInitiated"),
      description: t("billing.upgradeInitiatedDesc"),
    });
  };

  const handleManageSubscription = () => {
    toast({
      title: t("billing.subscriptionPortal"),
      description: t("billing.subscriptionPortalDesc"),
    });
  };

  const handlePlanAction = (plan: Plan) => {
    if (plan.isCurrent) return;
    if (plan.name === t("billing.enterprisePlus")) {
      toast({
        title: t("billing.contactSales"),
        description: t("billing.contactSalesDesc"),
      });
    } else if (plan.name === t("billing.starter")) {
      toast({
        title: t("billing.downgradeRequested"),
        description: t("billing.downgradeRequestedDesc"),
      });
    } else {
      toast({
        title: t("billing.upgradeRequested"),
        description: t("billing.upgradeRequestedDesc", { plan: plan.name }),
      });
    }
  };

  const handleUpdatePayment = () => {
    toast({
      title: t("billing.updatePaymentMethod"),
      description: t("billing.updatePaymentMethodDesc"),
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceText = [
      "=".repeat(50),
      "                    INVOICE",
      "=".repeat(50),
      "",
      `Invoice Number: ${invoice.number}`,
      `Date:           ${invoice.date}`,
      `Amount:         ${invoice.amount}`,
      `Status:         ${invoice.status}`,
      "",
      "-".repeat(50),
      "Billed To:",
      "  Your Practice Name",
      "  billing@clinic.com",
      "",
      "Plan:           Professional",
      "Billing Period:  Monthly",
      "",
      "-".repeat(50),
      `Total Due:      ${invoice.amount}`,
      "=".repeat(50),
      "",
      "Dr. Claw Medical — AI Healthcare Platform",
      "Thank you for your business.",
    ].join("\n");
    const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: t("billing.invoiceDownloaded"),
      description: t("billing.invoiceDownloadedDesc", { number: invoice.number }),
    });
  };

  const handleAlertToggle = (
    alertName: string,
    value: boolean,
    setter: (v: boolean) => void,
  ) => {
    setter(value);
    toast({
      title: value ? t("billing.alertEnabled") : t("billing.alertDisabled"),
      description: t("billing.alertToggleDesc", { name: alertName, status: value ? t("billing.enabled") : t("billing.disabled") }),
    });
  };

  const invoiceStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid": return t("billing.paid");
      case "Pending": return t("billing.pending");
      case "Failed": return t("billing.failed");
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <DashboardLayout>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("billing.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("billing.subtitle")}
            </p>
            <p className="text-sm text-blue-400/80 mt-2">
              {t("billing.valueProposition")}
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
                        {t("billing.professionalPlan")}
                      </h2>
                      <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 text-[11px]">
                        {t("billing.current")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-2xl font-bold text-foreground">$299</span>
                      <span className="text-muted-foreground">/{t("billing.month")}</span>
                      <span className="text-muted-foreground ml-2">
                        &middot; {t("billing.billedAnnually")}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t("billing.renewalDate")}{" "}
                  <span className="text-foreground font-medium">March 15, 2026</span>
                </p>

                {/* Usage bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("billing.agents")}</span>
                      <span className="text-foreground font-medium">12 / 25</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("billing.apiCalls")}</span>
                      <span className="text-foreground font-medium">28,500 / 100,000</span>
                    </div>
                    <Progress value={29} className="h-2" />
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
                  {t("billing.upgradePlan")}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/[0.06] hover:bg-white/5"
                  onClick={handleManageSubscription}
                >
                  {t("billing.manageSubscription")}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Plan Comparison ─────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
              {t("billing.comparePlans")}
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
                        {t("billing.mostPopular")}
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
                        : plan.name === t("billing.enterprisePlus")
                          ? "border-white/[0.06] hover:bg-white/5"
                          : "gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                    }`}
                    variant={plan.isCurrent ? "secondary" : plan.name === t("billing.enterprisePlus") ? "outline" : "default"}
                    disabled={plan.isCurrent}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {plan.name === t("billing.enterprisePlus") && <Phone className="h-4 w-4 mr-2" />}
                    {plan.ctaLabel}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Usage Metrics ──────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
              {t("billing.usageThisMonth")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* API Calls */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("billing.apiCalls")}</p>
                    <p className="text-lg font-bold text-foreground">28,500</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("billing.usage")}</span>
                    <span>28,500 / 100,000</span>
                  </div>
                  <Progress value={29} className="h-1.5" />
                </div>
              </div>

              {/* Active Agents */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("billing.activeAgents")}</p>
                    <p className="text-lg font-bold text-foreground">12</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("billing.usage")}</span>
                    <span>12 / 25</span>
                  </div>
                  <Progress value={48} className="h-1.5" />
                </div>
              </div>

              {/* Storage Used */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <HardDrive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("billing.storageUsed")}</p>
                    <p className="text-lg font-bold text-foreground">4.2 GB</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("billing.usage")}</span>
                    <span>4.2 GB / 25 GB</span>
                  </div>
                  <Progress value={17} className="h-1.5" />
                </div>
              </div>

              {/* Team Seats */}
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("billing.teamSeats")}</p>
                    <p className="text-lg font-bold text-foreground">8</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("billing.usage")}</span>
                    <span>8 / 10</span>
                  </div>
                  <Progress value={80} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Method ─────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {t("billing.paymentMethod")}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-18 rounded-lg bg-white/5 border border-white/10 px-3">
                  <span className="text-sm font-bold text-foreground tracking-wider">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("billing.visaEndingIn")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("billing.expires")}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-white/[0.06] hover:bg-white/5 w-fit"
                onClick={handleUpdatePayment}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t("billing.updatePaymentMethod")}
              </Button>
            </div>

            <Separator className="bg-white/[0.06] my-4" />

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("billing.billingEmail")}</span>
              <span className="text-foreground font-medium">billing@clinic.com</span>
            </div>
          </div>

          {/* ── Invoice History ─────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              {t("billing.invoiceHistory")}
            </h2>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      {t("billing.invoiceNumber")}
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      {t("billing.date")}
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      {t("billing.amount")}
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium">
                      {t("billing.status")}
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium text-right">
                      {t("billing.action")}
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
                          {invoiceStatusLabel(invoice.status)}
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
                          {t("billing.download")}
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
              {t("billing.billingAlerts")}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("billing.billingAlertsDesc")}
            </p>

            <div className="space-y-5">
              {/* Usage Threshold Alerts */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  {t("billing.usageThresholdAlerts")}
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t("billing.usage80Warning")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing.usage80WarningDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage80}
                      onCheckedChange={(value) =>
                        handleAlertToggle(t("billing.usage80WarningAlert"), value, setAlertUsage80)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t("billing.usage90Alert")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing.usage90AlertDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage90}
                      onCheckedChange={(value) =>
                        handleAlertToggle(t("billing.usage90AlertName"), value, setAlertUsage90)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t("billing.usage100Critical")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing.usage100CriticalDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={alertUsage100}
                      onCheckedChange={(value) =>
                        handleAlertToggle(t("billing.usage100CriticalAlert"), value, setAlertUsage100)
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
                  {t("billing.paymentAndPlanNotifications")}
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t("billing.paymentReminders")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing.paymentRemindersDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={alertPaymentReminders}
                      onCheckedChange={(value) =>
                        handleAlertToggle(t("billing.paymentRemindersAlert"), value, setAlertPaymentReminders)
                      }
                    />
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{t("billing.planChangeConfirmations")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("billing.planChangeConfirmationsDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={alertPlanChanges}
                      onCheckedChange={(value) =>
                        handleAlertToggle(t("billing.planChangeConfirmationsAlert"), value, setAlertPlanChanges)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default BillingManagement;
