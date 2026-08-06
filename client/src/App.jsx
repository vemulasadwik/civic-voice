import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CitizenLayout from "./components/CitizenLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import RegisterPage from "./pages/RegisterPage";

function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Navigate
      to={isAuthenticated ? "/dashboard" : "/login"}
      replace
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;