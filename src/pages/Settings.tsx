import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Key,
  Globe,
  Moon,
  Sun,
  Lock,
  Trash2,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  FileCheck,
  Download,
  Clock,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  // Appearance
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Security
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState("sk-dc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  // Notifications
  const [notifAgentErrors, setNotifAgentErrors] = useState(true);
  const [notifSecurityAlerts, setNotifSecurityAlerts] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifPhiAccess, setNotifPhiAccess] = useState(true);
  const [notifNewLogins, setNotifNewLogins] = useState(true);
  const [notifTaskComplete, setNotifTaskComplete] = useState(false);

  // Compliance
  const [auditLogRetention, setAuditLogRetention] = useState("365");
  const [autoRedactPhi, setAutoRedactPhi] = useState(true);
  const [enforceEncryption, setEnforceEncryption] = useState(true);

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const handleRegenerateKey = () => {
    toast({ title: "API key regenerated", description: "Your old key has been revoked." });
  };

  const handleExportData = () => {
    toast({ title: "Export started", description: "Your data export will be ready shortly." });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Action required",
      description: "Contact support to delete your account. A 30-day data export period applies.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" /> Practice Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure HIPAA compliance, clinical security, and practice preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Appearance
              </h2>
              <div className="flex gap-3">
                {(["dark", "light", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      theme === t
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "dark" ? <Moon className="h-4 w-4" /> : t === "light" ? <Sun className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Security */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Security
              </h2>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">Multi-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require MFA for all sign-ins</p>
                </div>
                <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Session Timeout (minutes)
                  </Label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> IP Whitelist
                  </Label>
                  <Input
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="e.g. 192.168.1.0/24, 10.0.0.1"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">New Login Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when a new device signs in</p>
                </div>
                <Switch checked={notifNewLogins} onCheckedChange={setNotifNewLogins} />
              </div>
            </section>

            {/* API Keys */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> API Keys
              </h2>
              <div className="space-y-3">
                <Label className="text-foreground/80">Live API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={showApiKey ? apiKey : "sk-dc_live_••••••••••••••••••••••••••••"}
                      readOnly
                      className="bg-secondary border-border font-mono text-xs pr-10"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateKey}
                    className="border-border text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this key to authenticate API requests. Never share your API key publicly.
                </p>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Agent Error Alerts", desc: "Get notified when an agent encounters an error", value: notifAgentErrors, setter: setNotifAgentErrors },
                  { label: "Security Alerts", desc: "Alerts for suspicious activity and auth events", value: notifSecurityAlerts, setter: setNotifSecurityAlerts },
                  { label: "Weekly Report", desc: "Receive a weekly summary of agent activity", value: notifWeeklyReport, setter: setNotifWeeklyReport },
                  { label: "PHI Access Logs", desc: "Get notified when PHI-related queries are redirected", value: notifPhiAccess, setter: setNotifPhiAccess },
                  { label: "Task Completion", desc: "Notify when agent tasks are completed", value: notifTaskComplete, setter: setNotifTaskComplete },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.setter} />
                  </div>
                ))}
              </div>
            </section>

            {/* Compliance */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" /> Compliance & Data
              </h2>

              <div className="space-y-2">
                <Label className="text-foreground/80">Audit Log Retention (days)</Label>
                <select
                  value={auditLogRetention}
                  onChange={(e) => setAuditLogRetention(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                >
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                  <option value="2555">7 years (HIPAA)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Redact PHI in Logs</p>
                  <p className="text-xs text-muted-foreground">Automatically redact PHI from all audit and data logs</p>
                </div>
                <Switch checked={autoRedactPhi} onCheckedChange={setAutoRedactPhi} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">Enforce End-to-End Encryption</p>
                  <p className="text-xs text-muted-foreground">Require TLS 1.3 and AES-256 for all data in transit and at rest</p>
                </div>
                <Switch checked={enforceEncryption} onCheckedChange={setEnforceEncryption} />
              </div>

              <Button
                variant="outline"
                onClick={handleExportData}
                className="border-border text-muted-foreground hover:text-foreground gap-2"
              >
                <Download className="h-4 w-4" /> Export All Data
              </Button>
            </section>

            {/* Danger Zone */}
            <section className="bg-card rounded-xl border border-red-500/20 p-6 space-y-4">
              <h2 className="font-display font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground">
                Deleting your account will remove all agents, configurations, integrations, and data.
                A 30-day data export period will be provided per our Terms of Service.
              </p>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </Button>
            </section>

            {/* Save */}
            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2"
              >
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
