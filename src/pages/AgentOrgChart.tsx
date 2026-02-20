import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Users,
  Shield,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Network,
  Building2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Brain,
  Settings,
  GitBranch,
  Search,
  ZoomIn,
  ZoomOut,
  List,
  LayoutGrid,
  Trash2,
  ArrowRight,
  Download,
  Code,
  Linkedin,
  Sparkles,
  ChevronsUpDown,
  Power,
  PowerOff,
  Edit3,
  Save,
  AlertTriangle,
  FileJson,
  Activity,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
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
import { useAgents, type MyAgent } from "@/hooks/useAgents";

// ── Types ───────────────────────────────────────────────────────────────────

type AgentZone = "clinical" | "operations" | "external";
type AccessLevel = "all-staff" | "department-only" | "admin-only";
type ViewMode = "tree" | "list";

interface TemplateAgent {
  name: string;
  role: string;
  zone: AgentZone;
  active: boolean;
  model: string;
  skills: string[];
  level: "department-head" | "worker";
}

interface DepartmentTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  agents: TemplateAgent[];
}

interface DepartmentAccess {
  departmentName: string;
  accessLevel: AccessLevel;
}

// ── Zone Styling ────────────────────────────────────────────────────────────

const ZONE_STYLES: Record<AgentZone, { border: string; bg: string; text: string; dot: string; gradient: string; line: string }> = {
  clinical: {
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    gradient: "from-red-500/30 to-red-600/10",
    line: "border-red-500/30",
  },
  operations: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    gradient: "from-amber-500/30 to-amber-600/10",
    line: "border-amber-500/30",
  },
  external: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
    gradient: "from-blue-500/30 to-blue-600/10",
    line: "border-blue-500/30",
  },
};

const ZONE_LABELS: Record<AgentZone, string> = {
  clinical: "Clinical",
  operations: "Operations",
  external: "External",
};

const MODEL_OPTIONS = [
  { id: "openai", label: "OpenAI GPT-5", color: "text-green-400" },
  { id: "claude", label: "Claude 4 Opus", color: "text-violet-400" },
  { id: "gemini", label: "Gemini 2 Ultra", color: "text-blue-400" },
  { id: "minimax", label: "MiniMax", color: "text-amber-400" },
  { id: "kimi", label: "Kimi", color: "text-rose-400" },
];

const DEPARTMENT_ICONS: Record<string, string> = {
  "Executive": "crown",
  "Clinical Operations": "shield",
  "Marketing & Growth": "zap",
  "Finance & Accounting": "brain",
  "Human Resources": "users",
  "Research & Development": "git-branch",
  "IT & Security": "settings",
  "Development & Integration": "code",
  "Clawbots": "linkedin",
  "Intelligence & Analytics": "sparkles",
};

// ── Default Capabilities for new agents ─────────────────────────────────────

const DEFAULT_AGENT_CAPABILITIES = {
  phiProtection: true,
  messaging: true,
  voiceRecognition: false,
  distressDetection: false,
  taskCreation: false,
  hrAssistant: false,
};

// ── Department Access Storage ───────────────────────────────────────────────

const DEPT_ACCESS_KEY = "dr-claw-dept-access";

// ── Department Templates ────────────────────────────────────────────────────

