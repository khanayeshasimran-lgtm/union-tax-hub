import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import CallWorkflow from "./pages/CallWorkflow";
import FollowUps from "./pages/FollowUps";
import Cases from "./pages/Cases";
import Revenue from "./pages/Revenue";
import Leaderboard from "./pages/Leaderboard";
import AuditTrail from "./pages/AuditTrail";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Documents from "./pages/Documents";
import ClientIntake from "./pages/ClientIntake";
import Estimations from "./pages/Estimations";

const queryClient = new QueryClient();

// ── Auth guard — redirects to /auth if not logged in ─────────────────────────
function ProtectedRoute({ children, label }: { children: React.ReactNode; label: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <ErrorBoundary label={label}>
        {children}
      </ErrorBoundary>
    </AppLayout>
  );
}

// ── Auth page — redirects to / if already logged in ──────────────────────────
function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <ErrorBoundary label="Auth">
      <Auth />
    </ErrorBoundary>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* Top-level boundary catches anything ErrorBoundary misses */}
          <ErrorBoundary label="Application">
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />

              <Route path="/"
                element={<ProtectedRoute label="Dashboard"><Dashboard /></ProtectedRoute>} />

              <Route path="/leads"
                element={<ProtectedRoute label="Leads"><Leads /></ProtectedRoute>} />

              <Route path="/calls"
                element={<ProtectedRoute label="Call Queue"><CallWorkflow /></ProtectedRoute>} />

              <Route path="/followups"
                element={<ProtectedRoute label="Follow-Ups"><FollowUps /></ProtectedRoute>} />

              <Route path="/cases"
                element={<ProtectedRoute label="Cases"><Cases /></ProtectedRoute>} />

              <Route path="/intake"
                element={<ProtectedRoute label="Client Intake"><ClientIntake /></ProtectedRoute>} />

              <Route path="/estimations"
                element={<ProtectedRoute label="Estimations"><Estimations /></ProtectedRoute>} />

              <Route path="/documents"
                element={<ProtectedRoute label="Documents"><Documents /></ProtectedRoute>} />

              <Route path="/revenue"
                element={<ProtectedRoute label="Revenue"><Revenue /></ProtectedRoute>} />

              <Route path="/leaderboard"
                element={<ProtectedRoute label="Leaderboard"><Leaderboard /></ProtectedRoute>} />

              <Route path="/audit"
                element={<ProtectedRoute label="Audit Trail"><AuditTrail /></ProtectedRoute>} />

              <Route path="/settings"
                element={<ProtectedRoute label="Settings"><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;