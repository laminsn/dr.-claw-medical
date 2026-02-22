import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AgentProvider } from "@/hooks/useAgents";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Profile from "./pages/Profile";
import SkillsCenter from "./pages/SkillsCenter";
import TrainingCenter from "./pages/TrainingCenter";
import Integrations from "./pages/Integrations";
import CompanyProfile from "./pages/CompanyProfile";
import TeamManagement from "./pages/TeamManagement";
import AgentCollaboration from "./pages/AgentCollaboration";
import AdminDashboard from "./pages/AdminDashboard";
import AgentCommunication from "./pages/AgentCommunication";
import TaskTracker from "./pages/TaskTracker";
import DataLogs from "./pages/DataLogs";
import Settings from "./pages/Settings";
import Terms from "./pages/Terms";
import PhiMonitor from "./pages/PhiMonitor";
import EmailCampaigns from "./pages/EmailCampaigns";
import PatientPortal from "./pages/PatientPortal";
import ReportingDashboard from "./pages/ReportingDashboard";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import KnowledgeBase from "./pages/KnowledgeBase";
import BillingManagement from "./pages/BillingManagement";
import NotificationsCenter from "./pages/NotificationsCenter";
import AgentPlayground from "./pages/AgentPlayground";
import CustomDashboards from "./pages/CustomDashboards";
import ApiPortal from "./pages/ApiPortal";
import AgentCommandStation from "./pages/AgentCommandStation";
import AgentOrgChart from "./pages/AgentOrgChart";
import AgentDataCenter from "./pages/AgentDataCenter";
import CompanyCards from "./pages/CompanyCards";
import N8nGateway from "./pages/N8nGateway";
import Webhooks from "./pages/Webhooks";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="dr-claw-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AgentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/skills" element={<ProtectedRoute><SkillsCenter /></ProtectedRoute>} />
            <Route path="/dashboard/training" element={<ProtectedRoute><TrainingCenter /></ProtectedRoute>} />
            <Route path="/dashboard/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/dashboard/company" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="/dashboard/collaboration" element={<ProtectedRoute><AgentCollaboration /></ProtectedRoute>} />
            <Route path="/dashboard/communication" element={<ProtectedRoute><AgentCommunication /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><TaskTracker /></ProtectedRoute>} />
            <Route path="/dashboard/logs" element={<ProtectedRoute><DataLogs /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/dashboard/phi-monitor" element={<ProtectedRoute><PhiMonitor /></ProtectedRoute>} />
            <Route path="/dashboard/campaigns" element={<ProtectedRoute><EmailCampaigns /></ProtectedRoute>} />
            <Route path="/dashboard/patients" element={<ProtectedRoute><PatientPortal /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><ReportingDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/workflows" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/dashboard/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/dashboard/billing" element={<ProtectedRoute><BillingManagement /></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsCenter /></ProtectedRoute>} />
            <Route path="/dashboard/playground" element={<ProtectedRoute><AgentPlayground /></ProtectedRoute>} />
            <Route path="/dashboard/custom-dashboards" element={<ProtectedRoute><CustomDashboards /></ProtectedRoute>} />
            <Route path="/dashboard/api" element={<ProtectedRoute><ApiPortal /></ProtectedRoute>} />
            <Route path="/dashboard/command" element={<ProtectedRoute><AgentCommandStation /></ProtectedRoute>} />
            <Route path="/dashboard/org-chart" element={<ProtectedRoute><AgentOrgChart /></ProtectedRoute>} />
            <Route path="/dashboard/data-center" element={<ProtectedRoute><AgentDataCenter /></ProtectedRoute>} />
            <Route path="/dashboard/cards" element={<ProtectedRoute><CompanyCards /></ProtectedRoute>} />
            <Route path="/dashboard/n8n-gateway" element={<ProtectedRoute><N8nGateway /></ProtectedRoute>} />
            <Route path="/dashboard/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Terms />} />
            <Route path="/security" element={<Terms />} />
            <Route path="/compliance/:type" element={<Terms />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AgentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