const DEPARTMENT_TEMPLATES: DepartmentTemplate[] = [
  {
    id: "tpl-clinical",
    name: "Clinical Operations",
    icon: "shield",
    description: "Front desk, coordinator, insurance, and patient follow-up agents for clinical workflows.",
    agents: [
      { name: "Dr. Front Desk", role: "Front Desk Lead", zone: "clinical", active: true, model: "openai", skills: ["Patient Triage", "Scheduling", "Insurance Verification"], level: "department-head" },
      { name: "Clinical Coordinator", role: "Clinical Coordinator", zone: "clinical", active: true, model: "openai", skills: ["Care Coordination", "Follow-Up Scheduling"], level: "worker" },
      { name: "InsureBot", role: "Insurance Verifier", zone: "clinical", active: true, model: "gemini", skills: ["Eligibility Checks", "Prior Authorization", "Claims Tracking"], level: "worker" },
      { name: "FollowUp Agent", role: "Patient Follow-Up", zone: "clinical", active: true, model: "openai", skills: ["Appointment Reminders", "Post-Visit Surveys", "Lapsed Patient Outreach"], level: "worker" },
    ],
  },
  {
    id: "tpl-marketing",
    name: "Marketing & Growth",
    icon: "zap",
    description: "CMO, copywriter, content engine, and social media agents for marketing campaigns.",
    agents: [
      { name: "Marketing Maven", role: "Chief Marketing Officer", zone: "external", active: true, model: "claude", skills: ["Campaign Strategy", "Brand Management", "Analytics"], level: "department-head" },
      { name: "CopySmith", role: "Copywriter", zone: "external", active: true, model: "claude", skills: ["Ad Copy", "Blog Writing", "Email Sequences"], level: "worker" },
      { name: "Content Engine", role: "Content Engine", zone: "external", active: true, model: "openai", skills: ["SEO Optimization", "Article Generation", "Content Calendar"], level: "worker" },
      { name: "Social Pulse", role: "Social Media Manager", zone: "external", active: true, model: "openai", skills: ["Content Scheduling", "Engagement Tracking", "Trend Analysis"], level: "worker" },
    ],
  },
  {
    id: "tpl-finance",
    name: "Finance & Accounting",
    icon: "brain",
    description: "CFO, financial analyst, accountant, and grant writer agents for fiscal management.",
    agents: [
      { name: "Grant Pro", role: "Chief Financial Officer", zone: "operations", active: true, model: "claude", skills: ["Financial Modeling", "Grant Writing", "Budget Oversight"], level: "department-head" },
      { name: "Forecast AI", role: "Financial Analyst", zone: "operations", active: true, model: "gemini", skills: ["Revenue Forecasting", "Expense Tracking", "KPI Dashboards"], level: "worker" },
      { name: "Ledger AI", role: "Accountant", zone: "operations", active: true, model: "gemini", skills: ["Bookkeeping", "Tax Prep", "Invoice Processing"], level: "worker" },
      { name: "Grant Seeker", role: "Grant Writer", zone: "operations", active: true, model: "claude", skills: ["Grant Research", "Proposal Drafting", "Compliance Tracking"], level: "worker" },
    ],
  },
  {
    id: "tpl-hr",
    name: "Human Resources",
    icon: "users",
    description: "CHRO, HR coordinator, training manager, and payroll agents for people operations.",
    agents: [
      { name: "HR Prime", role: "Chief HR Officer", zone: "operations", active: true, model: "claude", skills: ["Policy Management", "Culture Strategy", "Conflict Resolution"], level: "department-head" },
      { name: "HR Coordinator", role: "HR Coordinator", zone: "operations", active: true, model: "openai", skills: ["Onboarding", "Benefits Admin", "PTO Tracking"], level: "worker" },
      { name: "Train Master", role: "Training Manager", zone: "operations", active: true, model: "openai", skills: ["Curriculum Design", "Compliance Training", "Skill Assessment"], level: "worker" },
      { name: "PayBot", role: "Payroll Specialist", zone: "operations", active: true, model: "gemini", skills: ["Payroll Processing", "Tax Withholding", "Timesheet Review"], level: "worker" },
    ],
  },
  {
    id: "tpl-rnd",
    name: "Research & Development",
    icon: "git-branch",
    description: "CAIO, researcher, data analyst, and lab analyst agents for innovation and discovery.",
    agents: [
      { name: "Research Lead", role: "Chief AI Innovation Officer", zone: "operations", active: true, model: "claude", skills: ["Research Direction", "Innovation Strategy", "Publication Review"], level: "department-head" },
      { name: "Scholar AI", role: "Researcher", zone: "operations", active: true, model: "claude", skills: ["Literature Review", "Hypothesis Generation", "Study Design"], level: "worker" },
      { name: "Data Crunch", role: "Data Analyst", zone: "operations", active: true, model: "gemini", skills: ["Statistical Analysis", "Data Visualization", "Pattern Recognition"], level: "worker" },
      { name: "Lab Intel", role: "Lab Analyst", zone: "clinical", active: true, model: "openai", skills: ["Lab Result Interpretation", "Quality Control", "Protocol Compliance"], level: "worker" },
    ],
  },
  {
    id: "tpl-it",
    name: "IT & Security",
    icon: "settings",
    description: "CIO, security analyst, system admin, and compliance officer agents for infrastructure.",
    agents: [
      { name: "Sys Architect", role: "Chief Information Officer", zone: "operations", active: true, model: "claude", skills: ["Infrastructure Planning", "Vendor Management", "Tech Roadmap"], level: "department-head" },
      { name: "Sentinel", role: "Security Analyst", zone: "operations", active: true, model: "openai", skills: ["Threat Detection", "Vulnerability Assessment", "Incident Response"], level: "worker" },
      { name: "Ops Runner", role: "System Administrator", zone: "operations", active: true, model: "gemini", skills: ["Server Management", "Deployment Automation", "Monitoring"], level: "worker" },
      { name: "Compliance Guard", role: "Compliance Officer", zone: "operations", active: true, model: "claude", skills: ["HIPAA Compliance", "Audit Preparation", "Policy Enforcement"], level: "worker" },
    ],
  },
  {
    id: "tpl-dev",
    name: "Development & Integration",
    icon: "code",
    description: "Notion specialist, Airtable specialist, coding specialist, and application specialist for platform development.",
    agents: [
      { name: "Dev Lead", role: "Development Director", zone: "operations", active: true, model: "claude", skills: ["Architecture Planning", "Code Review", "Technical Strategy"], level: "department-head" },
      { name: "Notion Architect", role: "Notion Development Specialist", zone: "operations", active: true, model: "claude", skills: ["Database Architecture", "Notion API", "Template Design", "Automation Workflows"], level: "worker" },
      { name: "Airtable Builder", role: "Airtable Development Specialist", zone: "operations", active: true, model: "claude", skills: ["Base Architecture", "Scripting & Extensions", "Interface Designer", "API Integration"], level: "worker" },
      { name: "Code Engine", role: "Coding Specialist", zone: "operations", active: true, model: "claude", skills: ["Full-Stack Development", "API Development", "Testing & QA", "DevOps"], level: "worker" },
      { name: "App Strategist", role: "Application Specialist", zone: "operations", active: true, model: "claude", skills: ["Requirements Analysis", "Application Architecture", "MVP Strategy", "Deployment Management"], level: "worker" },
    ],
  },
  {
    id: "tpl-clawbots",
    name: "Clawbots",
    icon: "linkedin",
    description: "LinkedIn Clawbot and Google Search Clawbot for autonomous client prospecting and lead generation.",
    agents: [
      { name: "Clawbot Commander", role: "Lead Generation Director", zone: "external", active: true, model: "claude", skills: ["Prospect Strategy", "Pipeline Management", "Lead Scoring"], level: "department-head" },
      { name: "LinkedIn Clawbot", role: "LinkedIn Client Clawbot", zone: "external", active: true, model: "claude", skills: ["ICP Targeting", "Connection Personalization", "Messaging Sequences", "Thought Leadership"], level: "worker" },
      { name: "Google Search Clawbot", role: "Google Client Search Clawbot", zone: "external", active: true, model: "gemini", skills: ["Advanced Search Queries", "Company Intelligence", "Intent Signal Detection", "Lead Scoring"], level: "worker" },
      { name: "Book Research Bot", role: "Book Read & Research Specialist", zone: "external", active: true, model: "claude", skills: ["Book Summarization", "Key Insight Extraction", "Curated Reading Lists", "Thematic Synthesis"], level: "worker" },
      { name: "Video Producer Bot", role: "Instructional Video Maker", zone: "external", active: true, model: "openai", skills: ["Script Writing", "Storyboard Development", "Course Curriculum", "Production Planning"], level: "worker" },
    ],
  },
  {
    id: "tpl-intelligence",
    name: "Intelligence & Analytics",
    icon: "sparkles",
    description: "Self-improving agent optimizer and analytics hub for continuous platform evolution and data-driven insights.",
    agents: [
      { name: "Intelligence Prime", role: "Chief Intelligence Officer", zone: "operations", active: true, model: "claude", skills: ["Performance Strategy", "Optimization Planning", "Quality Governance"], level: "department-head" },
      { name: "Self-Improve Engine", role: "Self-Improving Agent", zone: "operations", active: true, model: "claude", skills: ["Agent Monitoring", "Prompt Optimization", "A/B Testing", "Regression Detection"], level: "worker" },
      { name: "Analytics Hub", role: "Analytics & Data Specialist", zone: "operations", active: true, model: "claude", skills: ["Dashboard Development", "Predictive Analytics", "KPI Tracking", "Anomaly Detection"], level: "worker" },
      { name: "Home Health Researcher", role: "Home Healthcare & Hospice Researcher", zone: "clinical", active: true, model: "claude", skills: ["CMS Regulatory Research", "OASIS Guidance", "Quality Measures", "Accreditation Prep"], level: "worker" },
    ],
  },
];

// ── Initial Access ──────────────────────────────────────────────────────────

const INITIAL_ACCESS: DepartmentAccess[] = [
  { departmentName: "Executive", accessLevel: "admin-only" },
  { departmentName: "Clinical Operations", accessLevel: "department-only" },
  { departmentName: "Marketing & Growth", accessLevel: "all-staff" },
  { departmentName: "Finance & Accounting", accessLevel: "admin-only" },
  { departmentName: "Human Resources", accessLevel: "department-only" },
  { departmentName: "Research & Development", accessLevel: "all-staff" },
  { departmentName: "IT & Security", accessLevel: "admin-only" },
  { departmentName: "Development & Integration", accessLevel: "department-only" },
  { departmentName: "Clawbots", accessLevel: "department-only" },
  { departmentName: "Intelligence & Analytics", accessLevel: "admin-only" },
];

