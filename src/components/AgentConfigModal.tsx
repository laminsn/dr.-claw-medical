import { useState, useEffect, useMemo } from "react";
import {
  X,
  Mic,
  Globe,
  FileText,
  Calendar,
  Save,
  Loader2,
  AudioWaveform,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AgentConfigModalProps {
  agent: {
    id: string;
    name: string;
    category: string;
  };
  open: boolean;
  onClose: () => void;
}

const tabs = [
  { key: "voice", label: "Voice", icon: Mic },
  { key: "language", label: "Language", icon: Globe },
  { key: "scripts", label: "Scripts", icon: FileText },
  { key: "schedule", label: "Schedule", icon: Calendar },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// Standard voices (built-in)
const standardVoices = [
  { id: "alloy", name: "Alloy", desc: "Warm & professional", provider: "standard" },
  { id: "nova", name: "Nova", desc: "Friendly & upbeat", provider: "standard" },
  { id: "echo", name: "Echo", desc: "Calm & measured", provider: "standard" },
  { id: "shimmer", name: "Shimmer", desc: "Soft & reassuring", provider: "standard" },
];

// ElevenLabs premium voices
const elevenLabsVoices = [
  { id: "el-rachel", name: "Rachel", desc: "Calm & confident", provider: "elevenlabs" },
  { id: "el-drew", name: "Drew", desc: "Warm & authoritative", provider: "elevenlabs" },
  { id: "el-sarah", name: "Sarah", desc: "Soft & empathetic", provider: "elevenlabs" },
  { id: "el-charlie", name: "Charlie", desc: "Casual & friendly", provider: "elevenlabs" },
  { id: "el-charlotte", name: "Charlotte", desc: "Elegant & soothing", provider: "elevenlabs" },
  { id: "el-james", name: "James", desc: "Deep & reassuring", provider: "elevenlabs" },
  { id: "el-alice", name: "Alice", desc: "Cheerful & caring", provider: "elevenlabs" },
  { id: "el-fin", name: "Fin", desc: "Clear & clinical", provider: "elevenlabs" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
];

const dayOptions = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

const AgentConfigModal = ({ agent, open, onClose }: AgentConfigModalProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("voice");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Config state
  const [voiceProfile, setVoiceProfile] = useState("alloy");
  const [language, setLanguage] = useState("en");
  const [autoDetect, setAutoDetect] = useState(false);
  const [elevenlabsConnected, setElevenlabsConnected] = useState(false);
  const [voiceEngine, setVoiceEngine] = useState<"standard" | "elevenlabs">("standard");
  const [openingScript, setOpeningScript] = useState(
    `Hello {patient_name}, this is Dr. Claw calling from {practice_name}. How are you feeling today?`
  );
  const [maxRetries, setMaxRetries] = useState(3);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [scheduleDays, setScheduleDays] = useState(["mon", "tue", "wed", "thu", "fri"]);
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("17:00");
  const [slackChannel, setSlackChannel] = useState("");
  const [slackNotifications, setSlackNotifications] = useState(false);

  // Active voice list based on engine selection
  const activeVoices = useMemo(
    () => (voiceEngine === "elevenlabs" && elevenlabsConnected ? elevenLabsVoices : standardVoices),
    [voiceEngine, elevenlabsConnected]
  );

  // Load existing config + check ElevenLabs connection
  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);

    const loadConfig = async () => {
      // Load agent config
      const { data } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_key", agent.id)
        .maybeSingle();

      if (data) {
        setVoiceProfile(data.voice_profile || "alloy");
        setLanguage(data.language || "en");
        setAutoDetect(data.auto_detect_language || false);
        setOpeningScript(data.opening_script || "");
        setMaxRetries(data.max_retries || 3);
        setAutoEscalate(data.auto_escalate ?? true);
        setScheduleDays(data.schedule_days || ["mon", "tue", "wed", "thu", "fri"]);
        setScheduleStart(data.schedule_start || "09:00");
        setScheduleEnd(data.schedule_end || "17:00");
        setSlackChannel(data.slack_channel || "");
        setSlackNotifications(data.slack_notifications || false);

        // Set voice engine based on saved profile
        if (data.voice_profile?.startsWith("el-")) {
          setVoiceEngine("elevenlabs");
        } else {
          setVoiceEngine("standard");
        }
      }

      // Check if ElevenLabs is connected
      const { data: elData } = await supabase
        .from("user_integrations")
        .select("is_active")
        .eq("user_id", user.id)
        .eq("integration_key", "elevenlabs")
        .maybeSingle();

      setElevenlabsConnected(!!elData?.is_active);

      setLoading(false);
    };

    loadConfig();
  }, [open, user, agent.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const configData = {
      user_id: user.id,
      agent_key: agent.id,
      name: agent.name,
      voice_profile: voiceProfile,
      language,
      auto_detect_language: autoDetect,
      opening_script: openingScript,
      max_retries: maxRetries,
      auto_escalate: autoEscalate,
      schedule_days: scheduleDays,
      schedule_start: scheduleStart,
      schedule_end: scheduleEnd,
      slack_channel: slackChannel,
      slack_notifications: slackNotifications,
    };

    const { error } = await supabase
      .from("agent_configs")
      .upsert(configData, { onConflict: "user_id,agent_key" });

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuration saved", description: `${agent.name} settings updated successfully.` });
      onClose();
    }
    setSaving(false);
  };

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Configure {agent.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{agent.category}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {activeTab === "voice" && (
                <div className="space-y-5">
                  {/* Voice Engine Selector */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Voice Engine</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setVoiceEngine("standard");
                          // Reset to standard voice if switching engines
                          if (voiceProfile.startsWith("el-")) setVoiceProfile("alloy");
                        }}
                        className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                          voiceEngine === "standard"
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:border-muted-foreground/30"
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                        Standard
                      </button>
                      <button
                        onClick={() => {
                          if (!elevenlabsConnected) return;
                          setVoiceEngine("elevenlabs");
                          // Reset to ElevenLabs voice if switching engines
                          if (!voiceProfile.startsWith("el-")) setVoiceProfile("el-rachel");
                        }}
                        disabled={!elevenlabsConnected}
                        className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                          voiceEngine === "elevenlabs"
                            ? "border-primary bg-primary/10 text-foreground"
                            : elevenlabsConnected
                            ? "border-border text-muted-foreground hover:border-muted-foreground/30"
                            : "border-border/50 text-muted-foreground/40 cursor-not-allowed"
                        }`}
                      >
                        <AudioWaveform className="h-4 w-4" />
                        ElevenLabs
                        {!elevenlabsConnected && (
                          <span className="ml-auto text-[10px] text-muted-foreground/50">
                            Not connected
                          </span>
                        )}
                      </button>
                    </div>
                    {!elevenlabsConnected && voiceEngine === "standard" && (
                      <p className="text-[11px] text-muted-foreground/60">
                        Connect ElevenLabs in Integrations to unlock premium voices with cloning, emotion control, and 29+ languages.
                      </p>
                    )}
                  </div>

                  {/* Voice Profile Selection */}
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Voice Profile
                      {voiceEngine === "elevenlabs" && (
                        <span className="ml-2 text-[10px] font-normal text-primary/70">
                          ElevenLabs Premium
                        </span>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {activeVoices.map((v) => {
                        const isEL = v.provider === "elevenlabs";
                        const isSelected = voiceProfile === v.id;

                        return (
                          <button
                            key={v.id}
                            onClick={() => setVoiceProfile(v.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              isSelected
                                ? isEL
                                  ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                  : "border-primary bg-primary/10"
                                : "border-border bg-secondary hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm text-foreground">{v.name}</p>
                              {isEL && (
                                <AudioWaveform className={`h-3 w-3 ${isSelected ? "text-primary" : "text-muted-foreground/40"}`} />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                            <div className="flex gap-0.5 mt-3">
                              {[...Array(isEL ? 12 : 8)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-colors ${
                                    isSelected ? "bg-primary" : "bg-muted-foreground/30"
                                  }`}
                                  style={{
                                    height: `${Math.random() * (isEL ? 20 : 16) + (isEL ? 6 : 8)}px`,
                                  }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "language" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-foreground">Primary Language</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => setLanguage(l.code)}
                          className={`p-3 rounded-xl border text-sm transition-all ${
                            language === l.code
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-Detect Language</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Automatically detect and switch to the patient's language
                      </p>
                    </div>
                    <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
                  </div>
                </div>
              )}

              {activeTab === "scripts" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-foreground">Opening Script</Label>
                    <Textarea
                      value={openingScript}
                      onChange={(e) => setOpeningScript(e.target.value)}
                      rows={4}
                      className="bg-secondary border-border resize-none"
                      placeholder="Hello {patient_name}..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Available placeholders: {"{patient_name}"}, {"{practice_name}"}, {"{appointment_date}"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Max Retries</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                      <div>
                        <p className="text-sm font-medium text-foreground">Auto-Escalate</p>
                        <p className="text-xs text-muted-foreground">Transfer to staff if needed</p>
                      </div>
                      <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground">Slack Notifications</Label>
                    <div className="flex items-center gap-3">
                      <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
                      <span className="text-sm text-muted-foreground">
                        Send call summaries to Slack
                      </span>
                    </div>
                    {slackNotifications && (
                      <Input
                        value={slackChannel}
                        onChange={(e) => setSlackChannel(e.target.value)}
                        placeholder="#agent-notifications"
                        className="bg-secondary border-border"
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-foreground">Active Days</Label>
                    <div className="flex gap-2">
                      {dayOptions.map((d) => (
                        <button
                          key={d.key}
                          onClick={() => toggleDay(d.key)}
                          className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                            scheduleDays.includes(d.key)
                              ? "gradient-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Start Time</Label>
                      <Input
                        type="time"
                        value={scheduleStart}
                        onChange={(e) => setScheduleStart(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">End Time</Label>
                      <Input
                        type="time"
                        value={scheduleEnd}
                        onChange={(e) => setScheduleEnd(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigModal;
