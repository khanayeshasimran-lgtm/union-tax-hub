import { useState, useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { MFAChallenge } from "@/components/MFAChallenge";

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
import RejectionAnalytics from "./pages/RejectionAnalytics";
import ClientPortal from "./pages/ClientPortal";

const queryClient = new QueryClient();


// ─────────────────────────────────────────────────────────────
// Protected Route
// Handles:
// 1) Auth check
// 2) MFA check
// 3) Layout render
// ─────────────────────────────────────────────────────────────

function ProtectedRoute({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const { user, loading } = useAuth();

  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    supabase.auth.mfa
      .getAuthenticatorAssuranceLevel()
      .then(({ data }) => {
        if (data?.nextLevel === "aal2" && data?.currentLevel === "aal1") {
          supabase.auth.mfa.listFactors().then(({ data: factors }) => {
            const totp = factors?.totp?.[0];
            if (totp) setMfaFactorId(totp.id);
          });
        }
      });
  }, [user]);

  // Loading state
  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // MFA required
  if (mfaFactorId) {
    return (
      <MFAChallenge
        factorId={mfaFactorId}
        onSuccess={() => setMfaFactorId(null)}
      />
    );
  }

  // Normal page render
  return (
    <AppLayout>
      <ErrorBoundary label={label}>{children}</ErrorBoundary>
    </AppLayout>
  );
}


// ─────────────────────────────────────────────────────────────
// Auth Route
// Redirect logged in users away from login page
// ─────────────────────────────────────────────────────────────

function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading && !user) {
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


// ─────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />

            <Route
              path="/"
              element={
                <ProtectedRoute label="Dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leads"
              element={
                <ProtectedRoute label="Leads">
                  <Leads />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calls"
              element={
                <ProtectedRoute label="Call Queue">
                  <CallWorkflow />
                </ProtectedRoute>
              }
            />

            <Route
              path="/followups"
              element={
                <ProtectedRoute label="Follow-Ups">
                  <FollowUps />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases"
              element={
                <ProtectedRoute label="Cases">
                  <Cases />
                </ProtectedRoute>
              }
            />

            <Route
              path="/intake"
              element={
                <ProtectedRoute label="Client Intake">
                  <ClientIntake />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estimations"
              element={
                <ProtectedRoute label="Estimations">
                  <Estimations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents"
              element={
                <ProtectedRoute label="Documents">
                  <Documents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/revenue"
              element={
                <ProtectedRoute label="Revenue">
                  <Revenue />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute label="Leaderboard">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute label="Audit Trail">
                  <AuditTrail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute label="Settings">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal"
              element={
                <ProtectedRoute label="Client Portal">
                  <ClientPortal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rejections"
              element={
                <ProtectedRoute label="Rejection Analytics">
                  <RejectionAnalytics />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;