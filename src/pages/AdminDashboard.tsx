import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Users,
  Crown,
  UserCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  organization: string | null;
  specialty: string | null;
  role: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const roleBadge: Record<string, string> = {
  master_admin: "bg-destructive/20 text-destructive",
  admin: "bg-primary/20 text-primary",
  manager: "bg-accent/20 text-accent",
  user: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const roleLabels: Record<string, string> = {
    master_admin: t("adminDashboard.roleMasterAdmin"),
    admin: t("adminDashboard.roleAdmin"),
    manager: t("adminDashboard.roleManager"),
    user: t("adminDashboard.roleUser"),
  };

  useEffect(() => {
    const load = async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data as UserProfile[]);
      if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const getUserRole = (userId: string) => {
    const found = roles.find((r) => r.user_id === userId);
    return found?.role || "user";
  };

  type AppRole = Database["public"]["Enums"]["app_role"];
  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    const existing = roles.find((r) => r.user_id === userId);

    if (existing) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as AppRole })
        .eq("user_id", userId);

      if (error) {
        toast({ title: t("adminDashboard.error"), description: error.message, variant: "destructive" });
      } else {
        setRoles((prev) =>
          prev.map((r) => (r.user_id === userId ? { ...r, role: newRole } : r))
        );
        toast({ title: t("adminDashboard.roleUpdated"), description: t("adminDashboard.roleUpdatedDesc", { role: roleLabels[newRole] }) });
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole as AppRole });

      if (error) {
        toast({ title: t("adminDashboard.error"), description: error.message, variant: "destructive" });
      } else {
        setRoles((prev) => [...prev, { user_id: userId, role: newRole }]);
        toast({ title: t("adminDashboard.roleAssigned"), description: t("adminDashboard.roleAssignedDesc", { role: roleLabels[newRole] }) });
      }
    }
    setUpdating(null);
  };

  const adminCount = roles.filter((r) => r.role === "master_admin" || r.role === "admin").length;
  const managerCount = roles.filter((r) => r.role === "manager").length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" /> {t("adminDashboard.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("adminDashboard.subtitle")}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{profiles.length}</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.totalUsers")}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{adminCount}</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.admins")}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{managerCount}</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.managers")}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">HIPAA</p>
                  <p className="text-xs text-muted-foreground">{t("adminDashboard.baaSecured")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-display font-semibold text-foreground text-sm">{t("adminDashboard.allUsers")}</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminDashboard.columnUser")}</TableHead>
                    <TableHead>{t("adminDashboard.columnOrganization")}</TableHead>
                    <TableHead>{t("adminDashboard.columnSpecialty")}</TableHead>
                    <TableHead>{t("adminDashboard.columnRole")}</TableHead>
                    <TableHead>{t("adminDashboard.columnJoined")}</TableHead>
                    <TableHead className="text-right">{t("adminDashboard.columnActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => {
                    const currentRole = getUserRole(profile.user_id);
                    const isCurrentUser = profile.user_id === user?.id;
                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {(profile.full_name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {profile.full_name || t("adminDashboard.unnamedUser")}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-primary">({t("adminDashboard.you")})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {profile.organization || "\u2014"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {profile.specialty || "\u2014"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge[currentRole] || roleBadge.user}`}>
                            {roleLabels[currentRole] || t("adminDashboard.roleUser")}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updating === profile.user_id}
                                className="rounded-lg text-xs gap-1"
                              >
                                {updating === profile.user_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>{t("adminDashboard.changeRole")} <ChevronDown className="h-3 w-3" /></>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Object.entries(roleLabels).map(([key, label]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => updateRole(profile.user_id, key)}
                                  className={currentRole === key ? "bg-primary/10 text-primary" : ""}
                                >
                                  {label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
