import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";

function MyComplaintsPage() {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadComplaints() {
      try { const response = await api.get("/complaints/mine"); setComplaints(response.data.complaints); }
      catch (requestError) { setError(requestError.response?.data?.message || "Unable to load complaints"); }
      finally { setLoading(false); }
    }
    loadComplaints();
  }, []);

  const filtered = useMemo(() => complaints.filter((complaint) => {
    const matchesStatus = status === "All" || complaint.status === status;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [complaint.title, complaint.complaintNumber, complaint.category, complaint.ward].some((value) => value?.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  }), [complaints, search, status]);

  const counts = complaints.reduce((total, complaint) => ({ ...total, [complaint.status]: (total[complaint.status] || 0) + 1 }), {});

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-civic-700">Complaint tracking</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">My complaints</h1><p className="mt-2 text-slate-500">Every report, update and outcome in one place.</p></div><Link to="/complaints/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-civic-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 hover:bg-civic-700"><Icon name="plus" /> Report an issue</Link></div>

      {location.state?.successMessage && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-700"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100"><Icon name="check" className="h-4 w-4" /></span>{location.state.successMessage}</div>}
      {error && <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"><Icon name="alert" />{error}</div>}

      {!loading && complaints.length > 0 && <><section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Total",complaints.length,"clipboard","bg-indigo-50 text-indigo-700"],["Pending",counts.Pending || 0,"calendar","bg-amber-50 text-amber-700"],["In progress",counts["In Progress"] || 0,"filter","bg-violet-50 text-violet-700"],["Resolved",counts.Resolved || 0,"check","bg-emerald-50 text-emerald-700"]].map(([label,value,icon,color])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon name={icon} className="h-4 w-4" /></div><p className="mt-4 text-2xl font-black text-ink">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>)}</section>
      <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" /><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by title, ID or category" className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-civic-100" /></div><select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 outline-none"><option>All</option><option>Pending</option><option>Assigned</option><option>In Progress</option><option>Resolved</option><option>Rejected</option><option>Reopened</option></select></section></>}

      {loading ? <Loading /> : complaints.length === 0 ? <Empty /> : filtered.length === 0 ? <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-lg font-bold text-ink">No matching complaints</h2><p className="mt-2 text-sm text-slate-500">Try another search term or status.</p></div> : <div className="mt-6 grid gap-4 xl:grid-cols-2">{filtered.map((complaint)=><Link to={`/complaints/${complaint._id}`} key={complaint._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-civic-200 hover:shadow-lg sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-civic-700">{complaint.complaintNumber}</p><h2 className="mt-2 truncate text-lg font-bold text-ink">{complaint.title}</h2></div><StatusBadge status={complaint.status} /></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{complaint.description}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{complaint.category}</span><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{complaint.ward}</span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-2 text-xs text-slate-400"><Icon name="calendar" className="h-4 w-4" />{new Date(complaint.createdAt).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span><span className="flex items-center gap-2 text-xs font-bold text-slate-500">View details <Icon name="chevron" className="h-4 w-4"/></span></div></Link>)}</div>}
    </div>
  );
}

function Loading(){return <div className="mt-6 grid gap-4 xl:grid-cols-2">{[1,2,3,4].map((item)=><div key={item} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"><div className="h-3 w-28 rounded bg-slate-200"/><div className="mt-4 h-6 w-2/3 rounded bg-slate-200"/><div className="mt-5 h-4 rounded bg-slate-100"/><div className="mt-2 h-4 w-4/5 rounded bg-slate-100"/></div>)}</div>}
function Empty(){return <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-civic-50 text-civic-700"><Icon name="clipboard" className="h-8 w-8" /></div><h2 className="mt-5 text-2xl font-bold text-ink">Your complaint list is clear</h2><p className="mx-auto mt-2 max-w-md text-slate-500">When you notice a civic issue, report it here and follow every update.</p><Link to="/complaints/new" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-civic-600 px-5 py-3.5 font-bold text-white hover:bg-civic-700"><Icon name="plus" /> Submit your first complaint</Link></div>}
export default MyComplaintsPage;
