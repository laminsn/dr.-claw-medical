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
import AdminDashboard from "./pages/AdminDashboard";
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
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
