import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  FileText,
  Upload,
  Search,
  Bot,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Plus,
  Eye,
  Lock,
  File,
  Image,
  FileSpreadsheet,
  Trash2,
  Download,
  Clock,
  HardDrive,
  Users,
  Filter,
  FolderOpen,
  CheckCircle2,
  XCircle,
  BarChart3,
  Database,
  Music,
  Video,
  Play,
  Pause,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type DocFileType =
  | "PDF" | "PNG" | "JPG" | "DOCX" | "CSV" | "XLSX"
  | "MP3" | "WAV" | "M4A" | "OGG"
  | "MP4" | "MOV" | "WEBM";

type MediaCategory = "all" | "documents" | "images" | "audio" | "video";

const MEDIA_CATEGORIES: { key: MediaCategory; label: string; types: DocFileType[] }[] = [
  { key: "all", label: "All", types: [] },
  { key: "documents", label: "Documents", types: ["PDF", "DOCX", "CSV", "XLSX"] },
  { key: "images", label: "Images", types: ["PNG", "JPG"] },
  { key: "audio", label: "Audio", types: ["MP3", "WAV", "M4A", "OGG"] },
  { key: "video", label: "Video", types: ["MP4", "MOV", "WEBM"] },
];

type Sensitivity = "General" | "PHI" | "HIPAA Regulated" | "BAA Required" | "Sensitive";

type AgentZone = "clinical" | "operations" | "external";

interface AgentRecord {
  id: string;
  name: string;
  role: string;
  zone: AgentZone;
  avatar: string;
}

