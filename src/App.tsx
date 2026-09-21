import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import SharedPlan from "@/pages/SharedPlan";
import DashboardShell from "@/pages/dashboard/DashboardShell";
import Overview from "@/pages/dashboard/Overview";
import Insights from "@/pages/dashboard/Insights";
import Planner from "@/pages/dashboard/Planner";
import Settings from "@/pages/dashboard/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/plan/:planId" element={<SharedPlan />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardShell />
              </RequireAuth>
            }
          >
            <Route index element={<Overview />} />
            <Route path="insights" element={<Insights />} />
            <Route path="planner" element={<Planner />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(16, 30, 51, 0.95)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
