import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  CalendarCheck,
  MessageSquare,
  Star,
  Search,
  Clock,
  Phone,
  Mail,
  Reply,
  Heart,
  Activity,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Circle,
  Bot,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PatientStatus = "Active" | "Inactive" | "New";

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit: string;
  status: PatientStatus;
  assignedAgent: string;
}

type AppointmentType =
  | "Follow-up"
  | "New Patient"
  | "Telehealth"
  | "Lab Review"
  | "Consultation";

type AppointmentStatus = "Checked In" | "Waiting" | "In Progress" | "Completed";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
}

interface PatientMessage {
  id: string;
  patientName: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  priority: "normal" | "high" | "urgent";
}

interface CarePlan {
  id: string;
  patientName: string;
  condition: string;
  progress: number;
  nextMilestone: string;
}

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const PATIENT_STATUS_STYLES: Record<PatientStatus, string> = {
  Active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  Inactive: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
  New: "bg-blue-500/15 border-blue-500/30 text-blue-400",
};

const APPOINTMENT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  "Checked In": "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  Waiting: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  "In Progress": "bg-blue-500/15 border-blue-500/30 text-blue-400",
  Completed: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
};

const MESSAGE_PRIORITY_STYLES: Record<string, string> = {
  normal: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
  high: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  urgent: "bg-red-500/15 border-red-500/30 text-red-400",
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockPatients: Patient[] = [
  {
    id: "pt-1",
    name: "Maria Gonzalez",
    dob: "03/14/1985",
    phone: "(555) 234-5678",
    lastVisit: "02/10/2026",
    status: "Active",
    assignedAgent: "Dr. Front Desk",
  },
  {
    id: "pt-2",
    name: "James Whitfield",
    dob: "11/22/1972",
    phone: "(555) 345-6789",
    lastVisit: "01/28/2026",
    status: "Active",
    assignedAgent: "Dr. Front Desk",
  },
  {
    id: "pt-3",
    name: "Aisha Patel",
    dob: "07/05/1990",
    phone: "(555) 456-7890",
    lastVisit: "02/14/2026",
    status: "New",
    assignedAgent: "Doc Collector",
  },
  {
    id: "pt-4",
    name: "Robert Chen",
    dob: "01/30/1968",
    phone: "(555) 567-8901",
    lastVisit: "12/15/2025",
    status: "Inactive",
    assignedAgent: "Dr. Front Desk",
  },
  {
    id: "pt-5",
    name: "Emily Nakamura",
    dob: "09/18/1995",
    phone: "(555) 678-9012",
    lastVisit: "02/12/2026",
    status: "Active",
    assignedAgent: "HR Helper",
  },
  {
    id: "pt-6",
    name: "David Okonkwo",
    dob: "04/25/1980",
    phone: "(555) 789-0123",
    lastVisit: "02/08/2026",
    status: "Active",
    assignedAgent: "Dr. Front Desk",
  },
  {
    id: "pt-7",
    name: "Sarah Mitchell",
    dob: "12/01/1988",
    phone: "(555) 890-1234",
    lastVisit: "02/15/2026",
    status: "New",
    assignedAgent: "Doc Collector",
  },
  {
    id: "pt-8",
    name: "Thomas Rivera",
    dob: "06/12/1975",
    phone: "(555) 901-2345",
    lastVisit: "11/20/2025",
    status: "Inactive",
    assignedAgent: "Dr. Front Desk",
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    patientName: "Maria Gonzalez",
    time: "9:00 AM",
    type: "Follow-up",
    status: "Checked In",
  },
  {
    id: "apt-2",
    patientName: "Aisha Patel",
    time: "9:30 AM",
    type: "New Patient",
    status: "Waiting",
  },
  {
    id: "apt-3",
    patientName: "James Whitfield",
    time: "10:15 AM",
    type: "Telehealth",
    status: "In Progress",
  },
  {
    id: "apt-4",
    patientName: "Emily Nakamura",
    time: "11:00 AM",
    type: "Lab Review",
    status: "Waiting",
  },
  {
    id: "apt-5",
    patientName: "David Okonkwo",
    time: "1:30 PM",
    type: "Consultation",
    status: "Checked In",
  },
  {
    id: "apt-6",
    patientName: "Sarah Mitchell",
    time: "2:00 PM",
    type: "New Patient",
    status: "Completed",
  },
];

const mockMessages: PatientMessage[] = [
  {
    id: "msg-1",
    patientName: "Maria Gonzalez",
    subject: "Medication refill request",
    preview:
      "Hi, I need to request a refill for my blood pressure medication. The pharmacy said they need a new authorization from...",
    timestamp: "10 min ago",
    read: false,
    priority: "high",
  },
  {
    id: "msg-2",
    patientName: "James Whitfield",
    subject: "Question about lab results",
    preview:
      "I received my lab results through the portal but I'm not sure I understand the cholesterol numbers. Could someone explain...",
    timestamp: "45 min ago",
    read: false,
    priority: "normal",
  },
  {
    id: "msg-3",
    patientName: "Aisha Patel",
    subject: "Insurance card update",
    preview:
      "I recently changed my insurance provider and need to update my information on file. My new insurance is Blue Cross...",
    timestamp: "2 hours ago",
    read: true,
    priority: "normal",
  },
  {
    id: "msg-4",
    patientName: "Emily Nakamura",
    subject: "Severe headache - need urgent advice",
    preview:
      "I have been experiencing a severe headache for the past 3 days that is not responding to OTC pain relievers. Should I come in or...",
    timestamp: "3 hours ago",
    read: false,
    priority: "urgent",
  },
  {
    id: "msg-5",
    patientName: "David Okonkwo",
    subject: "Post-surgery follow-up scheduling",
    preview:
      "I had my knee surgery last week and need to schedule my two-week follow-up appointment. What times are available next...",
    timestamp: "5 hours ago",
    read: true,
    priority: "normal",
  },
];

const mockCarePlans: CarePlan[] = [
  {
    id: "cp-1",
    patientName: "Maria Gonzalez",
    condition: "Hypertension Management",
    progress: 72,
    nextMilestone: "Blood pressure target < 130/80 by March",
  },
  {
    id: "cp-2",
    patientName: "James Whitfield",
    condition: "Type 2 Diabetes Control",
    progress: 55,
    nextMilestone: "HbA1c recheck in 4 weeks",
  },
  {
    id: "cp-3",
    patientName: "David Okonkwo",
    condition: "Post-Op Knee Rehabilitation",
    progress: 25,
    nextMilestone: "Physical therapy evaluation at 2 weeks",
  },
  {
    id: "cp-4",
    patientName: "Emily Nakamura",
    condition: "Migraine Prevention Program",
    progress: 40,
    nextMilestone: "Headache diary review at next visit",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PatientPortal = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [patients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [messages, setMessages] = useState<PatientMessage[]>(mockMessages);
  const [carePlans] = useState<CarePlan[]>(mockCarePlans);

  // --- i18n label maps ---
  const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
    Active: t("patientPortal.statusActive"),
    Inactive: t("patientPortal.statusInactive"),
    New: t("patientPortal.statusNew"),
  };

  const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
    "Checked In": t("patientPortal.statusCheckedIn"),
    Waiting: t("patientPortal.statusWaiting"),
    "In Progress": t("patientPortal.statusInProgress"),
    Completed: t("patientPortal.statusCompleted"),
  };

  const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
    "Follow-up": t("patientPortal.typeFollowUp"),
    "New Patient": t("patientPortal.typeNewPatient"),
    Telehealth: t("patientPortal.typeTelehealth"),
    "Lab Review": t("patientPortal.typeLabReview"),
    Consultation: t("patientPortal.typeConsultation"),
  };

  const PRIORITY_LABELS: Record<string, string> = {
    normal: t("patientPortal.priorityNormal"),
    high: t("patientPortal.priorityHigh"),
    urgent: t("patientPortal.priorityUrgent"),
  };

  // Derived
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activePatients = patients.filter((p) => p.status === "Active").length;
  const appointmentsToday = appointments.length;
  const pendingMessages = messages.filter((m) => !m.read).length;
  const satisfactionScore = 4.8;

  // Actions
  const handleReply = (msg: PatientMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
    );
    toast({
      title: t("patientPortal.toastReplySent"),
      description: t("patientPortal.toastReplySentDesc", { name: msg.patientName }),
    });
  };

  const handleMarkRead = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m)),
    );
    toast({
      title: t("patientPortal.toastMessageMarkedRead"),
      description: t("patientPortal.toastMessageMarkedReadDesc"),
    });
  };

  const handleViewPatient = (patient: Patient) => {
    toast({
      title: t("patientPortal.toastPatientRecordOpened"),
      description: t("patientPortal.toastViewingRecord", { name: patient.name }),
    });
  };

  const handleCheckIn = (apt: Appointment) => {
    const statusFlow: Record<AppointmentStatus, AppointmentStatus> = {
      "Waiting": "Checked In",
      "Checked In": "In Progress",
      "In Progress": "Completed",
      "Completed": "Completed",
    };
    const newStatus = statusFlow[apt.status];
    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, status: newStatus } : a)),
    );
    toast({
      title: t("patientPortal.toastStatusUpdated"),
      description: t("patientPortal.toastStatusUpdatedDesc", { name: apt.patientName, status: APPOINTMENT_STATUS_LABELS[newStatus] }),
    });
  };

  const handleViewCarePlan = (plan: CarePlan) => {
    toast({
      title: t("patientPortal.toastCarePlanOpened"),
      description: t("patientPortal.toastViewingCarePlan", { name: plan.patientName, condition: plan.condition }),
    });
  };

  // ---------------------------------------------------------------------------
  // Stat Cards
  // ---------------------------------------------------------------------------

  const statsCards = [
    {
      label: t("patientPortal.activePatients"),
      value: activePatients,
      icon: Users,
      gradient: true,
    },
    {
      label: t("patientPortal.appointmentsToday"),
      value: appointmentsToday,
      icon: CalendarCheck,
      gradient: true,
    },
    {
      label: t("patientPortal.pendingMessages"),
      value: pendingMessages,
      icon: MessageSquare,
      gradient: true,
    },
    {
      label: t("patientPortal.satisfactionScore"),
      value: `${satisfactionScore}/5`,
      icon: Star,
      gradient: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("patientPortal.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("patientPortal.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="patients" className="space-y-6">
            <TabsList className="bg-card/50 border border-border">
              <TabsTrigger value="patients" className="gap-1.5">
                <Users className="h-4 w-4" />
                {t("patientPortal.patients")}
              </TabsTrigger>
              <TabsTrigger value="appointments" className="gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                {t("patientPortal.appointments")}
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {t("patientPortal.messages")}
                {pendingMessages > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-1 text-[10px] border-red-500/30 text-red-400 bg-red-500/10 px-1.5 py-0"
                  >
                    {pendingMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="careplans" className="gap-1.5">
                <ClipboardList className="h-4 w-4" />
                {t("patientPortal.carePlans")}
              </TabsTrigger>
            </TabsList>

            {/* ============================================================= */}
            {/* PATIENTS TAB                                                   */}
            {/* ============================================================= */}
            <TabsContent value="patients">
              <div className="bg-card rounded-xl border border-white/[0.06] card-hover">
                <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                  <h2 className="font-display font-semibold text-foreground text-sm">
                    {t("patientPortal.patientList")}
                  </h2>
                  <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("patientPortal.searchPatientsPlaceholder")}
                      className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("patientPortal.columnPatient")}</TableHead>
                      <TableHead>{t("patientPortal.columnDob")}</TableHead>
                      <TableHead>{t("patientPortal.columnPhone")}</TableHead>
                      <TableHead>{t("patientPortal.columnLastVisit")}</TableHead>
                      <TableHead>{t("patientPortal.columnStatus")}</TableHead>
                      <TableHead>{t("patientPortal.columnAssignedAgent")}</TableHead>
                      <TableHead className="text-right">{t("patientPortal.columnActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {patient.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {patient.dob}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {patient.lastVisit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] border ${PATIENT_STATUS_STYLES[patient.status]} px-2 py-0.5`}
                          >
                            {PATIENT_STATUS_LABELS[patient.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Bot className="h-3 w-3" />
                            {patient.assignedAgent}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs border-border text-muted-foreground hover:text-foreground"
                            onClick={() => handleViewPatient(patient)}
                          >
                            {t("patientPortal.viewRecord")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">
                            {t("patientPortal.noPatientsMatch")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ============================================================= */}
            {/* APPOINTMENTS TAB                                               */}
            {/* ============================================================= */}
            <TabsContent value="appointments">
              <div className="bg-card rounded-xl border border-white/[0.06] card-hover">
                <div className="p-5 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    {t("patientPortal.todaysAppointmentQueue")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("patientPortal.appointmentsScheduledToday", { count: appointments.length })}
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                          <Clock className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {apt.patientName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.time}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-border text-foreground/70 px-2 py-0"
                            >
                              {APPOINTMENT_TYPE_LABELS[apt.type]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] border ${APPOINTMENT_STATUS_STYLES[apt.status]} px-2 py-0.5`}
                        >
                          {apt.status === "Checked In" && (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          {apt.status === "Waiting" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {apt.status === "In Progress" && (
                            <Activity className="h-3 w-3 mr-1" />
                          )}
                          {apt.status === "Completed" && (
                            <Circle className="h-3 w-3 mr-1" />
                          )}
                          {APPOINTMENT_STATUS_LABELS[apt.status]}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs border-border text-muted-foreground hover:text-foreground"
                          onClick={() => handleCheckIn(apt)}
                        >
                          {t("patientPortal.updateStatus")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ============================================================= */}
            {/* MESSAGES TAB                                                   */}
            {/* ============================================================= */}
            <TabsContent value="messages">
              <div className="bg-card rounded-xl border border-white/[0.06] card-hover">
                <div className="p-5 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {t("patientPortal.patientMessagesInbox")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingMessages} {pendingMessages !== 1 ? t("patientPortal.unreadMessagesPlural") : t("patientPortal.unreadMessageSingular")}
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 hover:bg-white/[0.02] transition-colors ${
                        !msg.read ? "bg-white/[0.01]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {!msg.read && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                          {msg.read && <div className="h-2.5 w-2.5 shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-sm font-semibold ${
                                  !msg.read
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {msg.patientName}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] border ${MESSAGE_PRIORITY_STYLES[msg.priority]} px-1.5 py-0`}
                              >
                                {msg.priority === "urgent" && (
                                  <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                                )}
                                {PRIORITY_LABELS[msg.priority]}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                                {msg.timestamp}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${
                                !msg.read
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {msg.subject}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {msg.preview}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!msg.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg text-xs border-border text-muted-foreground hover:text-foreground"
                              onClick={() => handleMarkRead(msg.id)}
                            >
                              {t("patientPortal.markRead")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="rounded-lg text-xs bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-glow-sm hover:opacity-90"
                            onClick={() => handleReply(msg)}
                          >
                            <Reply className="h-3.5 w-3.5 mr-1" />
                            {t("patientPortal.reply")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ============================================================= */}
            {/* CARE PLANS TAB                                                 */}
            {/* ============================================================= */}
            <TabsContent value="careplans">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      {t("patientPortal.activeCarePlans")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("patientPortal.activeCarePlansTracked", { count: carePlans.length })}
                    </p>
                  </div>
                </div>

                <Separator className="border-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carePlans.map((plan) => {
                    const progressColor =
                      plan.progress >= 70
                        ? "bg-emerald-500"
                        : plan.progress >= 40
                          ? "bg-amber-500"
                          : "bg-red-500";

                    return (
                      <div
                        key={plan.id}
                        className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {plan.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {plan.condition}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] border px-2 py-0.5 ${
                              plan.progress >= 70
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : plan.progress >= 40
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                  : "bg-red-500/15 border-red-500/30 text-red-400"
                            }`}
                          >
                            {plan.progress}%
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ClipboardList className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {t("patientPortal.next")}: {plan.nextMilestone}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs border-border text-muted-foreground hover:text-foreground shrink-0 ml-2"
                            onClick={() => handleViewCarePlan(plan)}
                          >
                            {t("patientPortal.viewPlan")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