interface DataDocument {
  id: string;
  name: string;
  fileType: DocFileType;
  fileSizeBytes: number;
  uploadDate: string;
  description: string;
  sensitivity: Sensitivity;
  assignedAgentIds: string[];
  /** Duration in seconds — only applicable for audio/video files */
  durationSec?: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG: Record<DocFileType, { icon: typeof FileText; color: string; bg: string }> = {
  PDF: { icon: FileText, color: "text-red-400", bg: "bg-red-500/10" },
  PNG: { icon: Image, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  JPG: { icon: Image, color: "text-teal-400", bg: "bg-teal-500/10" },
  DOCX: { icon: File, color: "text-blue-400", bg: "bg-blue-500/10" },
  CSV: { icon: FileSpreadsheet, color: "text-orange-400", bg: "bg-orange-500/10" },
  XLSX: { icon: FileSpreadsheet, color: "text-green-400", bg: "bg-green-500/10" },
  // Audio
  MP3: { icon: Music, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  WAV: { icon: Music, color: "text-pink-400", bg: "bg-pink-500/10" },
  M4A: { icon: Music, color: "text-rose-400", bg: "bg-rose-500/10" },
  OGG: { icon: Music, color: "text-purple-400", bg: "bg-purple-500/10" },
  // Video
  MP4: { icon: Video, color: "text-sky-400", bg: "bg-sky-500/10" },
  MOV: { icon: Video, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  WEBM: { icon: Video, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

const SENSITIVITY_CONFIG: Record<Sensitivity, { color: string; bg: string; border: string; icon: typeof Shield }> = {
  General: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Shield },
  PHI: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: ShieldAlert },
  "HIPAA Regulated": { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: Lock },
  "BAA Required": { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: Shield },
  Sensitive: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle },
};

const ZONE_CONFIG: Record<AgentZone, { label: string; color: string; dotColor: string }> = {
  clinical: { label: "Clinical (Zone 1)", color: "text-red-400", dotColor: "bg-red-400" },
  operations: { label: "Operations (Zone 2)", color: "text-amber-400", dotColor: "bg-amber-400" },
  external: { label: "External (Zone 3)", color: "text-blue-400", dotColor: "bg-blue-400" },
};

const ACCEPTED_TYPES: DocFileType[] = [
  "PDF", "PNG", "JPG", "DOCX", "CSV", "XLSX",
  "MP3", "WAV", "M4A", "OGG",
  "MP4", "MOV", "WEBM",
];

const AUDIO_TYPES: DocFileType[] = ["MP3", "WAV", "M4A", "OGG"];
const VIDEO_TYPES: DocFileType[] = ["MP4", "MOV", "WEBM"];

const isAudioType = (ft: DocFileType): boolean => AUDIO_TYPES.includes(ft);
const isVideoType = (ft: DocFileType): boolean => VIDEO_TYPES.includes(ft);
const isMediaType = (ft: DocFileType): boolean => isAudioType(ft) || isVideoType(ft);

// ── Mock Agents ────────────────────────────────────────────────────────────────

const mockAgents: AgentRecord[] = [
  { id: "agent-1", name: "Dr. Front Desk", role: "Patient Scheduling & Intake", zone: "clinical", avatar: "FD" },
  { id: "agent-2", name: "Clinical Assistant", role: "Clinical Decision Support", zone: "clinical", avatar: "CA" },
  { id: "agent-3", name: "Compliance Officer", role: "HIPAA & Regulatory", zone: "clinical", avatar: "CO" },
  { id: "agent-4", name: "Billing Navigator", role: "Insurance & Billing", zone: "operations", avatar: "BN" },
  { id: "agent-5", name: "Marketing Maven", role: "Marketing & Outreach", zone: "external", avatar: "MM" },
  { id: "agent-6", name: "Grant Pro", role: "Grant Writing & Research", zone: "operations", avatar: "GP" },
  { id: "agent-7", name: "Patient Outreach", role: "Patient Communication", zone: "external", avatar: "PO" },
];

// ── Mock Documents ─────────────────────────────────────────────────────────────

const initialDocuments: DataDocument[] = [
  {
    id: "doc-1",
    name: "HIPAA Compliance Policy 2026.pdf",
    fileType: "PDF",
    fileSizeBytes: 2457600,
    uploadDate: "2026-02-10T09:15:00",
    description: "Comprehensive HIPAA compliance policy covering privacy rules, security standards, and breach notification procedures for all clinical operations.",
    sensitivity: "HIPAA Regulated",
    assignedAgentIds: ["agent-1", "agent-2", "agent-3"],
  },
  {
    id: "doc-2",
    name: "Patient Intake Form Template.docx",
    fileType: "DOCX",
    fileSizeBytes: 185344,
    uploadDate: "2026-02-12T14:22:00",
    description: "Standardized patient intake form template including demographics, insurance information, medical history, and consent sections.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-1", "agent-2"],
  },
  {
    id: "doc-3",
    name: "Insurance Verification Codes.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 798720,
    uploadDate: "2026-02-08T11:30:00",
    description: "Master spreadsheet of insurance verification codes, payer IDs, and billing code cross-references for claims processing.",
    sensitivity: "General",
    assignedAgentIds: ["agent-4"],
  },
  {
    id: "doc-4",
    name: "Lab Results Summary - Q1.csv",
    fileType: "CSV",
    fileSizeBytes: 1245184,
    uploadDate: "2026-02-15T08:45:00",
    description: "Aggregated lab results data for Q1 including test types, turnaround times, and reference ranges. Contains de-identified patient data.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-2", "agent-3"],
  },
  {
    id: "doc-5",
    name: "Facility Floor Plan.png",
    fileType: "PNG",
    fileSizeBytes: 3145728,
    uploadDate: "2026-01-28T16:00:00",
    description: "Updated facility floor plan showing clinical areas, emergency exits, and equipment locations for operational reference.",
    sensitivity: "General",
    assignedAgentIds: ["agent-4", "agent-6"],
  },
  {
    id: "doc-6",
    name: "BAA - Cloud Storage Provider.pdf",
    fileType: "PDF",
    fileSizeBytes: 524288,
    uploadDate: "2026-02-05T10:10:00",
    description: "Business Associate Agreement with primary cloud storage provider covering PHI data handling, encryption requirements, and breach liability.",
    sensitivity: "BAA Required",
    assignedAgentIds: ["agent-3"],
  },
  {
    id: "doc-7",
    name: "Marketing Campaign Assets.jpg",
    fileType: "JPG",
    fileSizeBytes: 2097152,
    uploadDate: "2026-02-14T13:20:00",
    description: "Approved marketing campaign visual assets for Q1 patient outreach including branding guidelines and social media templates.",
    sensitivity: "General",
    assignedAgentIds: ["agent-5", "agent-7"],
  },
  {
    id: "doc-8",
    name: "Patient Demographics Export.csv",
    fileType: "CSV",
    fileSizeBytes: 4194304,
    uploadDate: "2026-02-16T07:30:00",
    description: "Full patient demographics export including names, DOBs, contact information, and insurance details. Restricted access — PHI data.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-1"],
  },
  {
    id: "doc-9",
    name: "Staff Training Protocol.pdf",
    fileType: "PDF",
    fileSizeBytes: 1572864,
    uploadDate: "2026-02-11T15:45:00",
    description: "Internal training protocol for new staff covering HIPAA awareness, system access procedures, and patient interaction guidelines.",
    sensitivity: "Sensitive",
    assignedAgentIds: ["agent-1", "agent-2", "agent-3", "agent-4"],
  },
  {
    id: "doc-10",
    name: "Grant Application - NIH R01.pdf",
    fileType: "PDF",
    fileSizeBytes: 6291456,
    uploadDate: "2026-02-13T09:00:00",
    description: "NIH R01 grant application draft including specific aims, research strategy, budget justification, and biosketches.",
    sensitivity: "General",
    assignedAgentIds: ["agent-6"],
  },
  {
    id: "doc-11",
    name: "Prescription Records Backup.xlsx",
    fileType: "XLSX",
    fileSizeBytes: 8388608,
    uploadDate: "2026-02-17T06:00:00",
    description: "Backup export of prescription records from the EHR system. Contains controlled substance data and prescriber information.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-2"],
  },
  {
    id: "doc-12",
    name: "Vendor Contract - Lab Services.pdf",
    fileType: "PDF",
    fileSizeBytes: 921600,
    uploadDate: "2026-02-09T12:15:00",
    description: "Service contract with external laboratory vendor covering SLAs, pricing, specimen handling protocols, and data sharing terms.",
    sensitivity: "BAA Required",
    assignedAgentIds: ["agent-3", "agent-4"],
  },
  {
    id: "doc-13",
    name: "Emergency Protocols Poster.png",
    fileType: "PNG",
    fileSizeBytes: 1048576,
    uploadDate: "2026-02-06T17:30:00",
    description: "Visual emergency protocols poster including evacuation routes, code blue procedures, and emergency contact numbers.",
    sensitivity: "General",
    assignedAgentIds: ["agent-1", "agent-4"],
  },
  {
    id: "doc-14",
    name: "Patient Consent Forms.docx",
    fileType: "DOCX",
    fileSizeBytes: 368640,
    uploadDate: "2026-02-18T08:00:00",
    description: "Standard patient consent forms for treatment, data sharing, telehealth services, and research participation.",
    sensitivity: "HIPAA Regulated",
    assignedAgentIds: ["agent-1", "agent-2", "agent-3"],
  },
  // ── Audio Documents ────────────────────────────────────────────────────────
  {
    id: "doc-15",
    name: "Patient Consultation Recording - Dr. Thompson.mp3",
    fileType: "MP3",
    fileSizeBytes: 15728640,
    uploadDate: "2026-02-19T09:30:00",
    description: "Recorded patient consultation session with Dr. Thompson covering symptom review, diagnosis discussion, and treatment plan. Audio transcription available for clinical documentation agent.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-2"],
    durationSec: 1847,
  },
  {
    id: "doc-16",
    name: "HIPAA Training Lecture - Module 3.wav",
    fileType: "WAV",
    fileSizeBytes: 52428800,
    uploadDate: "2026-02-15T14:00:00",
    description: "Audio recording of HIPAA compliance training lecture Module 3: Breach notification procedures, incident response protocols, and staff responsibilities.",
    sensitivity: "General",
    assignedAgentIds: ["agent-1", "agent-3"],
    durationSec: 3612,
  },
  {
    id: "doc-17",
    name: "Voicemail - Insurance Pre-Auth Follow-up.m4a",
    fileType: "M4A",
    fileSizeBytes: 2097152,
    uploadDate: "2026-02-20T11:15:00",
    description: "Voicemail from insurance provider regarding pre-authorization follow-up for patient procedure. Contains policy number and authorization reference.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-4"],
    durationSec: 142,
  },
  {
    id: "doc-18",
    name: "Staff Meeting Notes - Clinical Workflow Update.ogg",
    fileType: "OGG",
    fileSizeBytes: 8388608,
    uploadDate: "2026-02-18T16:45:00",
    description: "Audio recording of weekly staff meeting discussing clinical workflow updates, new EHR integration timelines, and agent deployment schedule.",
    sensitivity: "Sensitive",
    assignedAgentIds: ["agent-1", "agent-2", "agent-4"],
    durationSec: 2460,
  },
  // ── Video Documents ────────────────────────────────────────────────────────
  {
    id: "doc-19",
    name: "Telehealth Session - Patient Follow-up 02-20.mp4",
    fileType: "MP4",
    fileSizeBytes: 157286400,
    uploadDate: "2026-02-20T10:00:00",
    description: "Recorded telehealth video session for patient follow-up appointment. Includes visual assessment, screen-shared lab results, and treatment plan discussion.",
    sensitivity: "PHI",
    assignedAgentIds: ["agent-2"],
    durationSec: 1523,
  },
  {
    id: "doc-20",
    name: "Surgical Procedure Demo - Laparoscopic Appendectomy.mov",
    fileType: "MOV",
    fileSizeBytes: 524288000,
    uploadDate: "2026-02-14T08:30:00",
    description: "Educational surgical procedure demonstration video showing laparoscopic appendectomy technique. Used for clinical training and AI-assisted surgical documentation.",
    sensitivity: "General",
    assignedAgentIds: ["agent-2", "agent-3"],
    durationSec: 4215,
  },
  {
    id: "doc-21",
    name: "Facility Walkthrough - New Wing Tour.webm",
    fileType: "WEBM",
    fileSizeBytes: 94371840,
    uploadDate: "2026-02-17T13:00:00",
    description: "Video walkthrough of the newly constructed clinical wing showing patient rooms, nurse stations, equipment areas, and emergency access points.",
    sensitivity: "General",
    assignedAgentIds: ["agent-4", "agent-5"],
    durationSec: 780,
  },
  {
    id: "doc-22",
    name: "Patient Education - Post-Op Recovery Guide.mp4",
    fileType: "MP4",
    fileSizeBytes: 78643200,
    uploadDate: "2026-02-21T09:00:00",
    description: "Patient-facing educational video explaining post-operative recovery guidelines, medication schedules, wound care instructions, and warning signs to monitor.",
    sensitivity: "General",
    assignedAgentIds: ["agent-1", "agent-7"],
    durationSec: 542,
  },
  {
    id: "doc-23",
    name: "Agent Training - Voice Interaction Patterns.mp3",
    fileType: "MP3",
    fileSizeBytes: 6291456,
    uploadDate: "2026-02-19T15:30:00",
    description: "Sample audio dataset of voice interaction patterns for training the front desk agent on tone, pacing, empathy cues, and de-escalation techniques.",
    sensitivity: "General",
    assignedAgentIds: ["agent-1"],
    durationSec: 960,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const isSensitiveDoc = (s: Sensitivity): boolean =>
  s === "PHI" || s === "HIPAA Regulated" || s === "BAA Required" || s === "Sensitive";

const canAccessSensitive = (zone: AgentZone): boolean => zone === "clinical";

// ── AI Description Generator (mock) ───────────────────────────────────────────

const generateMockDescription = (name: string, fileType: DocFileType): string => {
  const base = name.replace(/\.\w+$/, "").replace(/[-_]/g, " ");
  let typeHint: string;
  if (fileType === "CSV" || fileType === "XLSX") typeHint = "structured data file";
  else if (fileType === "PNG" || fileType === "JPG") typeHint = "image document";
  else if (isAudioType(fileType)) typeHint = "audio recording";
  else if (isVideoType(fileType)) typeHint = "video file";
  else typeHint = "text document";
  return `AI-generated summary: This ${typeHint} "${base}" appears to contain healthcare-related content. Automatic classification has been applied based on content analysis. Review recommended before agent assignment.`;
};

// ── Component ──────────────────────────────────────────────────────────────────

const AgentDataCenter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState<DataDocument[]>(initialDocuments);
  const [activeTab, setActiveTab] = useState<"all" | "upload" | "compliance" | "training">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocFileType | "all">("all");
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<MediaCategory>("all");
  const [sensitivityFilter, setSensitivityFilter] = useState<Sensitivity | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Detail dialog
  const [detailDoc, setDetailDoc] = useState<DataDocument | null>(null);

  // Agent assignment dialog
  const [assignDoc, setAssignDoc] = useState<DataDocument | null>(null);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "all" as const, label: "All Documents", icon: FolderOpen },
    { key: "upload" as const, label: "Upload", icon: Upload },
    { key: "compliance" as const, label: "Compliance", icon: Shield },
    { key: "training" as const, label: "Agent Training", icon: Bot },
  ];

  // ── Filtered documents ─────────────────────────────────────────────────────
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.fileType === typeFilter;
    const matchesCategory =
      mediaCategoryFilter === "all" ||
      MEDIA_CATEGORIES.find((c) => c.key === mediaCategoryFilter)?.types.includes(doc.fileType);
    const matchesSensitivity = sensitivityFilter === "all" || doc.sensitivity === sensitivityFilter;
    const matchesAgent = agentFilter === "all" || doc.assignedAgentIds.includes(agentFilter);
    return matchesSearch && matchesType && matchesCategory && matchesSensitivity && matchesAgent;
  });

  // ── Compliance stats ───────────────────────────────────────────────────────
  const totalDocs = documents.length;
  const phiDocs = documents.filter((d) => d.sensitivity === "PHI").length;
  const hipaaDocs = documents.filter((d) => d.sensitivity === "HIPAA Regulated").length;
  const baaDocs = documents.filter((d) => d.sensitivity === "BAA Required").length;
  const sensitiveDocs = documents.filter((d) => d.sensitivity === "Sensitive").length;
  const generalDocs = documents.filter((d) => d.sensitivity === "General").length;

  // Check violations: sensitive docs assigned to non-clinical agents
  const violations = documents.reduce((acc, doc) => {
    if (!isSensitiveDoc(doc.sensitivity)) return acc;
    const badAssignments = doc.assignedAgentIds.filter((aId) => {
      const agent = mockAgents.find((a) => a.id === aId);
      return agent && !canAccessSensitive(agent.zone);
    });
    return acc + badAssignments.length;
  }, 0);

  const compliantPct = totalDocs > 0 ? Math.round(((totalDocs - (violations > 0 ? violations : 0)) / totalDocs) * 100) : 100;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split(".").pop()?.toUpperCase() as DocFileType;
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast({
        title: "Unsupported file type",
        description: "Supported formats: PDF, PNG, JPG, DOCX, CSV, XLSX, MP3, WAV, M4A, OGG, MP4, MOV, WEBM.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload progress — media files use a slower progress rate
    const isMedia = isMediaType(ext);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * (isMedia ? 15 : 25);
      });
    }, isMedia ? 400 : 300);

    const uploadDelay = isMedia ? 3500 : 2000;
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(null);

      const newDoc: DataDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        fileType: ext,
        fileSizeBytes: file.size,
        uploadDate: new Date().toISOString(),
        description: generateMockDescription(file.name, ext),
        sensitivity: "General",
        assignedAgentIds: [],
        // Mock duration for media files
        ...(isAudioType(ext) ? { durationSec: Math.floor(60 + Math.random() * 1800) } : {}),
        ...(isVideoType(ext) ? { durationSec: Math.floor(30 + Math.random() * 3600) } : {}),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      toast({
        title: isMedia ? "Media uploaded" : "Document uploaded",
        description: `"${file.name}" has been saved to the Data Center. AI classification applied.`,
      });
    }, uploadDelay);

    // Reset input
    e.target.value = "";
  };

  const handleDeleteDocument = (doc: DataDocument) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setDetailDoc(null);
    toast({
      title: "Document deleted",
      description: `"${doc.name}" has been permanently removed from the Data Center.`,
    });
  };

  const handleChangeSensitivity = (docId: string, newSensitivity: Sensitivity) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, sensitivity: newSensitivity } : d))
    );
    toast({
      title: "Classification updated",
      description: `Document classification changed to "${newSensitivity}".`,
    });
  };

  const handleAssignAgent = (docId: string, agentId: string) => {
    const doc = documents.find((d) => d.id === docId);
    const agent = mockAgents.find((a) => a.id === agentId);
    if (!doc || !agent) return;

    // Check if sensitive doc is being assigned to non-clinical agent
    if (isSensitiveDoc(doc.sensitivity) && !canAccessSensitive(agent.zone)) {
      toast({
        title: "Access restriction",
        description: `Cannot assign "${doc.sensitivity}" document to ${agent.name}. Only Clinical Zone agents can access sensitive documents.`,
        variant: "destructive",
      });
      return;
    }

    if (doc.assignedAgentIds.includes(agentId)) {
      toast({
        title: "Already assigned",
        description: `${agent.name} already has access to this document.`,
      });
      return;
    }

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, assignedAgentIds: [...d.assignedAgentIds, agentId] } : d
      )
    );

    toast({
      title: "Agent assigned",
      description: `${agent.name} now has access to "${doc.name}". Document saved to Data Center.`,
    });
  };

  const handleRemoveAgent = (docId: string, agentId: string) => {
    const agent = mockAgents.find((a) => a.id === agentId);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, assignedAgentIds: d.assignedAgentIds.filter((id) => id !== agentId) }
          : d
      )
    );
    toast({
      title: "Agent removed",
      description: `${agent?.name || "Agent"} access has been revoked.`,
    });
  };

  const handleDownload = (doc: DataDocument) => {
    toast({
      title: "Download started",
      description: `Downloading "${doc.name}" (${formatFileSize(doc.fileSizeBytes)})...`,
    });
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderSensitivityBadge = (s: Sensitivity) => {
    const cfg = SENSITIVITY_CONFIG[s];
    const Icon = cfg.icon;
    return (
      <Badge className={`text-[10px] px-2 py-0.5 border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {s}
      </Badge>
    );
  };

  const renderAgentAvatars = (agentIds: string[]) => {
    const agents = agentIds.map((id) => mockAgents.find((a) => a.id === id)).filter(Boolean) as AgentRecord[];
    if (agents.length === 0) {
      return <span className="text-[11px] text-muted-foreground/50 italic">No agents assigned</span>;
    }
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {agents.slice(0, 4).map((agent) => (
          <span
            key={agent.id}
            className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-bold bg-gradient-to-br from-primary to-blue-600 text-white"
            title={`${agent.name} (${ZONE_CONFIG[agent.zone].label})`}
          >
            {agent.avatar}
          </span>
        ))}
        {agents.length > 4 && (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-bold bg-white/10 text-muted-foreground border border-white/10">
            +{agents.length - 4}
          </span>
        )}
      </div>
    );
  };

  // ── Render: All Documents Tab ──────────────────────────────────────────────

  const renderAllDocuments = () => (
    <>
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Media category filter */}
          <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
            <Filter className="h-4 w-4 text-muted-foreground my-auto ml-2 mr-1" />
            {MEDIA_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setMediaCategoryFilter(cat.key);
                  setTypeFilter("all");
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  mediaCategoryFilter === cat.key && typeFilter === "all"
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Individual type filter (shows types from selected category) */}
          {mediaCategoryFilter !== "all" && (
            <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  typeFilter === "all"
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {(MEDIA_CATEGORIES.find((c) => c.key === mediaCategoryFilter)?.types ?? []).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setTypeFilter(ft)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    typeFilter === ft
                      ? "gradient-primary text-primary-foreground shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          )}

          {/* Sensitivity filter */}
          <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
            <Shield className="h-4 w-4 text-muted-foreground my-auto ml-2 mr-1" />
            {(["all", "General", "PHI", "HIPAA Regulated", "BAA Required", "Sensitive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSensitivityFilter(s as Sensitivity | "all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  sensitivityFilter === s
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          {/* Agent filter */}
          <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
            <Bot className="h-4 w-4 text-muted-foreground my-auto ml-2 mr-1" />
            <button
              onClick={() => setAgentFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                agentFilter === "all"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Agents
            </button>
            {mockAgents.slice(0, 4).map((agent) => (
              <button
                key={agent.id}
                onClick={() => setAgentFilter(agent.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  agentFilter === agent.id
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
        </span>
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No documents found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => {
            const ftCfg = FILE_TYPE_CONFIG[doc.fileType];
            const FtIcon = ftCfg.icon;
            const hasSensitiveWarning = isSensitiveDoc(doc.sensitivity);

            return (
              <div
                key={doc.id}
                className={`bg-card rounded-xl border p-4 card-hover transition-all ${
                  hasSensitiveWarning ? "border-amber-500/20" : "border-white/[0.06]"
                }`}
              >
                {/* Warning banner for sensitive docs */}
                {hasSensitiveWarning && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-amber-400">
                      This document contains {doc.sensitivity} data. Access is restricted to authorized agents only.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* File type icon */}
                  <div className={`h-11 w-11 rounded-lg ${ftCfg.bg} flex items-center justify-center shrink-0`}>
                    <FtIcon className={`h-5 w-5 ${ftCfg.color}`} />
                  </div>

                  {/* Doc info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold font-heading text-sm text-foreground truncate">
                        {doc.name}
                      </h3>
                      {renderSensitivityBadge(doc.sensitivity)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(doc.fileSizeBytes)}
                      </span>
                      {doc.durationSec != null && (
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {formatDuration(doc.durationSec)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(doc.uploadDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {doc.assignedAgentIds.length} agent{doc.assignedAgentIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Agent avatars */}
                  <div className="hidden md:flex items-center">
                    {renderAgentAvatars(doc.assignedAgentIds)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setDetailDoc(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setAssignDoc(doc)}
                    >
                      <Bot className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── Render: Upload Tab ─────────────────────────────────────────────────────

  const renderUploadTab = () => (
    <div className="max-w-2xl mx-auto">
      {/* Drag-and-drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-white/10 hover:border-primary/30 hover:bg-white/[0.01]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          // Simulated — real drag-and-drop would use DataTransfer
          toast({
            title: "Drop detected",
            description: "Please use the file picker button to upload documents.",
          });
        }}
      >
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm mx-auto mb-5">
          <Upload className="h-7 w-7 text-white" />
        </div>

        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          Upload Documents
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Drag and drop files here, or click the button below to browse
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {MEDIA_CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
            <div key={cat.key} className="flex items-center gap-1">
              {cat.types.map((ft) => {
                const cfg = FILE_TYPE_CONFIG[ft];
                return (
                  <Badge
                    key={ft}
                    variant="outline"
                    className={`text-[10px] ${cfg.color} border-white/10`}
                  >
                    {ft}
                  </Badge>
                );
              })}
            </div>
          ))}
        </div>

        <label className="inline-block cursor-pointer">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx,.csv,.xlsx,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm"
            className="hidden"
            onChange={handleFileUpload}
          />
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-glow-sm hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            Choose File
          </span>
        </label>

        <p className="text-[11px] text-muted-foreground mt-4">
          Maximum file size: 500MB for media, 50MB for documents. All files are automatically classified by AI upon upload.
        </p>
      </div>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="mt-6 bg-card rounded-xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Uploading document...</p>
              <p className="text-xs text-muted-foreground">AI classification in progress</p>
            </div>
            <span className="text-sm font-bold text-primary">
              {Math.min(Math.round(uploadProgress), 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${Math.min(uploadProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent uploads */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          Recent Uploads
        </h3>
        <div className="space-y-2">
          {documents.slice(0, 5).map((doc) => {
            const ftCfg = FILE_TYPE_CONFIG[doc.fileType];
            const FtIcon = ftCfg.icon;
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 bg-card rounded-lg border border-white/[0.06] p-3"
              >
                <div className={`h-8 w-8 rounded-lg ${ftCfg.bg} flex items-center justify-center shrink-0`}>
                  <FtIcon className={`h-4 w-4 ${ftCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFileSize(doc.fileSizeBytes)} &middot; {formatDate(doc.uploadDate)}
                  </p>
                </div>
                {renderSensitivityBadge(doc.sensitivity)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Render: Compliance Tab ─────────────────────────────────────────────────

  const renderComplianceTab = () => (
    <>
      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium">Total Documents</span>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
              <Database className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all classifications</p>
        </div>

        <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium">PHI Documents</span>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-500/10">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{phiDocs}</p>
          <p className="text-xs text-muted-foreground mt-1">Protected Health Information</p>
        </div>

        <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium">Compliant Rate</span>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">{compliantPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">Documents in compliance</p>
        </div>

        <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium">Violations</span>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/10">
              <XCircle className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400">{violations}</p>
          <p className="text-xs text-muted-foreground mt-1">Zone access violations</p>
        </div>

        <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium">Sensitive Docs</span>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-500/10">
              <Lock className="h-5 w-5 text-violet-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-violet-400">{hipaaDocs + baaDocs + sensitiveDocs}</p>
          <p className="text-xs text-muted-foreground mt-1">HIPAA, BAA, Sensitive</p>
        </div>
      </div>

      {/* Compliance Overview Banner */}
      {violations === 0 ? (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 mb-8">
          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">All Documents Compliant</p>
            <p className="text-xs text-muted-foreground mt-1">
              No sensitive documents are assigned to unauthorized agents. All PHI, HIPAA, and BAA documents
              are restricted to Clinical Zone agents as required.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 mb-8">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">
              {violations} Compliance Violation{violations !== 1 ? "s" : ""} Detected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sensitive documents have been assigned to agents outside the Clinical Zone.
              Review assignments below and remove unauthorized access immediately.
            </p>
          </div>
        </div>
      )}

      {/* Classification Breakdown */}
      <div className="bg-card rounded-xl border border-white/[0.06] p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-primary" />
          Classification Breakdown
        </h3>
        <div className="space-y-3">
          {([
            { label: "General", count: generalDocs, color: "bg-blue-500", textColor: "text-blue-400" },
            { label: "PHI", count: phiDocs, color: "bg-red-500", textColor: "text-red-400" },
            { label: "HIPAA Regulated", count: hipaaDocs, color: "bg-orange-500", textColor: "text-orange-400" },
            { label: "BAA Required", count: baaDocs, color: "bg-violet-500", textColor: "text-violet-400" },
            { label: "Sensitive", count: sensitiveDocs, color: "bg-amber-500", textColor: "text-amber-400" },
          ] as const).map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`text-xs font-medium w-32 ${item.textColor}`}>{item.label}</span>
              <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${totalDocs > 0 ? (item.count / totalDocs) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Access Matrix */}
      <div className="bg-card rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-primary" />
          Zone Access Enforcement
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {(["clinical", "operations", "external"] as const).map((zone) => {
            const zoneCfg = ZONE_CONFIG[zone];
            const zoneAgents = mockAgents.filter((a) => a.zone === zone);
            const zoneDocCount = documents.filter((d) =>
              d.assignedAgentIds.some((aId) => zoneAgents.some((za) => za.id === aId))
            ).length;
            const zoneSensitiveAccess = zone === "clinical";

            return (
              <div
                key={zone}
                className={`rounded-xl border p-4 ${
                  zoneSensitiveAccess ? "border-green-500/20 bg-green-500/5" : "border-white/[0.06] bg-white/[0.01]"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${zoneCfg.dotColor}`} />
                  <span className={`text-sm font-semibold ${zoneCfg.color}`}>
                    {zoneCfg.label}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Agents:</span>
                    <span className="font-medium text-foreground">{zoneAgents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="font-medium text-foreground">{zoneDocCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PHI Access:</span>
                    {zoneSensitiveAccess ? (
                      <span className="flex items-center gap-1 text-green-400 font-medium">
                        <Check className="h-3 w-3" /> Allowed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-medium">
                        <X className="h-3 w-3" /> Denied
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Agents</p>
                  <div className="flex flex-wrap gap-1">
                    {zoneAgents.map((a) => (
                      <span
                        key={a.id}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  // ── Render: Agent Training Tab ─────────────────────────────────────────────

  const renderAgentTraining = () => (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => {
          const agentDocs = documents.filter((d) => d.assignedAgentIds.includes(agent.id));
          const zoneCfg = ZONE_CONFIG[agent.zone];
          const hasSensitiveDocs = agentDocs.some((d) => isSensitiveDoc(d.sensitivity));
          const isAuthorizedForSensitive = canAccessSensitive(agent.zone);

          return (
            <div
              key={agent.id}
              className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
            >
              {/* Agent header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm text-white font-bold text-sm">
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold font-heading text-sm text-foreground truncate">
                    {agent.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                </div>
              </div>

              {/* Zone badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`h-2 w-2 rounded-full ${zoneCfg.dotColor}`} />
                <span className={`text-[11px] font-medium ${zoneCfg.color}`}>
                  {zoneCfg.label}
                </span>
                {isAuthorizedForSensitive && (
                  <Badge className="text-[9px] px-1.5 py-0 bg-green-500/10 border border-green-500/30 text-green-400 ml-auto">
                    PHI Authorized
                  </Badge>
                )}
              </div>

              {/* Warning if non-clinical agent has sensitive docs */}
              {hasSensitiveDocs && !isAuthorizedForSensitive && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/15">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="text-[10px] text-red-400">
                    Violation: Sensitive docs assigned to non-clinical agent
                  </span>
                </div>
              )}

              {/* Document count */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                <span className="text-xs text-muted-foreground">Training Documents</span>
                <span className="text-sm font-bold text-foreground">{agentDocs.length}</span>
              </div>

              {/* Document list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {agentDocs.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/50 italic py-3 text-center">
                    No documents assigned
                  </p>
                ) : (
                  agentDocs.map((doc) => {
                    const ftCfg = FILE_TYPE_CONFIG[doc.fileType];
                    const FtIcon = ftCfg.icon;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <FtIcon className={`h-3.5 w-3.5 ${ftCfg.color} shrink-0`} />
                        <span className="text-xs text-foreground truncate flex-1">{doc.name}</span>
                        {renderSensitivityBadge(doc.sensitivity)}
                        <button
                          onClick={() => handleRemoveAgent(doc.id, agent.id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Assign document button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-2 text-xs border-white/10 hover:bg-white/5"
                onClick={() => {
                  // Find the first doc not yet assigned to this agent
                  const unassigned = documents.find((d) => !d.assignedAgentIds.includes(agent.id));
                  if (unassigned) {
                    setAssignDoc(unassigned);
                  } else {
                    toast({
                      title: "All documents assigned",
                      description: `${agent.name} already has access to all documents.`,
                    });
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Assign Document
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text flex items-center gap-3">
                <Database className="h-7 w-7 text-primary" />
                AI Agent Data Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload, classify, and manage documents for AI agent training and compliance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1">
                <Shield className="h-3 w-3 mr-1.5" />
                HIPAA Compliant
              </Badge>
            </div>
          </div>

          {/* ── Stats Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Total Documents</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all classifications</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">PHI Documents</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-500/10">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-400">{phiDocs}</p>
              <p className="text-xs text-muted-foreground mt-1">Restricted access required</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Active Agents</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{mockAgents.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Agents with document access</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Compliance</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-400">{compliantPct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{violations === 0 ? "No violations" : `${violations} violation(s)`}</p>
            </div>
          </div>

          {/* ── Tab Navigation ─────────────────────────────────────────── */}
          <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1 mb-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "gradient-primary text-primary-foreground shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ────────────────────────────────────────────── */}
          {activeTab === "all" && renderAllDocuments()}
          {activeTab === "upload" && renderUploadTab()}
          {activeTab === "compliance" && renderComplianceTab()}
          {activeTab === "training" && renderAgentTraining()}

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>
              {totalDocs} documents &middot; {phiDocs} PHI &middot; {hipaaDocs + baaDocs} regulated &middot; {violations} violations
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" /> HIPAA/BAA compliant &middot; End-to-end encryption
            </span>
          </div>
        </div>
      </main>

      {/* ── Document Detail Dialog ─────────────────────────────────────── */}
      <Dialog open={!!detailDoc} onOpenChange={(open) => !open && setDetailDoc(null)}>
        <DialogContent className="max-w-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-heading">
              <Eye className="h-5 w-5 text-primary" />
              Document Details
            </DialogTitle>
          </DialogHeader>

          {detailDoc && (() => {
            const ftCfg = FILE_TYPE_CONFIG[detailDoc.fileType];
            const FtIcon = ftCfg.icon;
            const assignedAgents = detailDoc.assignedAgentIds
              .map((id) => mockAgents.find((a) => a.id === id))
              .filter(Boolean) as AgentRecord[];

            return (
              <div className="space-y-5 mt-2">
                {/* Warning banner */}
                {isSensitiveDoc(detailDoc.sensitivity) && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-400">
                      This document is classified as {detailDoc.sensitivity}. Access restricted to Clinical Zone agents.
                    </span>
                  </div>
                )}

                {/* File info */}
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl ${ftCfg.bg} flex items-center justify-center`}>
                    <FtIcon className={`h-7 w-7 ${ftCfg.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-base">{detailDoc.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{detailDoc.fileType}</span>
                      <span>&middot;</span>
                      <span>{formatFileSize(detailDoc.fileSizeBytes)}</span>
                      {detailDoc.durationSec != null && (
                        <>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {formatDuration(detailDoc.durationSec)}
                          </span>
                        </>
                      )}
                      <span>&middot;</span>
                      <span>{formatDateTime(detailDoc.uploadDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Media preview */}
                {isAudioType(detailDoc.fileType) && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Audio Preview
                    </Label>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`h-12 w-12 rounded-xl ${FILE_TYPE_CONFIG[detailDoc.fileType].bg} flex items-center justify-center`}>
                          <Music className={`h-6 w-6 ${FILE_TYPE_CONFIG[detailDoc.fileType].color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{detailDoc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {detailDoc.fileType} &middot; {formatFileSize(detailDoc.fileSizeBytes)}
                            {detailDoc.durationSec != null && ` · ${formatDuration(detailDoc.durationSec)}`}
                          </p>
                        </div>
                      </div>
                      <audio
                        controls
                        className="w-full h-10 rounded-lg"
                        preload="none"
                      >
                        <source src="" type={`audio/${detailDoc.fileType.toLowerCase()}`} />
                        Your browser does not support audio playback.
                      </audio>
                      <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                        Audio preview available when file is stored in Supabase Storage
                      </p>
                    </div>
                  </div>
                )}

                {isVideoType(detailDoc.fileType) && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Video Preview
                    </Label>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`h-16 w-16 rounded-full ${FILE_TYPE_CONFIG[detailDoc.fileType].bg} flex items-center justify-center mx-auto mb-3`}>
                            <Play className={`h-8 w-8 ${FILE_TYPE_CONFIG[detailDoc.fileType].color} ml-1`} />
                          </div>
                          <p className="text-sm font-medium text-foreground">{detailDoc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {detailDoc.fileType} &middot; {formatFileSize(detailDoc.fileSizeBytes)}
                            {detailDoc.durationSec != null && ` · ${formatDuration(detailDoc.durationSec)}`}
                          </p>
                        </div>
                      </div>
                      <video
                        controls
                        className="w-full rounded-lg"
                        preload="none"
                        playsInline
                      >
                        <source src="" type={`video/${detailDoc.fileType.toLowerCase()}`} />
                        Your browser does not support video playback.
                      </video>
                      <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                        Video preview available when file is stored in Supabase Storage
                      </p>
                    </div>
                  </div>
                )}

                {/* Classification */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Classification
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["General", "PHI", "HIPAA Regulated", "BAA Required", "Sensitive"] as Sensitivity[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChangeSensitivity(detailDoc.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          detailDoc.sensitivity === s
                            ? `${SENSITIVITY_CONFIG[s].bg} ${SENSITIVITY_CONFIG[s].border} ${SENSITIVITY_CONFIG[s].color}`
                            : "border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Description */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    AI-Generated Description
                  </Label>
                  <p className="text-sm text-foreground/80 leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    {detailDoc.description}
                  </p>
                </div>

                {/* Assigned agents */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Assigned Agents ({assignedAgents.length})
                  </Label>
                  {assignedAgents.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 italic">No agents assigned</p>
                  ) : (
                    <div className="space-y-1.5">
                      {assignedAgents.map((agent) => {
                        const zoneCfg = ZONE_CONFIG[agent.zone];
                        return (
                          <div
                            key={agent.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold bg-gradient-to-br from-primary to-blue-600 text-white">
                              {agent.avatar}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground">{agent.name}</span>
                              <span className="flex items-center gap-1 mt-0.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${zoneCfg.dotColor}`} />
                                <span className={`text-[10px] ${zoneCfg.color}`}>{zoneCfg.label}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                handleRemoveAgent(detailDoc.id, agent.id);
                                setDetailDoc({
                                  ...detailDoc,
                                  assignedAgentIds: detailDoc.assignedAgentIds.filter((id) => id !== agent.id),
                                });
                              }}
                              className="text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-white/10 text-muted-foreground hover:bg-white/5"
                    onClick={() => handleDownload(detailDoc)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-white/10 text-muted-foreground hover:bg-white/5"
                      onClick={() => {
                        setDetailDoc(null);
                        setAssignDoc(detailDoc);
                      }}
                    >
                      <Bot className="h-3.5 w-3.5" />
                      Assign Agents
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDeleteDocument(detailDoc)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Agent Assignment Dialog ────────────────────────────────────── */}
      <Dialog open={!!assignDoc} onOpenChange={(open) => !open && setAssignDoc(null)}>
        <DialogContent className="max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-heading">
              <Bot className="h-5 w-5 text-primary" />
              Assign Agents
            </DialogTitle>
          </DialogHeader>

          {assignDoc && (() => {
            const currentDoc = documents.find((d) => d.id === assignDoc.id) || assignDoc;
            const sensitiveRestriction = isSensitiveDoc(currentDoc.sensitivity);

            return (
              <div className="space-y-4 mt-2">
                {/* Document info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{currentDoc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderSensitivityBadge(currentDoc.sensitivity)}
                      <span className="text-[11px] text-muted-foreground">
                        {formatFileSize(currentDoc.fileSizeBytes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sensitive warning */}
                {sensitiveRestriction && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-amber-400">
                      Only Clinical Zone agents can access this {currentDoc.sensitivity} document.
                    </span>
                  </div>
                )}

                {/* Agent selector */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                    Select Agents
                  </Label>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {mockAgents.map((agent) => {
                      const isAssigned = currentDoc.assignedAgentIds.includes(agent.id);
                      const zoneCfg = ZONE_CONFIG[agent.zone];
                      const isRestricted = sensitiveRestriction && !canAccessSensitive(agent.zone);

                      return (
                        <button
                          key={agent.id}
                          disabled={isRestricted}
                          onClick={() => {
                            if (isAssigned) {
                              handleRemoveAgent(currentDoc.id, agent.id);
                              setAssignDoc({
                                ...currentDoc,
                                assignedAgentIds: currentDoc.assignedAgentIds.filter((id) => id !== agent.id),
                              });
                            } else {
                              handleAssignAgent(currentDoc.id, agent.id);
                              setAssignDoc({
                                ...currentDoc,
                                assignedAgentIds: [...currentDoc.assignedAgentIds, agent.id],
                              });
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                            isRestricted
                              ? "opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]"
                              : isAssigned
                              ? "border-primary/30 bg-primary/5"
                              : "border-white/5 bg-white/[0.02] hover:border-white/10"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[10px] font-bold bg-gradient-to-br from-primary to-blue-600 text-white shrink-0">
                            {agent.avatar}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{agent.name}</p>
                            <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                            <span className="flex items-center gap-1 mt-0.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${zoneCfg.dotColor}`} />
                              <span className={`text-[10px] ${zoneCfg.color}`}>{zoneCfg.label}</span>
                            </span>
                          </div>
                          {isAssigned ? (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          ) : isRestricted ? (
                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Close */}
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity gap-2"
                    onClick={() => setAssignDoc(null)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Done
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDataCenter;
