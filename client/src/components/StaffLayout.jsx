import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

function StaffLayout({ title, subtitle, navigation }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate("/login"); };
  const navClass = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-700"}`;

  return (
    <div className="staff-theme min-h-screen bg-[#f6faf8] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-100"><Icon name="shield" /></span><div><p className="text-lg font-black text-slate-900">Civic<span className="text-emerald-600">Voice</span></p><p className="text-[10px] text-slate-400">{subtitle}</p></div></div>
        <nav className="mt-10 space-y-2">{navigation.map((item) => <NavLink key={item.to} to={item.to} end className={navClass}><Icon name={item.icon} />{item.label}</NavLink>)}</nav>
        <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="truncate text-sm font-bold text-slate-800">{user?.name}</p><p className="mt-1 truncate text-xs capitalize text-slate-500">{user?.role} / {user?.ward || "All wards"}</p><button onClick={signOut} className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600"><Icon name="logout" className="h-4 w-4" />Log out</button></div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-64"><div className="flex h-16 items-center justify-between px-4 sm:px-7"><div className="flex items-center gap-3 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white"><Icon name="shield" className="h-5 w-5" /></span><b className="text-slate-800">Civic<span className="text-emerald-600">Voice</span></b></div><p className="hidden text-sm font-semibold text-slate-500 lg:block">{title}</p><button onClick={signOut} className="text-sm font-semibold text-slate-500 hover:text-red-600 lg:hidden">Log out</button></div></header>
      <main className="px-4 pb-28 pt-7 sm:px-7 lg:ml-64 lg:pb-10"><div className="mx-auto max-w-7xl"><Outlet /></div></main>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl lg:hidden" style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}>{navigation.map((item) => <NavLink key={item.to} to={item.to} end className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500"}`}><Icon name={item.icon} className="h-5 w-5" />{item.label}</NavLink>)}</nav>
    </div>
  );
}

export default StaffLayout;
