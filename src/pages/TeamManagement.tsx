import { useState } from "react";
import {
  Users,
  Mail,
  Shield,
  UserPlus,
  Settings,
  Trash2,
  Bot,
  Crown,
  Pencil,
  Eye,
  Wrench,
  Clock,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Role = "Owner" | "Admin" | "Editor" | "Viewer" | "Custom";
type MemberStatus = "Active" | "Pending";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  agentAccess: string;
  avatarColor: string;
  customPermissions: string[];
  lastSeen?: string;
  department?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const allPermissions = [
  "View Dashboard",
  "Create Agents",
  "Edit Agents",
  "Delete Agents",
  "Manage Skills",
  "Manage Integrations",
  "View Reports",
  "Manage Billing",
];

const roleColors: Record<Role, string> = {
  Owner: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Admin: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Editor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Viewer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Custom: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const avatarColors: Record<Role, string> = {
  Owner: "bg-amber-500/20 text-amber-400",
  Admin: "bg-blue-500/20 text-blue-400",
  Editor: "bg-violet-500/20 text-violet-400",
  Viewer: "bg-emerald-500/20 text-emerald-400",
  Custom: "bg-rose-500/20 text-rose-400",
};

const roleDescriptions: Record<Exclude<Role, "Owner">, string> = {
  Admin:
    "Full access to all agents, settings, and team management",
  Editor:
    "Can create/edit agents and skills, but cannot manage team or billing",
  Viewer:
    "Read-only access to dashboards and agent outputs",
  Custom: "Set specific permissions per agent",
};

const roleIcons: Record<Exclude<Role, "Owner">, React.ReactNode> = {
  Admin: <Crown className="h-5 w-5" />,
  Editor: <Pencil className="h-5 w-5" />,
  Viewer: <Eye className="h-5 w-5" />,
  Custom: <Wrench className="h-5 w-5" />,
};

// ---------------------------------------------------------------------------
// Initial sample data
// ---------------------------------------------------------------------------
const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    email: "sarah@clinic.com",
    role: "Owner",
    status: "Active",
    agentAccess: "All Agents",
    avatarColor: avatarColors.Owner,
    customPermissions: [...allPermissions],
    lastSeen: "Just now",
    department: "Administration",
  },
  {
    id: "2",
    name: "James Wilson",
    email: "james@clinic.com",
    role: "Admin",
    status: "Active",
    agentAccess: "All Agents",
    avatarColor: avatarColors.Admin,
    customPermissions: [...allPermissions],
    lastSeen: "5 min ago",
    department: "Operations",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    email: "maria@clinic.com",
    role: "Editor",
    status: "Active",
    agentAccess: "8 Agents",
    avatarColor: avatarColors.Editor,
    customPermissions: [
      "View Dashboard",
      "Create Agents",
      "Edit Agents",
      "Manage Skills",
      "View Reports",
    ],
    lastSeen: "12 min ago",
    department: "Marketing",
  },
  {
    id: "4",
    name: "Kevin Park",
    email: "kevin@clinic.com",
    role: "Editor",
    status: "Active",
    agentAccess: "5 Agents",
    avatarColor: avatarColors.Editor,
    customPermissions: [
      "View Dashboard",
      "Create Agents",
      "Edit Agents",
      "Manage Skills",
      "View Reports",
    ],
    lastSeen: "1 hour ago",
    department: "Clinical",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa@clinic.com",
    role: "Viewer",
    status: "Active",
    agentAccess: "3 Agents",
    avatarColor: avatarColors.Viewer,
    customPermissions: ["View Dashboard", "View Reports"],
    lastSeen: "3 hours ago",
    department: "Billing",
  },
  {
    id: "6",
    name: "David Kim",
    email: "david@clinic.com",
    role: "Admin",
    status: "Pending",
    agentAccess: "All Agents",
    avatarColor: avatarColors.Admin,
    customPermissions: [...allPermissions],
    department: "IT",
  },
  {
    id: "7",
    name: "Rachel Green",
    email: "rachel@clinic.com",
    role: "Viewer",
    status: "Pending",
    agentAccess: "3 Agents",
    avatarColor: avatarColors.Viewer,
    customPermissions: ["View Dashboard", "View Reports"],
    department: "HR",
  },
  {
    id: "8",
    name: "Tom Bradley",
    email: "tom@clinic.com",
    role: "Editor",
    status: "Active",
    agentAccess: "6 Agents",
    avatarColor: avatarColors.Editor,
    customPermissions: [
      "View Dashboard",
      "Create Agents",
      "Edit Agents",
      "Manage Skills",
      "View Reports",
    ],
    lastSeen: "30 min ago",
    department: "Research",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, "").split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : "";
  return (first + last).toUpperCase();
}

