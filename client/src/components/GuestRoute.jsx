import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../utils/roleHome";

function GuestRoute() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /></div>;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}

export default GuestRoute;
