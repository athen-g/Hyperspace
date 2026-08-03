import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";

import LandingPage from "./components/LandingPage";
import Blog from "./components/Blog";
import BlogPage from "./components/BlogPage";
import EventsPage from "./components/EventsPage";
import EventPageTemplate from "./components/EventPageTemplate";
import Blog_Home from "./components/Blog_Home";
import News from "./components/News";
import NewsPage from "./components/NewsPage";
import EventRouter from "./components/EventRouter";
import RegistrationsPage from "./components/RegistrationsPage";
import TeamPage from "./components/TeamPage";
import PageTransition from "./components/ui/PageTransition";
import CustomCursor from "./components/ui/CustomCursor";

// Admin imports
import AdminApp from "./admin/AdminApp";
import LoginPage from "./admin/pages/LoginPage";
import RegisterPage from "./admin/pages/RegisterPage";
import DashboardPage from "./admin/pages/DashboardPage";
import AdminEventsPage from "./admin/pages/EventsPage";
import EventDetailPage from "./admin/pages/EventDetailPage";
import AdminRegistrationsPage from "./admin/pages/RegistrationsPage";
import AttendancePage from "./admin/pages/AttendancePage";
import WalkInPage from "./admin/pages/WalkInPage";
import ScannerPage from "./admin/pages/ScannerPage";
import SubscribersPage from "./admin/pages/SubscribersPage";
import MembersPage from "./admin/pages/MembersPage";
import AuditLogPage from "./admin/pages/AuditLogPage";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import ScanRedirect from "./admin/pages/ScanRedirect";
import { supabase } from "./lib/supabase";

// Capture if this page load is due to a Supabase invitation link redirect
// We store this in sessionStorage synchronously at module load time before Supabase Auth strips the parameters.
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;
  if (hash.includes('type=invite') || search.includes('type=invite')) {
    sessionStorage.setItem('pending_invite_redirect', 'true');
  }
}

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hasPendingInvite = sessionStorage.getItem('pending_invite_redirect') === 'true';
    if (hasPendingInvite) {
      // Listen for the session to be established, then redirect to setup password
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          sessionStorage.removeItem('pending_invite_redirect');
          navigate("/admin/register", { replace: true });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [navigate]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#e5e5e5', border: '1px solid #333' } }} />
      <CustomCursor />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Events */}
          <Route path="/events" element={<PageTransition><EventsPage /></PageTransition>} />
          <Route
            path="/events/:slug"
            element={<PageTransition><EventRouter /></PageTransition>}
          />

          {/* Blogs */}
          <Route path="/blogs" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blogs/:slug" element={<PageTransition><BlogPage /></PageTransition>} />

          {/* Team */}
          <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />

          {/* News */}
          <Route
            path="/news"
            element={
              <PageTransition><News /></PageTransition>
            }
          />
          <Route path="/news/:slug" element={<PageTransition><NewsPage /></PageTransition>} />

          <Route path="/register/:slug" element={<PageTransition><RegistrationsPage /></PageTransition>} />

          {/* QR Deep Link */}
          <Route path="/scan" element={<ScanRedirect />} />

          <Route path="/admin" element={<AdminApp />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute><AdminEventsPage /></ProtectedRoute>} />
            <Route path="events/:eventId" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="events/:eventId/registrations" element={<ProtectedRoute><AdminRegistrationsPage /></ProtectedRoute>} />
            <Route path="events/:eventId/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
            <Route path="events/:eventId/walkin" element={<ProtectedRoute roles={['core','super_admin']}><WalkInPage /></ProtectedRoute>} />
            <Route path="scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
            <Route path="subscribers" element={<ProtectedRoute><SubscribersPage /></ProtectedRoute>} />
            <Route path="members" element={<ProtectedRoute roles={['super_admin']}><MembersPage /></ProtectedRoute>} />
            <Route path="logs" element={<ProtectedRoute roles={['super_admin']}><AuditLogPage /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;