import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const citizenTips = [
  ["Add a clear photo", "Show the issue and a nearby landmark.", "plus"],
  ["Use an exact location", "Include the street, area and ward.", "location"],
  ["Follow every update", "Open a complaint to see its timeline.", "bell"],
  ["Reopen when needed", "Tell the ward team if the issue remains.", "check"],
];

function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/complaints/mine").then((response) => setComplaints(response.data.complaints)).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-slate-500">Welcome back,</p><h1 className="mt-1 text-3xl font-black text-slate-900">{user?.name}</h1><p className="mt-2 text-sm text-slate-500">Report clearly and follow every update from your ward team.</p></div><Link to="/complaints/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"><Icon name="plus" className="h-4 w-4"/>Submit complaint</Link></div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{citizenTips.map(([title,text,icon]) => <article key={title} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Icon name={icon}/></span><h2 className="mt-4 text-sm font-bold text-slate-900">{title}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></article>)}</section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-slate-900">Recent complaints</h2><p className="mt-1 text-xs text-slate-500">Latest issues you have reported</p></div><Link to="/complaints" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">View all <Icon name="arrow" className="h-4 w-4"/></Link></div>
        <div className="divide-y divide-slate-100">{loading ? [1,2,3].map((item) => <div key={item} className="animate-pulse p-5"><div className="h-4 w-2/3 rounded bg-slate-100"/><div className="mt-2 h-3 w-1/3 rounded bg-slate-100"/></div>) : complaints.length === 0 ? <div className="px-6 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="clipboard"/></span><h3 className="mt-4 font-bold text-slate-900">No complaints yet</h3><p className="mt-1 text-sm text-slate-500">Report an issue when your neighbourhood needs attention.</p></div> : complaints.slice(0,5).map((complaint) => <Link to={`/complaints/${complaint._id}`} key={complaint._id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-emerald-50/40 sm:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="alert" className="h-5 w-5"/></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-slate-800">{complaint.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{complaint.category} / {complaint.ward}</p></div><StatusBadge status={complaint.status}/><Icon name="chevron" className="hidden h-4 w-4 text-slate-300 sm:block"/></Link>)}</div>
      </section>
      <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-5"><div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-emerald-600"><Icon name="bell"/></span><div><h3 className="text-sm font-bold text-slate-800">Stay informed</h3><p className="mt-1 text-sm leading-6 text-slate-500">You will receive updates whenever an officer changes the status of your complaint.</p></div></div></div>
    </div>
  );
}

export default DashboardPage;
