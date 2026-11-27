import { useEffect } from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { ComplaintsProvider } from "@/store/ComplaintsContext";
import { ToastProvider } from "@/store/ToastContext";
import { CitizenLayout } from "@/components/citizen/CitizenLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";

import Home from "@/pages/citizen/Home";
import VoiceReport from "@/pages/citizen/VoiceReport";
import ManualReport from "@/pages/citizen/ManualReport";
import ChatReport from "@/pages/citizen/ChatReport";
import Explore from "@/pages/citizen/Explore";
import MyReports from "@/pages/citizen/MyReports";
import ComplaintDetail from "@/pages/citizen/ComplaintDetail";
import Profile from "@/pages/citizen/Profile";

import AdminOverview from "@/pages/admin/AdminOverview";
import AdminComplaints from "@/pages/admin/AdminComplaints";
import AdminComplaintDetail from "@/pages/admin/AdminComplaintDetail";
import AdminMap from "@/pages/admin/AdminMap";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminVerification from "@/pages/admin/AdminVerification";
import AdminSettings from "@/pages/admin/AdminSettings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <span className="rounded-2xl bg-brand-50 p-4 text-brand-600">
        <Compass size={28} />
      </span>
      <div>
        <h1 className="text-2xl font-extrabold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          This screen isn't part of the NagarMitra demo.
        </p>
      </div>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ComplaintsProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<CitizenLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ChatReport />} />
            <Route path="/report/chat" element={<ChatReport />} />
            <Route path="/report/voice" element={<VoiceReport />} />
            <Route path="/report/manual" element={<ManualReport />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/reports" element={<MyReports />} />
            <Route path="/reports/:id" element={<ComplaintDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="map" element={<AdminMap />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ComplaintsProvider>
    </ToastProvider>
  );
}
