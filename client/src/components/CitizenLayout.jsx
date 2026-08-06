import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CitizenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function navigationClass({ isActive }) {
    return [
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-blue-600 text-white"
        : "text-blue-100 hover:bg-blue-600 hover:text-white",
    ].join(" ");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 text-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Civic Voice</h1>
              <p className="text-sm text-blue-100">
                Citizen portal
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {user?.name}
                </p>
                <p className="text-xs text-blue-100">
                  {user?.ward || "No ward selected"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-blue-400 px-4 py-2 text-sm font-semibold transition hover:bg-blue-600"
              >
                Log out
              </button>
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2 border-t border-blue-600 pt-4">
            <NavLink
              to="/dashboard"
              end
              className={navigationClass}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/complaints/new"
              className={navigationClass}
            >
              Submit complaint
            </NavLink>

            <NavLink
              to="/complaints"
              end
              className={navigationClass}
            >
              My complaints
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default CitizenLayout;