// ── Helper Functions ────────────────────────────────────────────────────────

function getDeptIcon(iconKey: string) {
  switch (iconKey) {
    case "crown": return <Crown className="h-5 w-5" />;
    case "shield": return <Shield className="h-5 w-5" />;
    case "zap": return <Zap className="h-5 w-5" />;
    case "brain": return <Brain className="h-5 w-5" />;
    case "users": return <Users className="h-5 w-5" />;
    case "git-branch": return <GitBranch className="h-5 w-5" />;
    case "settings": return <Settings className="h-5 w-5" />;
    case "code": return <Code className="h-5 w-5" />;
    case "linkedin": return <Linkedin className="h-5 w-5" />;
    case "sparkles": return <Sparkles className="h-5 w-5" />;
    default: return <Building2 className="h-5 w-5" />;
  }
}

function getModelLabel(modelId: string): string {
  return MODEL_OPTIONS.find((m) => m.id === modelId)?.label ?? modelId;
}

function getModelColor(modelId: string): string {
  return MODEL_OPTIONS.find((m) => m.id === modelId)?.color ?? "text-gray-400";
}

function generateId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

function loadDeptAccess(): DepartmentAccess[] {
  try {
    const raw = localStorage.getItem(DEPT_ACCESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return INITIAL_ACCESS;
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

const AgentOrgChart = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { agents: allAgents, addAgent: addAgentToContext, updateAgent, deleteAgent: deleteAgentFromContext } = useAgents();

  // Org chart shows only agents with a department assigned (and not archived)
  const agents = allAgents.filter((a) => a.department && !a.archived);

  // ── State ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"org-chart" | "templates" | "access-control">("org-chart");
  const [departmentAccess, setDepartmentAccess] = useState<DepartmentAccess[]>(loadDeptAccess);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [zoom, setZoom] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<MyAgent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [moveAgentId, setMoveAgentId] = useState<string | null>(null);
  const [dragAgentId, setDragAgentId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set([
    "Executive", "Clinical Operations", "Marketing & Growth",
    "Finance & Accounting", "Human Resources", "Research & Development", "IT & Security",
    "Development & Integration", "Clawbots", "Intelligence & Analytics",
  ]));

  // Detail dialog editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // New agent form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newZone, setNewZone] = useState<AgentZone>("operations");
  const [newModel, setNewModel] = useState("openai");
  const [newSkills, setNewSkills] = useState("");
  const [newDepartment, setNewDepartment] = useState("Clinical Operations");
  const [newLevel, setNewLevel] = useState<"department-head" | "worker">("worker");

  // Persist department access to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DEPT_ACCESS_KEY, JSON.stringify(departmentAccess));
    } catch { /* ignore */ }
  }, [departmentAccess]);

  // ── Derived Data ────────────────────────────────────────────────────────

  const departments = Array.from(new Set(agents.map((a) => a.department)));

  const filteredAgents = searchQuery.trim()
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  const getAgentsByDept = (dept: string) => filteredAgents.filter((a) => a.department === dept);
  const getDeptHead = (dept: string) => agents.find((a) => a.department === dept && a.level === "department-head");
  const getDeptWorkers = (dept: string) => filteredAgents.filter((a) => a.department === dept && a.level === "worker");
  const getCeo = () => agents.find((a) => a.level === "ceo");

  // ── Handlers ────────────────────────────────────────────────────────────

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const openAgentDetail = (agent: MyAgent) => {
    setSelectedAgent(agent);
    setDetailOpen(true);
    setIsEditing(false);
    setConfirmRemoveId(null);
  };

  const startEditing = (agent: MyAgent) => {
    setEditName(agent.name);
    setEditRole(agent.role);
    setEditModel(agent.model);
    setEditSkills(agent.skills.join(", "));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedAgent || !editName.trim() || !editRole.trim()) {
      toast({ title: "Missing Fields", description: "Name and role are required." });
      return;
    }
    updateAgent(selectedAgent.id, {
      name: editName.trim(),
      role: editRole.trim(),
      model: editModel,
      skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSelectedAgent({
      ...selectedAgent,
      name: editName.trim(),
      role: editRole.trim(),
      model: editModel,
      skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
    toast({ title: "Agent Updated", description: `${editName.trim()} has been updated.` });
  };

  const removeAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    if (agent.level === "ceo") {
      toast({ title: "Cannot remove CEO", description: "The top-level agent cannot be removed." });
      return;
    }
    deleteAgentFromContext(agentId);
    setDetailOpen(false);
    setSelectedAgent(null);
    setConfirmRemoveId(null);
    toast({ title: "Agent Removed", description: `${agent.name} has been removed from the org chart.` });
  };

  const startMoveAgent = (agentId: string) => {
    setMoveAgentId(agentId);
    setDetailOpen(false);
    toast({ title: "Move Mode", description: "Click on a department head or the CEO to reassign this agent." });
  };

  const completeMove = (targetDept: string, targetParentId: string) => {
    if (!moveAgentId) return;
    const agent = agents.find((a) => a.id === moveAgentId);
    if (!agent) return;
    updateAgent(moveAgentId, { department: targetDept, parentId: targetParentId });
    toast({ title: "Agent Moved", description: `${agent.name} reassigned to ${targetDept}.` });
    setMoveAgentId(null);
  };

  const cancelMove = () => {
    setMoveAgentId(null);
  };

  // ── Drag & Drop Handlers ────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent || agent.level === "ceo") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", agentId);
    setDragAgentId(agentId);
  };

  const handleDragEnd = () => {
    setDragAgentId(null);
    setDropTargetId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (!dragAgentId || dragAgentId === targetId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetId(targetId);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDropOnAgent = (e: React.DragEvent, targetAgent: MyAgent) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData("text/plain");
    if (!dragId || dragId === targetAgent.id) return;
    const dragged = agents.find((a) => a.id === dragId);
    if (!dragged) return;

    if (targetAgent.level === "ceo") {
      // Dropping onto CEO promotes to department-head of dragged agent's current department
      updateAgent(dragId, { parentId: targetAgent.id, level: "department-head" });
      toast({ title: "Agent Moved", description: `${dragged.name} promoted to department head under ${targetAgent.name}.` });
    } else if (targetAgent.level === "department-head") {
      // Dropping onto a department head reassigns to that department
      updateAgent(dragId, { department: targetAgent.department, parentId: targetAgent.id, level: "worker" });
      toast({ title: "Agent Moved", description: `${dragged.name} reassigned to ${targetAgent.department}.` });
    }

    setDragAgentId(null);
    setDropTargetId(null);
  };

  const handleDropOnDepartment = (e: React.DragEvent, deptName: string) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData("text/plain");
    if (!dragId) return;
    const dragged = agents.find((a) => a.id === dragId);
    if (!dragged || dragged.department === deptName) return;
    const deptHead = getDeptHead(deptName);
    const parentId = deptHead?.id ?? getCeo()?.id ?? null;
    updateAgent(dragId, { department: deptName, parentId, level: "worker" });
    toast({ title: "Agent Moved", description: `${dragged.name} reassigned to ${deptName}.` });
    setDragAgentId(null);
    setDropTargetId(null);

    // Auto-expand the target department
    setExpandedDepts((prev) => new Set([...prev, deptName]));
  };

  const handleAddAgent = () => {
    if (!newName.trim() || !newRole.trim()) {
      toast({ title: "Missing Fields", description: "Name and role are required." });
      return;
    }
    const deptHead = getDeptHead(newDepartment);
    const parentId = newLevel === "department-head" ? (getCeo()?.id ?? null) : (deptHead?.id ?? null);
    const agent: MyAgent = {
      id: generateId(),
      name: newName.trim(),
      skills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
      model: newModel,
      active: true,
      capabilities: { ...DEFAULT_AGENT_CAPABILITIES },
      archived: false,
      taskCount: 0,
      zone: newZone,
      language: "en",
      tasksToday: 0,
      successRate: 100,
      costToday: 0,
      costMonth: 0,
      tokensUsed: 0,
      avgResponseTime: "—",
      role: newRole.trim(),
      department: newDepartment,
      level: newLevel,
      parentId,
    };
    addAgentToContext(agent);
    toast({ title: "Agent Created", description: `${agent.name} added to ${newDepartment}.` });
    setAddAgentOpen(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setNewName("");
    setNewRole("");
    setNewZone("operations");
    setNewModel("openai");
    setNewSkills("");
    setNewDepartment("Clinical Operations");
    setNewLevel("worker");
  };

  const applyTemplate = (template: DepartmentTemplate) => {
    const deptName = template.name;
    const existingInDept = agents.filter((a) => a.department === deptName);
    if (existingInDept.length > 0) {
      toast({ title: "Department Exists", description: `${deptName} already has agents. Remove them first or add agents manually.` });
      return;
    }

    const ceo = getCeo();
    const ceoId = ceo?.id ?? null;
    let headId: string | null = null;
    let createdCount = 0;

    for (const tplAgent of template.agents) {
      const id = generateId();
      let parentId: string | null;
      if (tplAgent.level === "department-head") {
        parentId = ceoId;
        headId = id;
      } else {
        parentId = headId;
      }
      const newAgent: MyAgent = {
        id,
        name: tplAgent.name,
        skills: [...tplAgent.skills],
        model: tplAgent.model,
        active: tplAgent.active,
        capabilities: { ...DEFAULT_AGENT_CAPABILITIES },
        archived: false,
        taskCount: 0,
        zone: tplAgent.zone,
        language: "en",
        tasksToday: 0,
        successRate: 100,
        costToday: 0,
        costMonth: 0,
        tokensUsed: 0,
        avgResponseTime: "—",
        role: tplAgent.role,
        department: deptName,
        level: tplAgent.level,
        parentId,
      };
      addAgentToContext(newAgent);
      createdCount++;
    }

    // Ensure department access entry exists
    if (!departmentAccess.find((d) => d.departmentName === deptName)) {
      setDepartmentAccess((prev) => [...prev, { departmentName: deptName, accessLevel: "all-staff" }]);
    }

    // Expand the new department
    setExpandedDepts((prev) => new Set([...prev, deptName]));

    toast({
      title: "Template Applied",
      description: `${createdCount} agents created in ${deptName}. All agents are active and ready.`,
    });
  };

  const updateAccess = (deptName: string, level: AccessLevel) => {
    setDepartmentAccess((prev) =>
      prev.map((d) => (d.departmentName === deptName ? { ...d, accessLevel: level } : d))
    );
    toast({ title: "Access Updated", description: `${deptName} set to ${level.replace("-", " ")}.` });
  };

  const toggleAgentStatus = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      updateAgent(agentId, { active: !agent.active });
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 60));
  const resetZoom = () => setZoom(100);

  const expandAll = () => setExpandedDepts(new Set(departments));
  const collapseAll = () => setExpandedDepts(new Set());

  const bulkToggleDept = (deptName: string, activate: boolean) => {
    const deptAgents = agents.filter((a) => a.department === deptName);
    deptAgents.forEach((a) => updateAgent(a.id, { active: activate }));
    toast({
      title: activate ? "Department Activated" : "Department Deactivated",
      description: `${deptAgents.length} agent${deptAgents.length !== 1 ? "s" : ""} in ${deptName} ${activate ? "activated" : "deactivated"}.`,
    });
  };

  const exportOrgChart = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalAgents: agents.length,
      departments: departments.map((dept) => ({
        name: dept,
        agents: agents.filter((a) => a.department === dept).map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          level: a.level,
          zone: a.zone,
          model: a.model,
          active: a.active,
          skills: a.skills,
          successRate: a.successRate,
          costMonth: a.costMonth,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dr-claw-org-chart-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Org chart data exported as JSON." });
  };

  // ── Sub-Components ──────────────────────────────────────────────────────

  const AccessBadge = ({ level }: { level: AccessLevel }) => {
    const config: Record<AccessLevel, { label: string; color: string }> = {
      "all-staff": { label: "All Staff", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      "department-only": { label: "Dept Only", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
      "admin-only": { label: "Admin Only", color: "bg-red-500/15 text-red-400 border-red-500/30" },
    };
    const c = config[level];
    return <Badge variant="outline" className={c.color}>{c.label}</Badge>;
  };

  // ── Agent Node ──────────────────────────────────────────────────────────

  const AgentNode = ({ agent, indentLevel = 0 }: { agent: MyAgent; indentLevel?: number }) => {
    const zs = ZONE_STYLES[agent.zone];
    const isMoving = moveAgentId === agent.id;
    const isMoveTarget = moveAgentId !== null && moveAgentId !== agent.id && (agent.level === "department-head" || agent.level === "ceo");
    const isDragging = dragAgentId === agent.id;
    const isDropTarget = dropTargetId === agent.id && dragAgentId !== agent.id && (agent.level === "department-head" || agent.level === "ceo");
    const isDraggable = agent.level !== "ceo";

    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, agent.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          if (agent.level === "department-head" || agent.level === "ceo") {
            handleDragOver(e, agent.id);
          }
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          if (agent.level === "department-head" || agent.level === "ceo") {
            handleDropOnAgent(e, agent);
          }
        }}
        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group
          ${isMoving || isDragging ? "ring-2 ring-violet-500 opacity-60" : ""}
          ${isMoveTarget || isDropTarget ? "ring-2 ring-emerald-500 bg-emerald-500/10 scale-[1.02]" : ""}
          ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
          bg-gradient-to-r ${zs.gradient} ${zs.border} hover:border-opacity-70
          hover:shadow-lg hover:shadow-black/20`}
        style={{ marginLeft: `${indentLevel * 28}px` }}
        onClick={() => {
          if (isMoveTarget && moveAgentId) {
            completeMove(agent.department, agent.id);
          } else if (!moveAgentId && !dragAgentId) {
            openAgentDetail(agent);
          }
        }}
      >
        {/* Connecting line indicator */}
        {indentLevel > 0 && (
          <div className={`absolute -left-4 top-1/2 w-4 h-px border-t ${zs.line}`} />
        )}

        {/* Status ping dot */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg ${zs.bg} flex items-center justify-center`}>
            {agent.level === "ceo" ? (
              <Crown className={`h-5 w-5 ${zs.text}`} />
            ) : agent.level === "department-head" ? (
              <Building2 className={`h-5 w-5 ${zs.text}`} />
            ) : (
              <Bot className={`h-5 w-5 ${zs.text}`} />
            )}
          </div>
          {agent.active && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${zs.dot} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${zs.dot}`} />
            </span>
          )}
          {!agent.active && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
            {agent.level === "ceo" && (
              <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                CEO
              </Badge>
            )}
            {agent.level === "department-head" && (
              <Badge variant="outline" className="bg-violet-500/15 text-violet-400 border-violet-500/30 text-[10px] px-1.5 py-0">
                HEAD
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={`${ZONE_STYLES[agent.zone].text} ${ZONE_STYLES[agent.zone].bg} border-0 text-[10px] px-1.5 py-0`}>
            {ZONE_LABELS[agent.zone]}
          </Badge>
          <span className={`text-[10px] ${getModelColor(agent.model)}`}>
            {getModelLabel(agent.model).split(" ").pop()}
          </span>
        </div>

        {/* Move target indicator */}
        {isMoveTarget && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-emerald-500/5 pointer-events-none">
            <ArrowRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  // ── Department Section (Tree View) ────────────────────────────────────

  const DepartmentSection = ({ deptName }: { deptName: string }) => {
    const deptAgents = getAgentsByDept(deptName);
    const head = deptAgents.find((a) => a.level === "department-head");
    const workers = deptAgents.filter((a) => a.level === "worker");
    const isExpanded = expandedDepts.has(deptName);
    const iconKey = DEPARTMENT_ICONS[deptName] ?? "building";
    const accessEntry = departmentAccess.find((d) => d.departmentName === deptName);
    const isRestricted = accessEntry?.accessLevel === "admin-only";
    const isDeptDropTarget = dropTargetId === `dept-${deptName}` && dragAgentId !== null;

    if (deptName === "Executive") return null; // CEO rendered separately

    return (
      <div
        className={`relative transition-all duration-200 ${isDeptDropTarget ? "ring-2 ring-emerald-500/60 rounded-xl bg-emerald-500/5 p-2 -m-2" : ""}`}
        onDragOver={(e) => {
          if (dragAgentId) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDropTargetId(`dept-${deptName}`);
          }
        }}
        onDragLeave={(e) => {
          // Only clear if leaving the department container entirely
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDropTargetId(null);
          }
        }}
        onDrop={(e) => handleDropOnDepartment(e, deptName)}
      >
        {/* Vertical connecting line from top */}
        <div className="absolute -top-4 left-5 w-px h-4 border-l border-border/50" />

        <button
          onClick={() => toggleDept(deptName)}
          className="flex items-center gap-3 w-full text-left mb-2 group"
        >
          <div className="flex items-center gap-2 flex-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
            )}
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              {getDeptIcon(iconKey)}
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {deptName}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
              {deptAgents.length}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-400">
              {deptAgents.filter((a) => a.active).length} active
            </Badge>
            {isRestricted && <Lock className="h-3.5 w-3.5 text-red-400/70" />}
            {/* Bulk toggle buttons */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); bulkToggleDept(deptName, true); }}
                className="p-1 rounded hover:bg-emerald-500/10 text-emerald-400"
                title="Activate all agents"
              >
                <Power className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); bulkToggleDept(deptName, false); }}
                className="p-1 rounded hover:bg-red-500/10 text-red-400"
                title="Deactivate all agents"
              >
                <PowerOff className="h-3 w-3" />
              </button>
            </span>
            {isDeptDropTarget && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] animate-pulse">
                Drop here
              </Badge>
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="pl-4 space-y-2 relative">
            {/* Vertical line connecting children */}
            {(workers.length > 0 || head) && (
              <div className="absolute left-[21px] top-0 bottom-2 w-px border-l border-border/40" />
            )}

            {head && (
              <div className="relative">
                <div className="absolute -left-[7px] top-1/2 w-3 h-px border-t border-border/40" />
                <AgentNode agent={head} indentLevel={0} />
              </div>
            )}

            {workers.length > 0 && (
              <div className="pl-6 space-y-2 relative">
                {/* Vertical line for worker level */}
                <div className="absolute left-[21px] top-0 bottom-2 w-px border-l border-border/30" />
                {workers.map((worker) => (
                  <div key={worker.id} className="relative">
                    <div className="absolute -left-[7px] top-1/2 w-3 h-px border-t border-border/30" />
                    <AgentNode agent={worker} indentLevel={0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── List View Row ─────────────────────────────────────────────────────

  const ListRow = ({ agent }: { agent: MyAgent }) => {
    const zs = ZONE_STYLES[agent.zone];
    const isDraggable = agent.level !== "ceo";
    const isDragging = dragAgentId === agent.id;
    const isDropTarget = dropTargetId === agent.id && dragAgentId !== agent.id && (agent.level === "department-head" || agent.level === "ceo");
    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, agent.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          if (agent.level === "department-head" || agent.level === "ceo") {
            handleDragOver(e, agent.id);
          }
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          if (agent.level === "department-head" || agent.level === "ceo") {
            handleDropOnAgent(e, agent);
          }
        }}
        className={`flex items-center gap-4 p-3 rounded-lg border ${zs.border} bg-card/30 hover:bg-card/50 transition-all
          ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
          ${isDragging ? "opacity-50 ring-2 ring-violet-500" : ""}
          ${isDropTarget ? "ring-2 ring-emerald-500 bg-emerald-500/10 scale-[1.01]" : ""}`}
        onClick={() => {
          if (!dragAgentId) openAgentDetail(agent);
        }}
      >
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg ${zs.bg} flex items-center justify-center`}>
            <Bot className={`h-4 w-4 ${zs.text}`} />
          </div>
          {agent.active && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${zs.dot} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${zs.dot}`} />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{agent.name}</span>
          <span className="text-xs text-muted-foreground ml-2">{agent.role}</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">{agent.department}</span>
        <Badge variant="outline" className={`${zs.text} ${zs.bg} border-0 text-[10px]`}>
          {ZONE_LABELS[agent.zone]}
        </Badge>
        <span className={`text-[10px] ${getModelColor(agent.model)} hidden md:block`}>
          {getModelLabel(agent.model)}
        </span>
        <div className={`w-2 h-2 rounded-full ${agent.active ? zs.dot : "bg-gray-500"}`} />
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
                <Network className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
                  Agent Org Chart
                </h1>
                <p className="text-muted-foreground text-sm">
                  Visualize, manage, and configure your AI agent hierarchy across all departments.
                </p>
              </div>
            </div>
          </div>

          {/* ── Stats Strip ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Agents", value: agents.length, icon: Bot, color: "text-violet-400" },
              { label: "Departments", value: departments.length, icon: Building2, color: "text-blue-400" },
              { label: "Active", value: agents.filter((a) => a.active).length, icon: Zap, color: "text-emerald-400" },
              { label: "Inactive", value: agents.filter((a) => !a.active).length, icon: EyeOff, color: "text-gray-400" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 mb-8 bg-card/50 border border-border rounded-xl p-1 w-fit">
            {([
              { key: "org-chart" as const, label: "Org Chart", icon: Network },
              { key: "templates" as const, label: "Templates", icon: Download },
              { key: "access-control" as const, label: "Access Control", icon: Shield },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1 — ORG CHART
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "org-chart" && (
            <div>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents, roles, departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card/50 border-border"
                  />
                </div>

                <div className="flex items-center gap-1 bg-card/50 border border-border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "tree"
                        ? "gradient-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "list"
                        ? "gradient-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-card/50 border border-border rounded-lg p-1">
                  <button onClick={zoomOut} className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground px-2 min-w-[40px] text-center">{zoom}%</span>
                  <button onClick={zoomIn} className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button onClick={resetZoom} className="p-2 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-card/50 border border-border rounded-lg p-1">
                  <button
                    onClick={expandAll}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Expand All"
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={collapseAll}
                    className="p-2 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Collapse All"
                  >
                    Collapse
                  </button>
                </div>

                <Button
                  onClick={exportOrgChart}
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:text-foreground"
                  title="Export org chart as JSON"
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Button
                  onClick={() => setAddAgentOpen(true)}
                  className="gradient-primary text-primary-foreground shadow-glow-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Agent
                </Button>

                {moveAgentId && (
                  <Button onClick={cancelMove} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <X className="h-4 w-4 mr-1" />
                    Cancel Move
                  </Button>
                )}
              </div>

              {/* Move mode banner */}
              {moveAgentId && (
                <div className="mb-4 p-3 rounded-xl border border-violet-500/30 bg-violet-500/5 flex items-center gap-3">
                  <ArrowRight className="h-5 w-5 text-violet-400" />
                  <div>
                    <span className="text-sm font-medium text-violet-300">Move Mode Active</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Click on a department head or the CEO to reassign{" "}
                      <strong className="text-foreground">
                        {agents.find((a) => a.id === moveAgentId)?.name}
                      </strong>
                      .
                    </span>
                  </div>
                </div>
              )}

              {/* Drag hint banner */}
              {dragAgentId && (
                <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3 animate-pulse">
                  <ArrowRight className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="text-sm font-medium text-emerald-300">Dragging Agent</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Drop onto a department head, CEO, or department section to reassign{" "}
                      <strong className="text-foreground">
                        {agents.find((a) => a.id === dragAgentId)?.name}
                      </strong>
                      .
                    </span>
                  </div>
                </div>
              )}

              {/* Chart Area */}
              <div
                className="glass-card rounded-2xl border border-border p-6 overflow-auto"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
              >
                {agents.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                      <Network className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Agents in Org Chart</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                      Your organization chart is empty. Add agents manually or use the Templates tab to deploy pre-configured departments with agents.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setAddAgentOpen(true)}
                        className="gradient-primary text-primary-foreground shadow-glow-sm"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Agent
                      </Button>
                      <Button
                        onClick={() => setActiveTab("templates")}
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground"
                      >
                        <Download className="h-4 w-4 mr-1" /> Browse Templates
                      </Button>
                    </div>
                  </div>
                ) : viewMode === "tree" ? (
                  <div className="space-y-6">
                    {/* CEO */}
                    {(() => {
                      const ceo = getCeo();
                      if (!ceo) return (
                        <div className="max-w-lg mx-auto mb-2 p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-center">
                          <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                          <p className="text-sm text-amber-400 font-medium">No CEO Agent</p>
                          <p className="text-xs text-muted-foreground mt-1">Assign a CEO-level agent to anchor the org chart hierarchy.</p>
                        </div>
                      );
                      return (
                        <div className="max-w-lg mx-auto mb-2">
                          <AgentNode agent={ceo} />
                        </div>
                      );
                    })()}

                    {/* Connector from CEO */}
                    {getCeo() && (
                      <div className="flex justify-center">
                        <div className="w-px h-6 border-l-2 border-dashed border-border/50" />
                      </div>
                    )}

                    {/* Department Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {departments
                        .filter((d) => d !== "Executive")
                        .map((dept) => (
                          <div key={dept} className="glass-card rounded-xl border border-border/50 p-4 card-hover">
                            <DepartmentSection deptName={dept} />
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-2">
                    {departments.map((dept) => {
                      const deptAgentsFiltered = getAgentsByDept(dept);
                      if (deptAgentsFiltered.length === 0 && searchQuery) return null;
                      return (
                        <div key={dept}>
                          <button
                            onClick={() => toggleDept(dept)}
                            className="flex items-center gap-2 mb-2 group"
                          >
                            {expandedDepts.has(dept) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {dept}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                              {deptAgentsFiltered.length}
                            </Badge>
                          </button>
                          {expandedDepts.has(dept) && (
                            <div className="space-y-1.5 ml-6 mb-4">
                              {deptAgentsFiltered.map((agent) => (
                                <ListRow key={agent.id} agent={agent} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Zone Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="font-medium">Zones:</span>
                {(["clinical", "operations", "external"] as AgentZone[]).map((zone) => (
                  <div key={zone} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${ZONE_STYLES[zone].dot}`} />
                    <span className={ZONE_STYLES[zone].text}>{ZONE_LABELS[zone]}</span>
                  </div>
                ))}
                <span className="mx-2">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                  </span>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500" />
                  <span>Inactive</span>
                </div>
                <span className="mx-2">|</span>
                <span className="text-muted-foreground/60 italic">Drag agents to reorganize</span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2 — TEMPLATES
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "templates" && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">Department Templates</h2>
                <p className="text-sm text-muted-foreground">
                  Select a pre-built template to instantly populate a department with configured agents. All agents will be created with proper zones, skills, and models.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {DEPARTMENT_TEMPLATES.map((template) => {
                  const existsAlready = agents.some((a) => a.department === template.name);
                  const headAgent = template.agents.find((a) => a.level === "department-head");
                  const workerAgents = template.agents.filter((a) => a.level === "worker");
                  const primaryZone = headAgent?.zone ?? "operations";
                  const zs = ZONE_STYLES[primaryZone];

                  return (
                    <div
                      key={template.id}
                      className={`glass-card rounded-xl border ${zs.border} p-5 card-hover transition-all duration-300`}
                    >
                      {/* Template Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${zs.bg} flex items-center justify-center`}>
                          {getDeptIcon(template.icon)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.agents.length} agents</p>
                        </div>
                        <Badge variant="outline" className={`${zs.text} ${zs.bg} border-0 text-[10px]`}>
                          {ZONE_LABELS[primaryZone]}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        {template.description}
                      </p>

                      {/* Agent Preview */}
                      <div className="space-y-2 mb-4">
                        {template.agents.map((agent, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${ZONE_STYLES[agent.zone].border} bg-card/30`}
                          >
                            <div className={`w-6 h-6 rounded-md ${ZONE_STYLES[agent.zone].bg} flex items-center justify-center`}>
                              {agent.level === "department-head" ? (
                                <Crown className={`h-3 w-3 ${ZONE_STYLES[agent.zone].text}`} />
                              ) : (
                                <Bot className={`h-3 w-3 ${ZONE_STYLES[agent.zone].text}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground">{agent.name}</span>
                              <span className="text-[10px] text-muted-foreground ml-1.5">{agent.role}</span>
                            </div>
                            <span className={`text-[10px] ${getModelColor(agent.model)}`}>
                              {getModelLabel(agent.model).split(" ").pop()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Skills Preview */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Array.from(new Set(template.agents.flatMap((a) => a.skills))).slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-[9px] px-1.5 py-0 border-border text-muted-foreground">
                            {skill}
                          </Badge>
                        ))}
                        {Array.from(new Set(template.agents.flatMap((a) => a.skills))).length > 5 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border text-muted-foreground">
                            +{Array.from(new Set(template.agents.flatMap((a) => a.skills))).length - 5} more
                          </Badge>
                        )}
                      </div>

                      {/* Apply Button */}
                      {existsAlready ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs text-emerald-400 font-medium">Department Active</span>
                          <Badge variant="outline" className="text-[10px] ml-auto border-emerald-500/30 text-emerald-400">
                            {agents.filter((a) => a.department === template.name).length} agents
                          </Badge>
                        </div>
                      ) : (
                        <Button
                          onClick={() => applyTemplate(template)}
                          className="w-full gradient-primary text-primary-foreground shadow-glow-sm"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Apply Template — Create {template.agents.length} Agents
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick-Start All */}
              <div className="mt-8 glass-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Quick-Start: Deploy All Templates</h3>
                    <p className="text-xs text-muted-foreground">
                      Create all departments at once with {DEPARTMENT_TEMPLATES.reduce((acc, t) => acc + t.agents.length, 0)} pre-configured agents.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    let totalCreated = 0;
                    DEPARTMENT_TEMPLATES.forEach((template) => {
                      const existsAlready = agents.some((a) => a.department === template.name);
                      if (!existsAlready) {
                        applyTemplate(template);
                        totalCreated += template.agents.length;
                      }
                    });
                    if (totalCreated === 0) {
                      toast({ title: "All Deployed", description: "All department templates are already active." });
                    }
                  }}
                  variant="outline"
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Deploy All Remaining Templates
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3 — ACCESS CONTROL
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "access-control" && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">Department Access Control</h2>
                <p className="text-sm text-muted-foreground">
                  Set per-department visibility levels to control who can view and manage each department's agents.
                </p>
              </div>

              {/* Access Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {(["all-staff", "department-only", "admin-only"] as AccessLevel[]).map((level) => {
                  const count = departmentAccess.filter((d) => d.accessLevel === level).length;
                  const config: Record<AccessLevel, { label: string; icon: typeof Eye; color: string; bg: string }> = {
                    "all-staff": { label: "All Staff", icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    "department-only": { label: "Department Only", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
                    "admin-only": { label: "Admin Only", icon: Lock, color: "text-red-400", bg: "bg-red-500/10" },
                  };
                  const c = config[level];
                  return (
                    <div key={level} className="glass-card rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                          <c.icon className={`h-4 w-4 ${c.color}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{c.label}</span>
                      </div>
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1">departments</span>
                    </div>
                  );
                })}
              </div>

              {/* Department List */}
              <div className="space-y-3">
                {departmentAccess.map((dept) => {
                  const deptAgents = agents.filter((a) => a.department === dept.departmentName);
                  const iconKey = DEPARTMENT_ICONS[dept.departmentName] ?? "building";
                  return (
                    <div
                      key={dept.departmentName}
                      className="glass-card rounded-xl border border-border p-5 card-hover"
                    >
                      <div className="flex items-center gap-4">
                        {/* Dept Info */}
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
                          {getDeptIcon(iconKey)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{dept.departmentName}</span>
                            {dept.accessLevel === "admin-only" && <Lock className="h-3.5 w-3.5 text-red-400" />}
                            {dept.accessLevel === "department-only" && <Shield className="h-3.5 w-3.5 text-amber-400" />}
                            {dept.accessLevel === "all-staff" && <Unlock className="h-3.5 w-3.5 text-emerald-400" />}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {deptAgents.length} agent{deptAgents.length !== 1 ? "s" : ""} &middot; {deptAgents.filter((a) => a.active).length} active
                          </span>
                        </div>

                        {/* Access Toggle */}
                        <div className="flex items-center gap-1 bg-card/50 border border-border rounded-lg p-1">
                          {(["all-staff", "department-only", "admin-only"] as AccessLevel[]).map((level) => {
                            const labels: Record<AccessLevel, string> = {
                              "all-staff": "All Staff",
                              "department-only": "Dept Only",
                              "admin-only": "Admin Only",
                            };
                            const isActive = dept.accessLevel === level;
                            const colors: Record<AccessLevel, string> = {
                              "all-staff": "bg-emerald-500/20 text-emerald-400",
                              "department-only": "bg-amber-500/20 text-amber-400",
                              "admin-only": "bg-red-500/20 text-red-400",
                            };
                            return (
                              <button
                                key={level}
                                onClick={() => updateAccess(dept.departmentName, level)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  isActive ? colors[level] : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {labels[level]}
                              </button>
                            );
                          })}
                        </div>

                        {/* Current badge */}
                        <AccessBadge level={dept.accessLevel} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Access Policy Note */}
              <div className="mt-6 p-4 rounded-xl border border-border/50 bg-card/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Access Control Policy</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span><strong className="text-emerald-400">All Staff</strong> — Every team member can view and interact with this department's agents.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-amber-400 flex-shrink-0" />
                        <span><strong className="text-amber-400">Department Only</strong> — Only members assigned to this department can view its agents.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="h-3 w-3 text-red-400 flex-shrink-0" />
                        <span><strong className="text-red-400">Admin Only</strong> — Only administrators and owners have access. Restricted from all other users.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Agent Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) { setIsEditing(false); setConfirmRemoveId(null); } }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {selectedAgent && (
                <>
                  <div className={`w-8 h-8 rounded-lg ${ZONE_STYLES[selectedAgent.zone].bg} flex items-center justify-center`}>
                    {selectedAgent.level === "ceo" ? (
                      <Crown className={`h-4 w-4 ${ZONE_STYLES[selectedAgent.zone].text}`} />
                    ) : (
                      <Bot className={`h-4 w-4 ${ZONE_STYLES[selectedAgent.zone].text}`} />
                    )}
                  </div>
                  {isEditing ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm bg-card/50 border-border max-w-[200px]"
                    />
                  ) : (
                    selectedAgent.name
                  )}
                  {!isEditing && selectedAgent.level !== "ceo" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(selectedAgent)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Tasks Today", value: selectedAgent.tasksToday, icon: Activity, color: "text-blue-400" },
                  { label: "Success Rate", value: `${selectedAgent.successRate}%`, icon: Target, color: "text-emerald-400" },
                  { label: "Cost Today", value: `$${selectedAgent.costToday.toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
                  { label: "Tokens", value: selectedAgent.tokensUsed > 0 ? `${(selectedAgent.tokensUsed / 1000).toFixed(0)}K` : "0", icon: BarChart3, color: "text-violet-400" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                    <metric.icon className={`h-3.5 w-3.5 ${metric.color} mx-auto mb-1`} />
                    <div className="text-sm font-bold text-foreground">{metric.value}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  {isEditing ? (
                    <Input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="mt-1 h-8 text-sm bg-card/50 border-border"
                    />
                  ) : (
                    <p className="text-sm text-foreground">{selectedAgent.role}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm text-foreground">{selectedAgent.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Zone</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${ZONE_STYLES[selectedAgent.zone].text} ${ZONE_STYLES[selectedAgent.zone].bg} border-0`}>
                      {ZONE_LABELS[selectedAgent.zone]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {MODEL_OPTIONS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setEditModel(model.id)}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-all border ${
                            editModel === model.id
                              ? `${model.color} bg-card border-border`
                              : "border-border/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {model.label.split(" ").pop()}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${getModelColor(selectedAgent.model)}`}>
                      {getModelLabel(selectedAgent.model)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedAgent.active ? ZONE_STYLES[selectedAgent.zone].dot : "bg-gray-500"}`} />
                    <span className={`text-sm ${selectedAgent.active ? "text-emerald-400" : "text-gray-400"}`}>
                      {selectedAgent.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <p className="text-sm text-foreground capitalize">{selectedAgent.level.replace("-", " ")}</p>
                </div>
              </div>

              {/* Extra metrics row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Avg Response</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedAgent.avgResponseTime}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cost/Month</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">${selectedAgent.costMonth.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Tasks</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedAgent.taskCount}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-xs text-muted-foreground">Skills</Label>
                {isEditing ? (
                  <Input
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="Comma-separated skills"
                    className="mt-1 h-8 text-sm bg-card/50 border-border"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAgent.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-[10px] border-border text-foreground">
                        {skill}
                      </Badge>
                    ))}
                    {selectedAgent.skills.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No skills assigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Removal Confirmation */}
              {confirmRemoveId === selectedAgent.id && (
                <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Confirm Removal</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Are you sure you want to remove <strong className="text-foreground">{selectedAgent.name}</strong> from the org chart? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => removeAgent(selectedAgent.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Yes, Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmRemoveId(null)}
                      className="border-border text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      className="gradient-primary text-primary-foreground shadow-glow-sm"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-border text-foreground"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleAgentStatus(selectedAgent.id);
                        setSelectedAgent({ ...selectedAgent, active: !selectedAgent.active });
                      }}
                      className="border-border text-foreground"
                    >
                      {selectedAgent.active ? (
                        <><PowerOff className="h-3.5 w-3.5 mr-1" /> Deactivate</>
                      ) : (
                        <><Power className="h-3.5 w-3.5 mr-1" /> Activate</>
                      )}
                    </Button>
                    {selectedAgent.level !== "ceo" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(selectedAgent)}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startMoveAgent(selectedAgent.id)}
                          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                        >
                          <ArrowRight className="h-3.5 w-3.5 mr-1" /> Move
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmRemoveId(selectedAgent.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={addAgentOpen} onOpenChange={(open) => { setAddAgentOpen(open); if (!open) resetAddForm(); }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5 text-primary" />
              Add New Agent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-xs text-muted-foreground">Agent Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Dr. Front Desk"
                className="mt-1 bg-card/50 border-border"
              />
            </div>

            {/* Role */}
            <div>
              <Label className="text-xs text-muted-foreground">Role / Title</Label>
              <Input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Clinical Coordinator"
                className="mt-1 bg-card/50 border-border"
              />
            </div>

            {/* Department */}
            <div>
              <Label className="text-xs text-muted-foreground">Department</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  "Clinical Operations", "Marketing & Growth", "Finance & Accounting",
                  "Human Resources", "Research & Development", "IT & Security",
                  "Development & Integration", "Clawbots", "Intelligence & Analytics",
                ].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setNewDepartment(dept)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      newDepartment === dept
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <Label className="text-xs text-muted-foreground">Level</Label>
              <div className="flex gap-2 mt-1">
                {([
                  { key: "department-head" as const, label: "Department Head", icon: Building2 },
                  { key: "worker" as const, label: "Worker", icon: Bot },
                ]).map((lvl) => (
                  <button
                    key={lvl.key}
                    onClick={() => setNewLevel(lvl.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 ${
                      newLevel === lvl.key
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <lvl.icon className="h-3.5 w-3.5" />
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone */}
            <div>
              <Label className="text-xs text-muted-foreground">Zone</Label>
              <div className="flex gap-2 mt-1">
                {(["clinical", "operations", "external"] as AgentZone[]).map((zone) => {
                  const zs = ZONE_STYLES[zone];
                  return (
                    <button
                      key={zone}
                      onClick={() => setNewZone(zone)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        newZone === zone
                          ? `${zs.bg} ${zs.text} ${zs.border}`
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ZONE_LABELS[zone]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model */}
            <div>
              <Label className="text-xs text-muted-foreground">Model</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {MODEL_OPTIONS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setNewModel(model.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      newModel === model.id
                        ? `${model.color} bg-card border-border`
                        : "border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-xs text-muted-foreground">Skills (comma-separated)</Label>
              <Input
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="e.g. Scheduling, Insurance, Triage"
                className="mt-1 bg-card/50 border-border"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleAddAgent}
              className="w-full gradient-primary text-primary-foreground shadow-glow-sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentOrgChart;
