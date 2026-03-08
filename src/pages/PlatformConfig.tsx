/**
 * PlatformConfig — Admin-only page for managing Skills, MCPs, and Hooks.
 * Protected by AdminRoute. Only admin/master_admin can access.
 */

import { Settings2, Code2, Webhook, Blocks } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillsManager from "@/components/admin/SkillsManager";
import McpsManager from "@/components/admin/McpsManager";
import HooksManager from "@/components/admin/HooksManager";

const PlatformConfig = () => {
  return (
    <DashboardLayout>

      <main className="flex-1 p-6 md:p-8 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground">
                  Platform Configuration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admin-only. Manage skills, MCPs, and hooks applied to all agents.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="skills" className="space-y-4">
            <TabsList className="bg-white/[0.03] border border-white/[0.06]">
              <TabsTrigger value="skills" className="gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="mcps" className="gap-1.5">
                <Blocks className="h-3.5 w-3.5" />
                MCPs
              </TabsTrigger>
              <TabsTrigger value="hooks" className="gap-1.5">
                <Webhook className="h-3.5 w-3.5" />
                Hooks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <SkillsManager />
            </TabsContent>

            <TabsContent value="mcps">
              <McpsManager />
            </TabsContent>

            <TabsContent value="hooks">
              <HooksManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default PlatformConfig;
