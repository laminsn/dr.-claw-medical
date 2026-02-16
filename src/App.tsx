import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Terms />} />
            <Route path="/security" element={<Terms />} />
            <Route path="/compliance/:type" element={<Terms />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
