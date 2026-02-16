import { useState } from "react";
import {
  FileText,
  FolderOpen,
  Search,
  Upload,
  Download,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  Bot,
  Link2,
  Unlink,
  ArrowUpDown,
  FileSpreadsheet,
  File,
  FileType,
  Tag,
  User,
  Filter,
  SortAsc,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
type DocumentCategory =
  | "Clinical Protocols"
  | "Insurance Policies"
  | "SOPs"
  | "Training Materials"
  | "Compliance Docs"
  | "Templates"
  | "Research Papers";

type FileType_ = "PDF" | "DOCX" | "XLSX" | "CSV";

type SortOption = "name" | "date" | "size" | "references";

interface KBDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: FileType_;
  fileSize: string;
  fileSizeBytes: number;
  uploadDate: string;
  uploadedBy: string;
  agentAccessCount: number;
  description: string;
  tags: string[];
}

interface AgentDocLink {
  id: string;
  agentName: string;
  agentRole: string;
  documentIds: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES: DocumentCategory[] = [
  "Clinical Protocols",
  "Insurance Policies",
  "SOPs",
  "Training Materials",
  "Compliance Docs",
  "Templates",
  "Research Papers",
];

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  "Clinical Protocols": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Insurance Policies": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "SOPs": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Training Materials": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Compliance Docs": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Templates": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Research Papers": "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const FILE_TYPE_ICONS: Record<FileType_, { icon: typeof FileText; color: string }> = {
  PDF: { icon: FileText, color: "text-red-400" },
  DOCX: { icon: File, color: "text-blue-400" },
  XLSX: { icon: FileSpreadsheet, color: "text-green-400" },
  CSV: { icon: FileType, color: "text-orange-400" },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockDocuments: KBDocument[] = [
  {
    id: "doc-1",
    name: "HIPAA Compliance Guide 2024",
    category: "Compliance Docs",
    fileType: "PDF",
    fileSize: "2.4MB",
    fileSizeBytes: 2516582,
    uploadDate: "2024-01-15",
    uploadedBy: "Dr. Sarah Chen",
    agentAccessCount: 142,
    description: "Comprehensive guide covering HIPAA privacy and security rules for healthcare organizations.",
    tags: ["HIPAA", "compliance", "privacy"],
  },
  {
    id: "doc-2",
    name: "Patient Intake SOP",
    category: "SOPs",
    fileType: "PDF",
    fileSize: "1.1MB",
    fileSizeBytes: 1153434,
    uploadDate: "2024-02-08",
    uploadedBy: "Admin Team",
    agentAccessCount: 89,
    description: "Standard operating procedure for patient intake, registration, and initial assessment.",
    tags: ["intake", "SOP", "patients"],
  },
  {
    id: "doc-3",
    name: "Insurance Verification Workflow",
    category: "Insurance Policies",
    fileType: "DOCX",
    fileSize: "890KB",
    fileSizeBytes: 911360,
    uploadDate: "2024-02-20",
    uploadedBy: "Billing Dept",
    agentAccessCount: 67,
    description: "Step-by-step workflow for verifying patient insurance eligibility and benefits.",
    tags: ["insurance", "verification", "billing"],
  },
  {
    id: "doc-4",
    name: "Clinical Assessment Protocol",
    category: "Clinical Protocols",
    fileType: "PDF",
    fileSize: "3.2MB",
    fileSizeBytes: 3355443,
    uploadDate: "2024-01-22",
    uploadedBy: "Dr. James Rivera",
    agentAccessCount: 203,
    description: "Detailed clinical assessment protocol including triage, examination, and documentation standards.",
    tags: ["clinical", "assessment", "protocol"],
  },
  {
    id: "doc-5",
    name: "Agent Training Manual",
    category: "Training Materials",
    fileType: "PDF",
    fileSize: "5.1MB",
    fileSizeBytes: 5347737,
    uploadDate: "2024-03-01",
    uploadedBy: "Dr. Claw Admin",
    agentAccessCount: 312,
    description: "Complete training manual for configuring and deploying AI agents in healthcare settings.",
    tags: ["training", "agents", "configuration"],
  },
  {
    id: "doc-6",
    name: "Post-Op Care Checklist",
    category: "Clinical Protocols",
    fileType: "PDF",
    fileSize: "450KB",
    fileSizeBytes: 460800,
    uploadDate: "2024-02-14",
    uploadedBy: "Nursing Staff",
    agentAccessCount: 178,
    description: "Post-operative care checklist for monitoring patient recovery and discharge planning.",
    tags: ["post-op", "checklist", "recovery"],
  },
  {
    id: "doc-7",
    name: "Referral Letter Template",
    category: "Templates",
    fileType: "DOCX",
    fileSize: "230KB",
    fileSizeBytes: 235520,
    uploadDate: "2024-01-30",
    uploadedBy: "Admin Team",
    agentAccessCount: 95,
    description: "Standardized referral letter template for specialist consultations and external referrals.",
    tags: ["referral", "template", "letter"],
  },
  {
    id: "doc-8",
    name: "Data Privacy Policy",
    category: "Compliance Docs",
    fileType: "PDF",
    fileSize: "1.8MB",
    fileSizeBytes: 1887436,
    uploadDate: "2024-03-05",
    uploadedBy: "Legal Team",
    agentAccessCount: 56,
    description: "Organization-wide data privacy policy covering patient data handling, storage, and sharing.",
    tags: ["privacy", "data", "policy"],
  },
  {
    id: "doc-9",
    name: "Telehealth Best Practices",
    category: "SOPs",
    fileType: "PDF",
    fileSize: "2.1MB",
    fileSizeBytes: 2202009,
    uploadDate: "2024-02-28",
    uploadedBy: "IT Department",
    agentAccessCount: 124,
    description: "Best practices guide for conducting telehealth visits including technical setup and patient communication.",
    tags: ["telehealth", "best-practices", "virtual"],
  },
  {
    id: "doc-10",
    name: "Medication Interaction Database",
    category: "Research Papers",
    fileType: "CSV",
    fileSize: "12.4MB",
    fileSizeBytes: 13002342,
    uploadDate: "2024-03-10",
    uploadedBy: "Pharmacy Dept",
    agentAccessCount: 287,
    description: "Comprehensive database of known medication interactions, contraindications, and dosage guidelines.",
    tags: ["medications", "interactions", "database"],
  },
  {
    id: "doc-11",
    name: "Staff Onboarding Guide",
    category: "Training Materials",
    fileType: "PDF",
    fileSize: "4.2MB",
    fileSizeBytes: 4404019,
    uploadDate: "2024-01-10",
    uploadedBy: "HR Department",
    agentAccessCount: 73,
    description: "Complete onboarding guide for new staff including system access, policies, and training schedules.",
    tags: ["onboarding", "staff", "HR"],
  },
  {
    id: "doc-12",
    name: "Billing Code Reference",
    category: "Templates",
    fileType: "XLSX",
    fileSize: "780KB",
    fileSizeBytes: 798720,
    uploadDate: "2024-02-12",
    uploadedBy: "Billing Dept",
    agentAccessCount: 156,
    description: "Reference spreadsheet for medical billing codes including CPT, ICD-10, and HCPCS codes.",
    tags: ["billing", "codes", "reference"],
  },
];

const initialAgentLinks: AgentDocLink[] = [
  {
    id: "link-1",
    agentName: "Dr. Front Desk",
    agentRole: "Patient Scheduling & Intake",
    documentIds: ["doc-2", "doc-3", "doc-6"],
  },
  {
    id: "link-2",
    agentName: "Clinical Assistant",
    agentRole: "Clinical Decision Support",
    documentIds: ["doc-4", "doc-10", "doc-1"],
  },
  {
    id: "link-3",
    agentName: "Compliance Officer",
    agentRole: "HIPAA & Regulatory Compliance",
    documentIds: ["doc-1", "doc-8"],
  },
  {
    id: "link-4",
    agentName: "Billing Navigator",
    agentRole: "Insurance & Billing Automation",
    documentIds: ["doc-3", "doc-12", "doc-7"],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const KnowledgeBase = () => {
  const { toast } = useToast();

  // Document state
  const [documents, setDocuments] = useState<KBDocument[]>(mockDocuments);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType_ | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory | "">("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");

  // Agent knowledge links
  const [agentLinks, setAgentLinks] = useState<AgentDocLink[]>(initialAgentLinks);

  // ---------------------------------------------------------------------------
  // Filtering & sorting
  // ---------------------------------------------------------------------------
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFileType = fileTypeFilter === "All" || doc.fileType === fileTypeFilter;
      return matchesCategory && matchesSearch && matchesFileType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case "size":
          return b.fileSizeBytes - a.fileSizeBytes;
        case "references":
          return b.agentAccessCount - a.agentAccessCount;
        default:
          return 0;
      }
    });

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------
  const totalDocuments = documents.length;
  const totalCategories = new Set(documents.map((d) => d.category)).size;
  const totalAgentReferences = documents.reduce((sum, d) => sum + d.agentAccessCount, 0);
  const lastUpdated = documents
    .map((d) => d.uploadDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const getCategoryCount = (category: DocumentCategory) =>
    documents.filter((d) => d.category === category).length;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleUpload = () => {
    if (!uploadName.trim() || !uploadCategory) {
      toast({ title: "Missing Fields", description: "Please fill in the document name and category." });
      return;
    }

    const newDoc: KBDocument = {
      id: `doc-${Date.now()}`,
      name: uploadName.trim(),
      category: uploadCategory as DocumentCategory,
      fileType: "PDF",
      fileSize: "0KB",
      fileSizeBytes: 0,
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "Current User",
      agentAccessCount: 0,
      description: uploadDescription.trim(),
      tags: uploadTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadOpen(false);
    setUploadName("");
    setUploadCategory("");
    setUploadDescription("");
    setUploadTags("");
    toast({ title: "Document Uploaded", description: `"${newDoc.name}" has been added to the knowledge base.` });
  };

  const handleView = (doc: KBDocument) => {
    toast({ title: "Opening Document", description: `Viewing "${doc.name}"...` });
  };

  const handleDownload = (doc: KBDocument) => {
    toast({ title: "Download Started", description: `Downloading "${doc.name}" (${doc.fileSize})...` });
  };

  const handleDelete = (doc: KBDocument) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setAgentLinks((prev) =>
      prev.map((link) => ({
        ...link,
        documentIds: link.documentIds.filter((id) => id !== doc.id),
      }))
    );
    toast({ title: "Document Deleted", description: `"${doc.name}" has been removed from the knowledge base.` });
  };

  const handleLinkDocument = (agentLinkId: string, docId: string) => {
    setAgentLinks((prev) =>
      prev.map((link) =>
        link.id === agentLinkId && !link.documentIds.includes(docId)
          ? { ...link, documentIds: [...link.documentIds, docId] }
          : link
      )
    );
    const doc = documents.find((d) => d.id === docId);
    const agent = agentLinks.find((a) => a.id === agentLinkId);
    toast({
      title: "Document Linked",
      description: `"${doc?.name}" linked to ${agent?.agentName}.`,
    });
  };

  const handleUnlinkDocument = (agentLinkId: string, docId: string) => {
    setAgentLinks((prev) =>
      prev.map((link) =>
        link.id === agentLinkId
          ? { ...link, documentIds: link.documentIds.filter((id) => id !== docId) }
          : link
      )
    );
    const doc = documents.find((d) => d.id === docId);
    const agent = agentLinks.find((a) => a.id === agentLinkId);
    toast({
      title: "Document Unlinked",
      description: `"${doc?.name}" unlinked from ${agent?.agentName}.`,
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                Knowledge Base
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage documents, protocols, and reference materials for your AI agents.
              </p>
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          {/* ── Stats Cards ────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Total Documents</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalDocuments}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Categories</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalCategories}</p>
              <p className="text-xs text-muted-foreground mt-1">Document categories</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Agent References</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalAgentReferences.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total agent document accesses</p>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Last Updated</span>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Most recent upload</p>
            </div>
          </div>

          {/* ── Search & Filter Bar ────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Select
                  value={fileTypeFilter}
                  onValueChange={(val) => setFileTypeFilter(val as FileType_ | "All")}
                >
                  <SelectTrigger className="w-[120px] h-9 text-xs bg-white/[0.03] border-white/10">
                    <SelectValue placeholder="File type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                <Select
                  value={sortBy}
                  onValueChange={(val) => setSortBy(val as SortOption)}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs bg-white/[0.03] border-white/10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="references">Most Referenced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Category Sidebar + Document Grid ─────── */}
          <div className="flex gap-6">
            {/* Category Sidebar */}
            <div className="hidden lg:block w-56 shrink-0">
              <div className="bg-card rounded-xl border border-white/[0.06] p-4 sticky top-8">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === "All"
                        ? "gradient-primary text-white shadow-glow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span>All Documents</span>
                    <span className={selectedCategory === "All" ? "text-white/70" : "text-muted-foreground/50"}>
                      {documents.length}
                    </span>
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? "gradient-primary text-white shadow-glow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className={selectedCategory === cat ? "text-white/70" : "text-muted-foreground/50"}>
                        {getCategoryCount(cat)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile category pills */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-4 w-full">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === "All"
                    ? "gradient-primary text-white shadow-glow-sm"
                    : "bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({documents.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "gradient-primary text-white shadow-glow-sm"
                      : "bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat} ({getCategoryCount(cat)})
                </button>
              ))}
            </div>

            {/* Document Grid */}
            <div className="flex-1 min-w-0">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No documents found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => {
                    const fileConfig = FILE_TYPE_ICONS[doc.fileType];
                    const FileIcon = fileConfig.icon;

                    return (
                      <div
                        key={doc.id}
                        className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover group"
                      >
                        {/* Top row: file icon + badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className={`h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center ${fileConfig.color}`}>
                            <FileIcon className="h-5 w-5" />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${CATEGORY_COLORS[doc.category]}`}
                          >
                            {doc.category}
                          </Badge>
                        </div>

                        {/* Name */}
                        <h3 className="font-semibold font-heading text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {doc.name}
                        </h3>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.fileType} &middot; {doc.fileSize}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(doc.uploadDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.uploadedBy}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                          <Bot className="h-3 w-3" />
                          <span>{doc.agentAccessCount} agent accesses</span>
                        </div>

                        {/* Tags */}
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {doc.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                              >
                                <Tag className="h-2.5 w-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <Separator className="my-3" />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => handleView(doc)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                            onClick={() => handleDelete(doc)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Agent Knowledge Links ──────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold font-heading text-foreground">Agent Knowledge Links</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage which documents each agent can reference for context and decision-making.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {agentLinks.map((agentLink) => (
                <div
                  key={agentLink.id}
                  className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-heading text-sm text-foreground">
                        {agentLink.agentName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{agentLink.agentRole}</p>
                    </div>
                  </div>

                  <Separator className="mb-3" />

                  {/* Linked documents */}
                  <div className="space-y-2 mb-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Linked Documents ({agentLink.documentIds.length})
                    </p>
                    {agentLink.documentIds.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 italic">No documents linked</p>
                    ) : (
                      agentLink.documentIds.map((docId) => {
                        const doc = documents.find((d) => d.id === docId);
                        if (!doc) return null;
                        return (
                          <div
                            key={docId}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs text-foreground truncate">{doc.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                              onClick={() => handleUnlinkDocument(agentLink.id, docId)}
                            >
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Link new document dropdown */}
                  <Select
                    onValueChange={(docId) => handleLinkDocument(agentLink.id, docId)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white/[0.03] border-white/10">
                      <SelectValue placeholder="Link a document..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documents
                        .filter((d) => !agentLink.documentIds.includes(d.id))
                        .map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Upload Dialog ────────────────────────────── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-heading">
              <Upload className="h-5 w-5 text-primary" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Add a new document to the knowledge base for your AI agents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* File name */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Document Name
              </label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g., HIPAA Training Guide 2024"
                className="bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Category
              </label>
              <Select
                value={uploadCategory}
                onValueChange={(val) => setUploadCategory(val as DocumentCategory)}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Description
              </label>
              <Textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of the document contents..."
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 min-h-[80px]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Tags
              </label>
              <Input
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="Comma-separated tags, e.g., HIPAA, compliance, training"
                className="bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Separate tags with commas</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadOpen(false)}
              className="border-white/10 text-muted-foreground hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
