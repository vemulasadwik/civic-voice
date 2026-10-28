import {
  NavLink,
  Link,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const navigation = [
  { to: "/dashboard", label: "Overview", icon: "home", end: true },
  { to: "/complaints/new", label: "Report issue", icon: "plus" },
  { to: "/complaints", label: "My complaints", icon: "clipboard", end: true },
  { to: "/notifications", label: "Notifications", icon: "bell" },
  { to: "/profile", label: "Profile", icon: "user" },
];

function CitizenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white"><Icon name="shield" /></div>
          <div><p className="text-xl font-bold tracking-tight text-slate-900">Civic<span className="text-emerald-600">Voice</span></p><p className="text-[10px] text-slate-500">Citizen Grievance System</p></div>
        </div>
        <nav className="mt-10 space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"}`}>
              <Icon name={item.icon} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">{user?.name?.charAt(0)?.toUpperCase() || "C"}</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.ward || "Ward not set"}</p></div>
          </div>
          <button type="button" onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 transition hover:border-red-200 hover:text-red-600"><Icon name="logout" className="h-4 w-4" /> Log out</button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:ml-60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden"><div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white"><Icon name="shield" className="h-5 w-5" /></div><span className="font-bold text-ink">Civic<span className="text-emerald-600">Voice</span></span></div>
          <p className="hidden text-sm text-slate-500 lg:block">Citizen Services Portal</p>
          <div className="flex items-center gap-1.5"><Link to="/notifications" className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100" aria-label="Notifications"><Icon name="bell" /></Link><Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-civic-100 text-sm font-bold text-civic-700 lg:hidden" aria-label="Open profile">{user?.name?.charAt(0)?.toUpperCase() || "C"}</Link><button type="button" onClick={handleLogout} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:text-red-600 lg:hidden">Log out</button></div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-60 lg:px-8 lg:pb-12 lg:pt-8"><div className="mx-auto max-w-7xl"><Outlet /></div></main>

      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur lg:hidden">
        {navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-semibold transition sm:text-[11px] ${isActive ? "bg-civic-50 text-civic-700" : "text-slate-500"}`}><Icon name={item.icon} className="h-5 w-5" />{item.label}</NavLink>)}
      </nav>
    </div>
  );
}

export default CitizenLayout;
