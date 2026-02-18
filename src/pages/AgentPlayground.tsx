import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Send,
  RotateCcw,
  Thermometer,
  Hash,
  FileText,
  Shield,
  Zap,
  Clock,
  Activity,
  Eye,
  SmilePlus,
  Calendar,
  AlertTriangle,
  HeartPulse,
  Pill,
  DollarSign,
  MessageSquare,
  SlidersHorizontal,
  Play,
  Lock,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentDefinition {
  id: string;
  name: string;
  model: string;
  initials: string;
  color: string;
  skills: { id: string; name: string; enabled: boolean }[];
  systemPrompt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

interface TestScenario {
  id: string;
  title: string;
  description: string;
  icon: typeof Calendar;
  firstMessage: string;
}

type AgentZone = "clinical" | "operations" | "external";

const AGENT_ZONE_MAP: Record<string, AgentZone> = {
  "front-desk": "clinical",
  "clinical-coordinator": "clinical",
  "patient-outreach": "external",
  "content-engine": "external",
  "financial-analyst": "operations",
  "hr-coordinator": "operations",
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const AGENTS: AgentDefinition[] = [
  {
    id: "front-desk",
    name: "Front Desk Agent",
    model: "GPT-4",
    initials: "FD",
    color: "from-blue-500 to-cyan-500",
    skills: [
      { id: "scheduling", name: "Appointment Scheduling", enabled: true },
      { id: "insurance", name: "Insurance Verification", enabled: true },
      { id: "intake", name: "Patient Intake", enabled: true },
      { id: "follow-up", name: "Follow-Up Reminders", enabled: true },
    ],
    systemPrompt:
      "You are a friendly and professional front desk agent for a healthcare clinic. You help patients schedule appointments, verify insurance information, handle intake forms, and send follow-up reminders. Always be courteous and HIPAA-compliant. Never disclose PHI to unauthorized parties.",
  },
  {
    id: "clinical-coordinator",
    name: "Clinical Coordinator",
    model: "GPT-4",
    initials: "CC",
    color: "from-violet-500 to-purple-500",
    skills: [
      { id: "triage", name: "Clinical Triage", enabled: true },
      { id: "referral", name: "Referral Management", enabled: true },
      { id: "care-plan", name: "Care Plan Coordination", enabled: true },
      { id: "lab-orders", name: "Lab Order Tracking", enabled: false },
    ],
    systemPrompt:
      "You are a clinical coordinator AI assistant. You help triage patient inquiries, manage referrals between specialists, coordinate care plans, and track lab orders. Follow clinical protocols strictly and escalate urgent matters immediately.",
  },
  {
    id: "patient-outreach",
    name: "Patient Outreach",
    model: "Claude",
    initials: "PO",
    color: "from-emerald-500 to-green-500",
    skills: [
      { id: "campaigns", name: "Campaign Management", enabled: true },
      { id: "reminders", name: "Appointment Reminders", enabled: true },
      { id: "surveys", name: "Patient Surveys", enabled: true },
      { id: "education", name: "Health Education", enabled: false },
    ],
    systemPrompt:
      "You are a patient outreach specialist AI. You craft personalized patient communications, manage outreach campaigns, send appointment reminders, conduct satisfaction surveys, and distribute health education materials. Maintain a warm, empathetic tone.",
  },
  {
    id: "content-engine",
    name: "Content Engine",
    model: "Claude",
    initials: "CE",
    color: "from-pink-500 to-rose-500",
    skills: [
      { id: "blog", name: "Blog Writing", enabled: true },
      { id: "social", name: "Social Media", enabled: true },
      { id: "seo", name: "SEO Optimization", enabled: true },
      { id: "compliance", name: "Content Compliance", enabled: true },
    ],
    systemPrompt:
      "You are a healthcare content engine AI. You create blog posts, social media content, and marketing materials for medical practices. All content must be medically accurate, SEO-optimized, and compliant with healthcare advertising regulations.",
  },
  {
    id: "financial-analyst",
    name: "Financial Analyst",
    model: "GPT-4",
    initials: "FA",
    color: "from-amber-500 to-orange-500",
    skills: [
      { id: "billing", name: "Billing Analysis", enabled: true },
      { id: "revenue", name: "Revenue Forecasting", enabled: true },
      { id: "claims", name: "Claims Processing", enabled: true },
      { id: "reporting", name: "Financial Reporting", enabled: false },
    ],
    systemPrompt:
      "You are a healthcare financial analyst AI. You analyze billing data, forecast revenue, process insurance claims, and generate financial reports. Provide accurate financial insights while maintaining strict data confidentiality.",
  },
  {
    id: "hr-coordinator",
    name: "HR Coordinator",
    model: "Gemini",
    initials: "HR",
    color: "from-teal-500 to-cyan-500",
    skills: [
      { id: "onboarding", name: "Staff Onboarding", enabled: true },
      { id: "payroll", name: "Payroll Inquiries", enabled: true },
      { id: "pto", name: "PTO Management", enabled: true },
      { id: "training", name: "Training Coordination", enabled: true },
    ],
    systemPrompt:
      "You are an HR coordinator AI for a healthcare organization. You assist with staff onboarding, answer payroll inquiries, manage PTO requests, and coordinate training programs. Be professional, supportive, and ensure compliance with labor regulations.",
  },
];

const DEFAULT_CONVERSATIONS: Record<string, ChatMessage[]> = {
  "front-desk": [
    {
      id: "fd-1",
      role: "user",
      content: "Hi, I'd like to book an appointment with Dr. Martinez for next week.",
      timestamp: "10:30 AM",
    },
    {
      id: "fd-2",
      role: "agent",
      content:
        "Hello! I'd be happy to help you schedule an appointment with Dr. Martinez. I have availability on Tuesday at 2:00 PM, Wednesday at 9:30 AM, or Thursday at 11:00 AM. Which works best for you?",
      timestamp: "10:30 AM",
    },
    {
      id: "fd-3",
      role: "user",
      content: "Wednesday at 9:30 AM would be perfect. Do you need my insurance info?",
      timestamp: "10:31 AM",
    },
    {
      id: "fd-4",
      role: "agent",
      content:
        "Great choice! I've tentatively reserved Wednesday at 9:30 AM with Dr. Martinez for you. Yes, I'll need to verify your insurance. Could you provide your insurance provider name and member ID? I'll run a quick eligibility check to make sure everything is covered before confirming your appointment.",
      timestamp: "10:31 AM",
    },
    {
      id: "fd-5",
      role: "user",
      content: "Sure, it's BlueCross BlueShield, member ID BCB-449281.",
      timestamp: "10:32 AM",
    },
    {
      id: "fd-6",
      role: "agent",
      content:
        "Thank you! I've verified your BlueCross BlueShield coverage (Member ID: BCB-449281) and your plan is active with a $30 specialist copay. Your appointment with Dr. Martinez is confirmed for Wednesday at 9:30 AM. I'll send you a confirmation text and a reminder 24 hours before. Is there anything else I can help with?",
      timestamp: "10:32 AM",
    },
  ],
  "clinical-coordinator": [
    {
      id: "cc-1",
      role: "user",
      content: "I need to set up a referral to cardiology for a patient with persistent chest pain.",
      timestamp: "2:15 PM",
    },
    {
      id: "cc-2",
      role: "agent",
      content:
        "I can help with that referral. Based on the symptom profile of persistent chest pain, I'd recommend Dr. Chen in our cardiology department. She has the earliest availability and specializes in diagnostic evaluations. I'll need the patient's name and date of birth to initiate the referral. Shall I also flag this as urgent priority?",
      timestamp: "2:15 PM",
    },
    {
      id: "cc-3",
      role: "user",
      content: "Yes, please flag it as urgent. The patient has been experiencing symptoms for 3 days.",
      timestamp: "2:16 PM",
    },
    {
      id: "cc-4",
      role: "agent",
      content:
        "Understood. I've flagged this as an urgent referral given the 3-day duration of symptoms. The referral has been routed to Dr. Chen's team with priority status. They typically respond to urgent referrals within 4 hours. I've also added a clinical note about the symptom duration. The patient should expect a call from cardiology today to schedule their evaluation.",
      timestamp: "2:16 PM",
    },
  ],
  "patient-outreach": [
    {
      id: "po-1",
      role: "user",
      content: "Can you draft an outreach message for patients who are overdue for their annual wellness visit?",
      timestamp: "11:00 AM",
    },
    {
      id: "po-2",
      role: "agent",
      content:
        "Of course! Here's a draft outreach message:\n\nSubject: Time for Your Annual Wellness Visit\n\nHi [Patient Name],\n\nWe noticed it's been over a year since your last wellness checkup. Regular preventive care is one of the best ways to stay on top of your health. We'd love to get you scheduled at your earliest convenience.\n\nBooking is easy - reply to this message or call us at (555) 123-4567.\n\nLooking forward to seeing you!\n\nWould you like me to personalize this further or set up an automated campaign?",
      timestamp: "11:00 AM",
    },
    {
      id: "po-3",
      role: "user",
      content: "That looks great. Set it up as an automated campaign for all patients overdue by 30+ days.",
      timestamp: "11:01 AM",
    },
    {
      id: "po-4",
      role: "agent",
      content:
        "I've configured the automated campaign with these settings:\n\n- Target: Patients with last wellness visit 30+ days overdue\n- Channel: SMS + Email (dual delivery)\n- Schedule: Sends Tuesday at 10 AM (highest open-rate window)\n- Follow-up: Auto-reminder 7 days after initial send if no response\n- Estimated reach: 142 patients in the current cohort\n\nThe campaign is staged and ready. Shall I activate it now or would you like to review the patient list first?",
      timestamp: "11:01 AM",
    },
  ],
  "content-engine": [
    {
      id: "ce-1",
      role: "user",
      content: "Write a short blog intro about the importance of flu vaccines this season.",
      timestamp: "3:00 PM",
    },
    {
      id: "ce-2",
      role: "agent",
      content:
        "Here's a draft blog introduction:\n\n**Why This Flu Season Demands Your Attention**\n\nAs temperatures drop and we spend more time indoors, flu season is ramping up - and this year's strains are proving particularly aggressive. The CDC reports that early indicators suggest a higher-than-average season, making vaccination more critical than ever.\n\nGetting your flu shot isn't just about protecting yourself. It's about safeguarding your family, coworkers, and community - especially those who are immunocompromised or elderly.\n\nShall I continue with the full article, add statistics, or adjust the tone?",
      timestamp: "3:00 PM",
    },
  ],
  "financial-analyst": [
    {
      id: "fa-1",
      role: "user",
      content: "Can you pull up the claim denial rate for Q4 and identify the top reasons?",
      timestamp: "4:00 PM",
    },
    {
      id: "fa-2",
      role: "agent",
      content:
        "Based on the Q4 data analysis:\n\n**Claim Denial Rate: 8.3%** (up from 6.9% in Q3)\n\nTop denial reasons:\n1. **Missing prior authorization** - 34% of denials\n2. **Incorrect procedure codes** - 22% of denials\n3. **Eligibility issues** - 18% of denials\n4. **Duplicate claims** - 14% of denials\n5. **Timely filing** - 12% of denials\n\nThe prior authorization gap is the biggest opportunity. Implementing automated auth checks could reduce denials by an estimated 2.8%. Shall I generate a detailed report with recommended actions?",
      timestamp: "4:00 PM",
    },
  ],
  "hr-coordinator": [
    {
      id: "hr-1",
      role: "user",
      content: "I have a new nurse starting Monday. What's the onboarding checklist?",
      timestamp: "9:00 AM",
    },
    {
      id: "hr-2",
      role: "agent",
      content:
        "Welcome aboard! Here's the standard nursing onboarding checklist:\n\n**Pre-Start (Complete by Friday):**\n- Background check verification\n- License and credentials validation\n- IT account setup (EHR, email, badge)\n- Scrubs and PPE ordered\n\n**Day 1 (Monday):**\n- Facility tour and introductions\n- HIPAA compliance training\n- EHR system orientation (2 hrs)\n- Emergency protocols review\n\n**Week 1:**\n- Shadow senior nurse (3 shifts)\n- Complete mandatory safety modules\n- Benefits enrollment deadline (Day 5)\n\nI can auto-generate the IT request and send calendar invites for each session. Shall I proceed?",
      timestamp: "9:00 AM",
    },
  ],
};

const MOCK_AGENT_RESPONSES: Record<string, string[]> = {
  "front-desk": [
    "I'd be happy to help with that! Let me pull up the schedule and check availability for you. One moment please...",
    "I've found some available slots. Before I confirm, could you verify your date of birth so I can pull up your patient record?",
    "Everything looks good on my end. I'll send you a confirmation via your preferred contact method. Is there anything else I can assist you with today?",
    "That's a great question. Let me check with our billing department and get back to you within the hour. In the meantime, you can view your account details through our patient portal.",
  ],
  "clinical-coordinator": [
    "Based on the clinical information provided, I'd recommend scheduling a follow-up within the next 48 hours. Let me check specialist availability.",
    "I've reviewed the lab results and flagged the relevant findings for the care team. The attending physician will be notified shortly.",
    "The referral has been submitted and is pending review. I'll monitor the status and notify you once it's been accepted by the receiving department.",
  ],
  "patient-outreach": [
    "I've drafted the outreach campaign. The messaging is personalized based on each patient's last visit date and preferred communication channel.",
    "The survey results are in! Overall satisfaction is at 4.2/5, up from 3.8 last quarter. I can generate a detailed breakdown by department if helpful.",
    "Campaign performance update: 68% open rate, 24% response rate. These metrics are above industry benchmarks for healthcare communications.",
  ],
  "content-engine": [
    "Here's the draft content. I've optimized it for SEO with relevant healthcare keywords and maintained a 8th-grade reading level for accessibility.",
    "I've reviewed the content for medical accuracy and compliance. Two minor adjustments were needed to align with FDA advertising guidelines.",
    "The social media calendar for next month is ready. I've scheduled posts across all platforms with healthcare-specific hashtags and engagement prompts.",
  ],
  "financial-analyst": [
    "I've completed the revenue analysis for the requested period. Key highlights: 12% growth in procedural revenue offset by a 3% increase in claim denials.",
    "The billing audit identified 23 claims that may be eligible for appeal. Estimated recoverable amount: $18,400. Shall I initiate the appeal process?",
    "Cash flow projections for next quarter show a healthy 15% margin, assuming current patient volume trends continue. I've flagged two payers with delayed reimbursement patterns.",
  ],
  "hr-coordinator": [
    "I've initiated the onboarding workflow for the new hire. All required documents have been sent to their email and badge access has been requested.",
    "PTO balances have been updated for the current pay period. Three staff members have pending requests that need supervisor approval by end of day.",
    "The mandatory training compliance report shows 94% completion across all departments. I've sent reminders to the remaining staff with upcoming deadlines.",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeNow(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AgentPlayground = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const ZONE_CONFIG: Record<AgentZone, { label: string; shortLabel: string; color: string; bgColor: string; description: string }> = {
    clinical: { label: t("playground.zoneClinicalLabel"), shortLabel: t("playground.zoneClinicalShort"), color: "text-red-400", bgColor: "bg-red-500/15 border-red-500/30 text-red-400", description: t("playground.zoneClinicalDesc") },
    operations: { label: t("playground.zoneOperationsLabel"), shortLabel: t("playground.zoneOperationsShort"), color: "text-amber-400", bgColor: "bg-amber-500/15 border-amber-500/30 text-amber-400", description: t("playground.zoneOperationsDesc") },
    external: { label: t("playground.zoneExternalLabel"), shortLabel: t("playground.zoneExternalShort"), color: "text-blue-400", bgColor: "bg-blue-500/15 border-blue-500/30 text-blue-400", description: t("playground.zoneExternalDesc") },
  };

  const TEST_SCENARIOS: TestScenario[] = [
    {
      id: "book-appointment",
      title: t("playground.scenarioBookAppointment"),
      description: t("playground.scenarioBookAppointmentDesc"),
      icon: Calendar,
      firstMessage:
        "I need to schedule a follow-up appointment with my primary care doctor for sometime next week. I prefer mornings if possible.",
    },
    {
      id: "handle-complaint",
      title: t("playground.scenarioHandleComplaint"),
      description: t("playground.scenarioHandleComplaintDesc"),
      icon: AlertTriangle,
      firstMessage:
        "I'm extremely frustrated. I've been waiting over 45 minutes past my appointment time and nobody has told me what's going on. This is unacceptable.",
    },
    {
      id: "insurance-query",
      title: t("playground.scenarioInsuranceQuery"),
      description: t("playground.scenarioInsuranceQueryDesc"),
      icon: Shield,
      firstMessage:
        "I just switched to a new insurance plan through my employer - Aetna PPO. Can you check if Dr. Williams is still in-network and what my copay would be?",
    },
    {
      id: "emergency-triage",
      title: t("playground.scenarioEmergencyTriage"),
      description: t("playground.scenarioEmergencyTriageDesc"),
      icon: HeartPulse,
      firstMessage:
        "My child has a fever of 103.5 and has been vomiting for the past 2 hours. Should I come to the clinic or go to the emergency room?",
    },
    {
      id: "prescription-refill",
      title: t("playground.scenarioPrescriptionRefill"),
      description: t("playground.scenarioPrescriptionRefillDesc"),
      icon: Pill,
      firstMessage:
        "I need to refill my blood pressure medication - Lisinopril 10mg. I think I have one refill left on the prescription. Can you help me with that?",
    },
    {
      id: "billing-question",
      title: t("playground.scenarioBillingQuestion"),
      description: t("playground.scenarioBillingQuestionDesc"),
      icon: DollarSign,
      firstMessage:
        "I received a bill for $450 from my last visit but my insurance should have covered most of it. Can you explain the charges and check if the claim was processed correctly?",
    },
  ];

  // Agent selection
  const [selectedAgentId, setSelectedAgentId] = useState<string>("front-desk");
  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId) ?? AGENTS[0];

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>(
    DEFAULT_CONVERSATIONS["front-desk"]
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState(selectedAgent.systemPrompt);
  const [skillToggles, setSkillToggles] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    selectedAgent.skills.forEach((s) => {
      map[s.id] = s.enabled;
    });
    return map;
  });
  const [phiProtection, setPhiProtection] = useState(true);
  const [responseFormat, setResponseFormat] = useState<string>("text");

  // Performance metrics
  const [metrics, setMetrics] = useState({
    responseTime: 842,
    tokenUsage: 1247,
    phiDetections: 0,
    sentimentScore: 0.87,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handler: change agent
  const handleAgentChange = (agentId: string) => {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent) return;
    setSelectedAgentId(agentId);
    setMessages(DEFAULT_CONVERSATIONS[agentId] ?? []);
    setSystemPrompt(agent.systemPrompt);
    const map: Record<string, boolean> = {};
    agent.skills.forEach((s) => {
      map[s.id] = s.enabled;
    });
    setSkillToggles(map);
    setInputText("");
    setIsTyping(false);
    setMetrics({
      responseTime: Math.floor(Math.random() * 600) + 400,
      tokenUsage: Math.floor(Math.random() * 1500) + 500,
      phiDetections: 0,
      sentimentScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    });
    toast({ title: t("playground.agentSwitched"), description: t("playground.agentSwitchedDesc", { name: agent.name }) });
  };

  // Handler: reset conversation
  const handleReset = () => {
    setMessages(DEFAULT_CONVERSATIONS[selectedAgentId] ?? []);
    setInputText("");
    setIsTyping(false);
    setMetrics({
      responseTime: 842,
      tokenUsage: 1247,
      phiDetections: 0,
      sentimentScore: 0.87,
    });
    toast({ title: t("playground.conversationReset"), description: t("playground.conversationResetDesc") });
  };

  // Handler: send message
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: getTimeNow(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate agent response after delay
    const delay = Math.floor(Math.random() * 1500) + 800;
    setTimeout(() => {
      const responses = MOCK_AGENT_RESPONSES[selectedAgentId] ?? MOCK_AGENT_RESPONSES["front-desk"];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "agent",
        content: randomResponse,
        timestamp: getTimeNow(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);

      // Update metrics
      setMetrics({
        responseTime: delay,
        tokenUsage: (prev) => prev,
        phiDetections: Math.random() > 0.8 ? 1 : 0,
        sentimentScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      } as any);
      setMetrics((prev) => ({
        responseTime: delay,
        tokenUsage: prev.tokenUsage + Math.floor(Math.random() * 300) + 100,
        phiDetections: prev.phiDetections + (Math.random() > 0.8 ? 1 : 0),
        sentimentScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      }));
    }, delay);
  };

  // Handler: load test scenario
  const handleLoadScenario = (scenario: TestScenario) => {
    setMessages([]);
    setIsTyping(false);

    const userMsg: ChatMessage = {
      id: `scenario-${Date.now()}`,
      role: "user",
      content: scenario.firstMessage,
      timestamp: getTimeNow(),
    };
    setMessages([userMsg]);
    setIsTyping(true);

    const delay = Math.floor(Math.random() * 1500) + 800;
    setTimeout(() => {
      const responses = MOCK_AGENT_RESPONSES[selectedAgentId] ?? MOCK_AGENT_RESPONSES["front-desk"];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const agentMsg: ChatMessage = {
        id: `scenario-resp-${Date.now()}`,
        role: "agent",
        content: randomResponse,
        timestamp: getTimeNow(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      setMetrics((prev) => ({
        responseTime: delay,
        tokenUsage: prev.tokenUsage + Math.floor(Math.random() * 300) + 100,
        phiDetections: prev.phiDetections + (Math.random() > 0.8 ? 1 : 0),
        sentimentScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      }));
    }, delay);

    toast({
      title: t("playground.scenarioLoaded"),
      description: t("playground.scenarioLoadedDesc", { title: scenario.title }),
    });
  };

  // Handler: toggle skill
  const handleSkillToggle = (skillId: string) => {
    setSkillToggles((prev) => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  // Handler: key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* -- Header -- */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("playground.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("playground.subtitle")}
            </p>
          </div>

          {/* -- Agent Selector Top Bar -- */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 max-w-xs">
                  <Select value={selectedAgentId} onValueChange={handleAgentChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENTS.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <span className="flex items-center gap-2">
                            {agent.name} &mdash; {agent.model}
                            <span className={`text-[9px] px-1 py-0 rounded ${ZONE_CONFIG[AGENT_ZONE_MAP[agent.id] || "operations"].bgColor}`}>
                              {ZONE_CONFIG[AGENT_ZONE_MAP[agent.id] || "operations"].shortLabel}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Zone Badge */}
                <Badge variant="outline" className={`text-[10px] ${ZONE_CONFIG[AGENT_ZONE_MAP[selectedAgentId] || "operations"].bgColor}`}>
                  {ZONE_CONFIG[AGENT_ZONE_MAP[selectedAgentId] || "operations"].label}
                </Badge>
                <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                  {selectedAgent.skills
                    .filter((s) => skillToggles[s.id])
                    .map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="outline"
                        className="text-[10px] border-primary/30 text-primary bg-primary/10"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                {t("playground.resetConversation")}
              </Button>
            </div>
          </div>

          {/* -- Main Content: Chat + Controls -- */}
          <div className="flex gap-6">
            {/* Chat Interface (main area) */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Container */}
              <div className="bg-card rounded-xl border border-white/[0.06] flex flex-col" style={{ height: "560px" }}>
                {AGENT_ZONE_MAP[selectedAgentId] === "clinical" && (
                  <div className="px-4 py-2 bg-red-500/5 border-b border-red-500/20 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <p className="text-[10px] text-red-400/90">
                      <span className="font-semibold">{t("playground.zone1TestMode")}:</span> {t("playground.zone1TestModeDesc")}
                    </p>
                  </div>
                )}
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "agent" && (
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br ${selectedAgent.color} text-white text-xs font-bold shrink-0 mt-1 mr-2`}
                        >
                          {selectedAgent.initials}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] ${
                          msg.role === "user"
                            ? "gradient-primary text-white rounded-2xl rounded-br-md px-4 py-3"
                            : "bg-card border border-white/[0.06] text-foreground rounded-2xl rounded-bl-md px-4 py-3"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            msg.role === "user"
                              ? "text-white/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br ${selectedAgent.color} text-white text-xs font-bold shrink-0 mt-1 mr-2`}
                      >
                        {selectedAgent.initials}
                      </div>
                      <div className="bg-card border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="border-t border-white/[0.06] p-4">
                  <div className="flex items-end gap-3">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("playground.typeMessagePlaceholder")}
                      className="bg-background border-border resize-none min-h-[44px] max-h-[120px]"
                      rows={1}
                    />
                    <Button
                      className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 h-[44px] px-4"
                      onClick={handleSend}
                      disabled={!inputText.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* -- Performance Metrics -- */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-card rounded-xl border border-white/[0.06] p-4 card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{t("playground.responseTime")}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{metrics.responseTime}ms</p>
                </div>
                <div className="bg-card rounded-xl border border-white/[0.06] p-4 card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{t("playground.tokenUsage")}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{metrics.tokenUsage.toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-white/[0.06] p-4 card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{t("playground.phiDetections")}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{metrics.phiDetections}</p>
                </div>
                <div className="bg-card rounded-xl border border-white/[0.06] p-4 card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                      <SmilePlus className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{t("playground.sentimentScore")}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{metrics.sentimentScore}</p>
                </div>
              </div>
            </div>

            {/* -- Conversation Controls Sidebar -- */}
            <div className="w-80 shrink-0 space-y-4 hidden lg:block">
              <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover space-y-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{t("playground.controls")}</h3>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Zone Restrictions */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-red-400" />
                    {t("playground.securityZone")}
                  </Label>
                  <div className={`rounded-lg border p-3 ${
                    AGENT_ZONE_MAP[selectedAgentId] === "clinical" ? "border-red-500/30 bg-red-500/5" :
                    AGENT_ZONE_MAP[selectedAgentId] === "operations" ? "border-amber-500/30 bg-amber-500/5" :
                    "border-blue-500/30 bg-blue-500/5"
                  }`}>
                    <p className={`text-xs font-semibold ${ZONE_CONFIG[AGENT_ZONE_MAP[selectedAgentId] || "operations"].color}`}>
                      {ZONE_CONFIG[AGENT_ZONE_MAP[selectedAgentId] || "operations"].label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {ZONE_CONFIG[AGENT_ZONE_MAP[selectedAgentId] || "operations"].description}
                    </p>
                  </div>
                  {AGENT_ZONE_MAP[selectedAgentId] === "clinical" && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <Lock className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-red-400/80 leading-relaxed">
                        {t("playground.clinicalRestrictionNote")}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Thermometer className="h-3.5 w-3.5" />
                      {t("playground.temperature")}
                    </Label>
                    <span className="text-xs font-mono text-foreground">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(val[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    {t("playground.maxTokens")}
                  </Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="bg-background border-border text-sm"
                    min={256}
                    max={8192}
                  />
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {t("playground.systemPrompt")}
                  </Label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="bg-background border-border text-xs min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Active Skills Toggles */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    {t("playground.activeSkills")}
                  </Label>
                  <div className="space-y-2.5">
                    {selectedAgent.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{skill.name}</span>
                        <Switch
                          checked={skillToggles[skill.id] ?? skill.enabled}
                          onCheckedChange={() => handleSkillToggle(skill.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* PHI Protection */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-red-400" />
                    {t("playground.phiProtection")}
                  </Label>
                  <Switch
                    checked={phiProtection}
                    onCheckedChange={setPhiProtection}
                  />
                </div>
                {phiProtection && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Shield className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-red-400/80 leading-relaxed">
                      {t("playground.phiProtectionDesc")}
                    </p>
                  </div>
                )}

                <Separator className="bg-white/[0.06]" />

                {/* Response Format */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t("playground.responseFormat")}
                  </Label>
                  <Select value={responseFormat} onValueChange={setResponseFormat}>
                    <SelectTrigger className="bg-background border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">{t("playground.formatText")}</SelectItem>
                      <SelectItem value="json">{t("playground.formatJson")}</SelectItem>
                      <SelectItem value="structured">{t("playground.formatStructured")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* -- Test Scenarios -- */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold font-heading text-foreground">
                {t("playground.testScenarios")}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEST_SCENARIOS.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleLoadScenario(scenario)}
                    className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover text-left transition-all group hover:border-primary/30"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {scenario.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentPlayground;
