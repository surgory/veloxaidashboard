import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import GenerateKeys from "./pages/GenerateKeys";
import AllLicenses from "./pages/AllLicenses";
import ActivationLogs from "./pages/ActivationLogs";
import BannedHWIDs from "./pages/BannedHWIDs";
import Admins from "./pages/Admins";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/generate" element={<GenerateKeys />} />
            <Route path="/licenses" element={<AllLicenses />} />
            <Route path="/logs" element={<ActivationLogs />} />
            <Route path="/banned" element={<BannedHWIDs />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
