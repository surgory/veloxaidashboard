import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import GenerateKeys from "./pages/GenerateKeys";
import AllLicenses from "./pages/AllLicenses";
import ActivationLogs from "./pages/ActivationLogs";
import BannedHWIDs from "./pages/BannedHWIDs";
import Admins from "./pages/Admins";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import AuditLogPage from "./pages/AuditLogPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedApp() {
  const { user, loading, isOwner } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/generate" element={<GenerateKeys />} />
        <Route path="/licenses" element={<AllLicenses />} />
        <Route path="/logs" element={<ActivationLogs />} />
        <Route path="/banned" element={<BannedHWIDs />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/audit" element={<AuditLogPage />} />
        <Route path="/settings" element={isOwner ? <SettingsPage /> : <OwnerOnly />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

function OwnerOnly() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-4">
        <span className="text-2xl">🔒</span>
      </div>
      <h2 className="text-lg font-display font-bold text-foreground mb-1">Owner Access Only</h2>
      <p className="text-sm">This page is restricted to the account owner.</p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedApp />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
