import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import ComplaintImage from "../../components/ComplaintImage";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/StatusBadge";

function OfficerComplaintsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/officer/complaints", { params: status ? { status } : {} })
      .then((response) => { if (active) setItems(response.data.complaints || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load assignments"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-blue-600">Assigned work</p><h1 className="mt-2 text-3xl font-black">Ward complaints</h1><p className="mt-2 text-sm text-slate-500">Open an assignment to review evidence and update its progress.</p></div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Icon name="filter" className="h-4 w-4 text-slate-400" /><select value={status} onChange={(event) => { setLoading(true); setError(""); setStatus(event.target.value); }} className="bg-transparent text-sm font-semibold outline-none"><option value="">All assignments</option>{["Assigned", "In Progress", "Reopened", "Resolved"].map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {loading ? [1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />) : items.length === 0 ? <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><Icon name="clipboard" className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold">No matching assignments</h2></div> : items.map((item) => (
          <Link to={`/officer/complaints/${item._id}`} key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <ComplaintImage complaint={item} className="h-44 w-full" />
            <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold text-blue-600">{item.complaintNumber}</p><h2 className="mt-2 truncate text-lg font-bold">{item.title}</h2></div><StatusBadge status={item.status} /></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{item.description}</p><div className="mt-5 flex flex-wrap gap-2">{[item.category, item.ward, `${item.priority} priority`].map((value) => <span key={value} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold">{value}</span>)}</div><div className="mt-5 flex justify-end border-t border-slate-100 pt-4 text-xs font-bold text-blue-600">Open assignment <Icon name="chevron" className="ml-1 h-4 w-4" /></div></div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default OfficerComplaintsPage;
