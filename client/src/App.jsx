import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CitizenLayout from "./components/CitizenLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import RegisterPage from "./pages/RegisterPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminLayout from "./components/AdminLayout";
import OfficerLayout from "./components/OfficerLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import OfficerDashboardPage from "./pages/officer/OfficerDashboardPage";
import OfficerComplaintsPage from "./pages/officer/OfficerComplaintsPage";
import OfficerComplaintDetailPage from "./pages/officer/OfficerComplaintDetailPage";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
        <Route element={<CitizenLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/complaints/new"
            element={<NewComplaintPage />}
          />

          <Route
            path="/complaints"
            element={<MyComplaintsPage />}
          />
          <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["officer"]} />}>
          <Route element={<OfficerLayout />}>
            <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="/officer/dashboard" element={<OfficerDashboardPage />} />
            <Route path="/officer/complaints" element={<OfficerComplaintsPage />} />
            <Route path="/officer/complaints/:id" element={<OfficerComplaintDetailPage />} />
          </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
