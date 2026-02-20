import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Building2, Stethoscope, Globe, Save, Loader2, Camera, Shield } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
];

const roleBadgeStyle: Record<string, string> = {
  master_admin: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  admin: "bg-primary/20 text-primary border border-primary/30",
  manager: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  user: "bg-secondary text-muted-foreground border border-border",
};

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifSlack, setNotifSlack] = useState(false);
  const [role, setRole] = useState("user");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const notificationItems = [
    { label: t("profile.emailNotifications"), desc: t("profile.emailNotificationsDesc"), value: notifEmail, setter: setNotifEmail },
    { label: t("profile.smsNotifications"), desc: t("profile.smsNotificationsDesc"), value: notifSms, setter: setNotifSms },
    { label: t("profile.slackNotifications"), desc: t("profile.slackNotificationsDesc"), value: notifSlack, setter: setNotifSlack },
  ];

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setPracticeName(data.practice_name || "");
        setSpecialty(data.specialty || "");
        setOrganization(data.organization || "");
        setBio(data.bio || "");
        setTimezone(data.timezone || "America/New_York");
        setAvatarUrl(data.avatar_url || null);
        const prefs = data.notification_preferences as Record<string, boolean> | null;
        if (prefs) {
          setNotifEmail(prefs.email ?? true);
          setNotifSms(prefs.sms ?? false);
          setNotifSlack(prefs.slack ?? false);
        }
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleData && roleData.length > 0) {
        setRole(roleData[0].role);
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("agent-documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("agent-documents").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    await supabase.from("profiles").update({ avatar_url: publicUrl } as never).eq("user_id", user.id);

    setAvatarUrl(publicUrl);
    toast({ title: "Avatar updated", description: "Your profile photo has been saved." });
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        practice_name: practiceName,
        phone,
        specialty,
        organization,
        bio,
        timezone,
        notification_preferences: { email: notifEmail, sms: notifSms, slack: notifSlack },
      } as never)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("profile.toastErrorTitle"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("profile.toastSuccessTitle"), description: t("profile.toastSuccessDesc") });
    }
    setSaving(false);
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{t("profile.title")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("profile.subtitle")}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeStyle[role] ?? roleBadgeStyle.user}`}>
              {role === "master_admin" && <Shield className="inline h-3 w-3 mr-1 -mt-0.5" />}
              {role.replace(/_/g, " ")}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Avatar card */}
              <section className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-6">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-secondary border-2 border-border flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-2xl font-bold text-muted-foreground">{initials}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-glow-sm hover:opacity-90 transition-opacity"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground text-lg">{fullName || "Your Name"}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{practiceName || "No practice set"}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
              </section>

              {/* Personal Info */}
              <section className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> {t("profile.personalInformation")}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.fullName")}</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.email")}</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input value={email} disabled className="bg-secondary border-border opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.phone")}</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.specialty")}</Label>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder={t("profile.specialtyPlaceholder")} className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">{t("profile.bio")}</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("profile.bioPlaceholder")} rows={3} className="bg-secondary border-border resize-none" />
                </div>
              </section>

              {/* Practice Info */}
              <section className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> {t("profile.practiceDetails")}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.practiceName")}</Label>
                    <Input value={practiceName} onChange={(e) => setPracticeName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.organization")}</Label>
                    <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">{t("profile.timezone")}</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display font-semibold text-foreground">{t("profile.notificationPreferences")}</h2>
                <div className="space-y-4">
                  {notificationItems.map((item) => (
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

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {t("profile.saveProfile")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