let nextId = 9;

// ---------------------------------------------------------------------------
// Role Selector Sub-component
// ---------------------------------------------------------------------------
function RoleSelector({
  selected,
  onChange,
}: {
  selected: Exclude<Role, "Owner">;
  onChange: (role: Exclude<Role, "Owner">) => void;
}) {
  const roles: Exclude<Role, "Owner">[] = ["Admin", "Editor", "Viewer", "Custom"];

  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`rounded-xl border p-3 text-left transition-all ${
            selected === role
              ? "border-primary bg-primary/10 shadow-glow-sm"
              : "border-white/[0.06] bg-card hover:border-white/15 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`${
                selected === role ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {roleIcons[role]}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {role}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {roleDescriptions[role]}
          </p>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Permissions Checkboxes Sub-component
// ---------------------------------------------------------------------------
function PermissionsChecklist({
  permissions,
  onChange,
}: {
  permissions: string[];
  onChange: (permissions: string[]) => void;
}) {
  const toggle = (perm: string) => {
    if (permissions.includes(perm)) {
      onChange(permissions.filter((p) => p !== perm));
    } else {
      onChange([...permissions, perm]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
      {allPermissions.map((perm) => (
        <label
          key={perm}
          className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        >
          <Checkbox
            checked={permissions.includes(perm)}
            onCheckedChange={() => toggle(perm)}
          />
          <span>{perm}</span>
        </label>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const TeamManagement = () => {
  const { toast } = useToast();

  // Team members state
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(initialMembers);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] =
    useState<Exclude<Role, "Owner">>("Editor");
  const [invitePermissions, setInvitePermissions] = useState<string[]>([
    "View Dashboard",
    "View Reports",
  ]);

  // Edit member dialog state
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] =
    useState<Exclude<Role, "Owner">>("Editor");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Computed stats
  // ---------------------------------------------------------------------------
  const totalMembers = teamMembers.length;
  const activeNow = teamMembers.filter((m) => m.status === "Active").length;
  const pendingInvites = teamMembers.filter(
    (m) => m.status === "Pending",
  ).length;
  const rolesUsed = new Set(teamMembers.map((m) => m.role)).size;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const role = inviteRole;
    const newMember: TeamMember = {
      id: String(nextId++),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role,
      status: "Pending",
      agentAccess:
        role === "Admin" ? "All Agents" : role === "Viewer" ? "3 Agents" : "5 Agents",
      avatarColor: avatarColors[role],
      customPermissions:
        role === "Custom" ? [...invitePermissions] : [],
    };

    setTeamMembers((prev) => [...prev, newMember]);

    toast({
      title: "Invite Sent",
      description: `An invitation has been sent to ${inviteEmail.trim()}.`,
    });

    // Reset form
    setInviteEmail("");
    setInviteName("");
    setInviteRole("Editor");
    setInvitePermissions(["View Dashboard", "View Reports"]);
    setInviteOpen(false);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditMember(member);
    setEditRole(member.role === "Owner" ? "Admin" : member.role);
    setEditPermissions([...member.customPermissions]);
  };

  const handleSaveEdit = () => {
    if (!editMember) return;

    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === editMember.id
          ? {
              ...m,
              role: editRole,
              avatarColor: avatarColors[editRole],
              customPermissions:
                editRole === "Custom" ? [...editPermissions] : m.customPermissions,
              agentAccess:
                editRole === "Admin"
                  ? "All Agents"
                  : editRole === "Viewer"
                    ? "3 Agents"
                    : m.agentAccess,
            }
          : m,
      ),
    );

    toast({
      title: "Role Updated",
      description: `${editMember.name}'s role has been updated to ${editRole}.`,
    });

    setEditMember(null);
  };

  const handleRemove = (member: TeamMember) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast({
      title: "Member Removed",
      description: `${member.name} has been removed from the team.`,
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                Team Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Invite teammates, manage roles, and control access to your AI
                agents.
              </p>
            </div>
            <Button
              className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity w-fit"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Teammate
            </Button>
          </div>

          {/* ── Stats Row ──────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Members */}
            <div className="glass-card card-hover rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalMembers}
                </p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>

            {/* Active Now */}
            <div className="glass-card card-hover rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeNow}
                </p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </div>

            {/* Pending Invites */}
            <div className="glass-card card-hover rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingInvites}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending Invites
                </p>
              </div>
            </div>

            {/* Roles Defined */}
            <div className="glass-card card-hover rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {rolesUsed}
                </p>
                <p className="text-xs text-muted-foreground">Roles Defined</p>
              </div>
            </div>
          </div>

          {/* ── Team Members List ──────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-4">
              Team Members
            </h2>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-xl border border-white/[0.06] p-4 flex flex-col sm:flex-row sm:items-center gap-4 card-hover transition-all"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[member.role]}`}
                    >
                      {getInitials(member.name)}
                    </div>

                    {/* Name & Email */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {member.name}
                        </p>
                        {/* Status indicator */}
                        {member.status === "Active" ? (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-yellow-400">
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                            Pending Invite
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <span>{member.email}</span>
                        {member.department && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                            {member.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges + Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Last Seen */}
                    {member.lastSeen && (
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 min-w-[70px]">
                        <Clock className="h-3 w-3" />
                        {member.lastSeen}
                      </span>
                    )}

                    {/* Role Badge */}
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${roleColors[member.role]}`}
                    >
                      {member.role}
                    </Badge>

                    {/* Agent Access Badge */}
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-white/5 text-muted-foreground border-white/10"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      {member.agentAccess}
                    </Badge>

                    <Separator orientation="vertical" className="h-6 hidden sm:block" />

                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
                      onClick={() => handleOpenEdit(member)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRemove(member)}
                      disabled={member.role === "Owner"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Invite Teammate Dialog ───────────────────── */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setInviteOpen(false);
            setInviteEmail("");
            setInviteName("");
            setInviteRole("Editor");
            setInvitePermissions(["View Dashboard", "View Reports"]);
          }
        }}
      >
        <DialogContent className="max-w-lg glass-card border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading">
              Invite Teammate
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an invitation to join your team and collaborate on AI agents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@clinic.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="invite-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="invite-name"
                type="text"
                placeholder="Jane Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Role Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Role</Label>
              <RoleSelector
                selected={inviteRole}
                onChange={setInviteRole}
              />
            </div>

            {/* Custom Permissions */}
            {inviteRole === "Custom" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="bg-card rounded-xl border border-white/[0.06] p-4">
                  <PermissionsChecklist
                    permissions={invitePermissions}
                    onChange={setInvitePermissions}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
              disabled={!inviteEmail.trim() || !inviteName.trim()}
              onClick={handleInvite}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Member Dialog ───────────────────────── */}
      <Dialog
        open={!!editMember}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
      >
        {editMember && (
          <DialogContent className="max-w-lg glass-card border-white/10 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-heading">
                Edit Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update role and permissions for this team member.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Member Info (read-only) */}
              <div className="flex items-center gap-3 bg-card rounded-xl border border-white/[0.06] p-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[editMember.role]}`}
                >
                  {getInitials(editMember.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {editMember.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editMember.email}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Role Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Role</Label>
                <RoleSelector selected={editRole} onChange={setEditRole} />
              </div>

              {/* Custom Permissions */}
              {editRole === "Custom" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="bg-card rounded-xl border border-white/[0.06] p-4">
                    <PermissionsChecklist
                      permissions={editPermissions}
                      onChange={setEditPermissions}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                onClick={handleSaveEdit}
              >
                <Settings className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default TeamManagement;
