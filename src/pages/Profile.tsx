import { useState, useEffect } from "react";
import { User, Mail, Phone, Building2, Stethoscope, Globe, Save, Loader2 } from "lucide-react";
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

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setPhone((data as any).phone || "");
        setPracticeName(data.practice_name || "");
        setSpecialty((data as any).specialty || "");
        setOrganization((data as any).organization || "");
        setBio((data as any).bio || "");
        setTimezone((data as any).timezone || "America/New_York");
        const prefs = (data as any).notification_preferences as any;
        if (prefs) {
          setNotifEmail(prefs.email ?? true);
          setNotifSms(prefs.sms ?? false);
          setNotifSlack(prefs.slack ?? false);
        }
      }

      // Load role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleData && roleData.length > 0) {
        setRole((roleData[0] as any).role);
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

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
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
    setSaving(false);
  };

  const roleBadgeColor = role === "master_admin"
    ? "gradient-primary text-primary-foreground"
    : role === "admin"
    ? "bg-accent/20 text-accent"
    : "bg-secondary text-muted-foreground";

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Provider Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your clinical account, practice details, and preferences</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColor}`}>
              {role.replace("_", " ")}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personal Info */}
              <section className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input value={email} disabled className="bg-secondary border-border opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Specialty</Label>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="bg-secondary border-border resize-none" />
                </div>
              </section>

              {/* Practice Info */}
              <section className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Practice Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Practice Name</Label>
                    <Input value={practiceName} onChange={(e) => setPracticeName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Organization</Label>
                    <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Timezone</Label>
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
                <h2 className="font-display font-semibold text-foreground">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "Email Notifications", desc: "Receive reports and alerts via email", value: notifEmail, setter: setNotifEmail },
                    { label: "SMS Notifications", desc: "Get text alerts for critical events", value: notifSms, setter: setNotifSms },
                    { label: "Slack Notifications", desc: "Send agent updates to your Slack workspace", value: notifSlack, setter: setNotifSlack },
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

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
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
