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
  Languages,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "react-i18next";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "EN" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "pt", label: "Português", flag: "PT" },
];

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

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
    toast({ title: t("common.success"), description: t("settings.title") });
  };

  const handleRegenerateKey = () => {
    toast({ title: t("settings.apiKeyRegenerated"), description: t("settings.apiKeyRegeneratedDesc") });
  };

  const handleExportData = () => {
    toast({ title: t("settings.exportStarted"), description: t("settings.exportStartedDesc") });
  };

  const handleDeleteAccount = () => {
    toast({
      title: t("settings.actionRequired"),
      description: t("settings.deleteAccountDesc"),
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" /> {t("settings.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("settings.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> {t("settings.appearance")}
              </h2>
              <div className="flex gap-3">
                {(["dark", "light", "system"] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      theme === themeOption
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {themeOption === "dark" ? <Moon className="h-4 w-4" /> : themeOption === "light" ? <Sun className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    <span>{t(`settings.${themeOption}`)}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Language */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" /> {t("settings.language")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
              <div className="flex gap-3">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      i18n.language.startsWith(lang.code)
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Security */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> {t("settings.security")}
              </h2>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.mfa")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.mfaDesc")}</p>
                </div>
                <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {t("settings.sessionTimeout")}
                  </Label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  >
                    <option value="15">15 {t("common.minutes")}</option>
                    <option value="30">30 {t("common.minutes")}</option>
                    <option value="60">60 {t("common.minutes")}</option>
                    <option value="120">2 {t("common.hours")}</option>
                    <option value="480">8 {t("common.hours")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> {t("settings.ipWhitelist")}
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
                  <p className="text-sm font-medium text-foreground">{t("settings.newLoginAlerts")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.newLoginAlertsDesc")}</p>
                </div>
                <Switch checked={notifNewLogins} onCheckedChange={setNotifNewLogins} />
              </div>
            </section>

            {/* API Keys */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> {t("settings.apiKeys")}
              </h2>
              <div className="space-y-3">
                <Label className="text-foreground/80">{t("settings.liveApiKey")}</Label>
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
                    <RefreshCw className="h-3.5 w-3.5" /> {t("settings.regenerate")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("settings.apiKeyWarning")}
                </p>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> {t("settings.notifications")}
              </h2>
              <div className="space-y-3">
                {[
                  { label: t("settings.agentErrorAlerts"), desc: t("settings.agentErrorAlertsDesc"), value: notifAgentErrors, setter: setNotifAgentErrors },
                  { label: t("settings.securityAlerts"), desc: t("settings.securityAlertsDesc"), value: notifSecurityAlerts, setter: setNotifSecurityAlerts },
                  { label: t("settings.weeklyReport"), desc: t("settings.weeklyReportDesc"), value: notifWeeklyReport, setter: setNotifWeeklyReport },
                  { label: t("settings.phiAccessLogs"), desc: t("settings.phiAccessLogsDesc"), value: notifPhiAccess, setter: setNotifPhiAccess },
                  { label: t("settings.taskCompletion"), desc: t("settings.taskCompletionDesc"), value: notifTaskComplete, setter: setNotifTaskComplete },
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
                <FileCheck className="h-4 w-4 text-primary" /> {t("settings.complianceData")}
              </h2>

              <div className="space-y-2">
                <Label className="text-foreground/80">{t("settings.auditLogRetention")}</Label>
                <select
                  value={auditLogRetention}
                  onChange={(e) => setAuditLogRetention(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                >
                  <option value="90">90 {t("common.days")}</option>
                  <option value="180">180 {t("common.days")}</option>
                   <option value="365">1 {t("common.year")}</option>
                   <option value="730">2 {t("common.years")}</option>
                   <option value="2555">7 {t("common.years")} (HIPAA)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.autoRedactPhi")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.autoRedactPhiDesc")}</p>
                </div>
                <Switch checked={autoRedactPhi} onCheckedChange={setAutoRedactPhi} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.enforceEncryption")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.enforceEncryptionDesc")}</p>
                </div>
                <Switch checked={enforceEncryption} onCheckedChange={setEnforceEncryption} />
              </div>

              <Button
                variant="outline"
                onClick={handleExportData}
                className="border-border text-muted-foreground hover:text-foreground gap-2"
              >
                <Download className="h-4 w-4" /> {t("settings.exportAllData")}
              </Button>
            </section>

            {/* Danger Zone */}
            <section className="bg-card rounded-xl border border-red-500/20 p-6 space-y-4">
              <h2 className="font-display font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {t("settings.dangerZone")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("settings.dangerZoneDesc")}
              </p>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                <Trash2 className="h-4 w-4" /> {t("settings.deleteAccount")}
              </Button>
            </section>

            {/* Save */}
            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2"
              >
                <Save className="h-4 w-4" /> {t("settings.saveSettings")}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Settings;
