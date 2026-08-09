import { useEffect, useState } from "react";
import api from "../../api/api";
import ComplaintImage from "../../components/ComplaintImage";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/StatusBadge";

const statuses = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected", "Reopened"];

function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [complaintResponse, userResponse] = await Promise.all([
        api.get("/admin/complaints", { params: { search, status, limit: 100 } }),
        api.get("/admin/users", { params: { role: "officer", isActive: true } }),
      ]);
      setComplaints(complaintResponse.data.complaints);
      setOfficers(userResponse.data.users);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load complaints");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 250);
    return () => clearTimeout(timer);
    // load is intentionally refreshed whenever these filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function update(path, body) {
    try { await api.patch(path, body); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Update failed"); }
  }

  async function downloadReport() {
    try {
      const response = await api.get("/admin/reports.csv", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url; link.download = "civic-voice-report.csv"; link.click();
      URL.revokeObjectURL(url);
    } catch { setError("Unable to generate report"); }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-emerald-600">Complaint operations</p><h1 className="mt-2 text-3xl font-black">All complaints</h1></div><button onClick={downloadReport} className="rounded-xl border border-emerald-600 px-4 py-3 text-sm font-bold text-emerald-700">Download CSV report</button></div>
      {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints" className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {complaints.map((item) => (
          <article key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ComplaintImage complaint={item} className="h-48 w-full" />
            {item.completionImages?.length > 0 && <div className="border-b border-emerald-100 bg-emerald-50 p-3"><p className="mb-2 text-xs font-bold text-emerald-700">Officer completion evidence</p><div className="flex gap-2 overflow-x-auto">{item.completionImages.map((image) => <a key={image.publicId} href={image.url} target="_blank" rel="noreferrer" className="shrink-0"><img src={image.url} alt="Completed work" className="h-20 w-24 rounded-lg object-cover" /></a>)}</div></div>}
            <div className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold text-emerald-600">{item.complaintNumber}</p><h2 className="mt-1 truncate font-bold">{item.title}</h2><p className="mt-2 text-xs text-slate-500">{item.category} / {item.ward} / {item.citizen?.name}</p></div><StatusBadge status={item.status} /></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3"><select aria-label="Set priority" value={item.priority} onChange={(event) => update(`/admin/complaints/${item._id}/priority`, { priority: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select><select aria-label="Assign officer" value={item.assignedOfficer?._id || ""} onChange={(event) => event.target.value && update(`/admin/complaints/${item._id}/assign`, { officerId: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="">Assign officer</option>{officers.map((officer) => <option key={officer._id} value={officer._id}>{officer.name} / {officer.ward}</option>)}</select><select aria-label="Change status" value={item.status} onChange={(event) => update(`/admin/complaints/${item._id}/status`, { status: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminComplaintsPage;
