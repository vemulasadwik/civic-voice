import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Icon from "../components/Icon";

function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await api.get("/notifications");
    setItems(response.data.notifications || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    api.get("/notifications")
      .then((response) => { if (active) setItems(response.data.notifications || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load notifications"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function read(item) {
    if (!item.isRead) { await api.patch(`/notifications/${item._id}/read`); await load(); }
  }

  async function readAll() {
    setBusy(true); setError("");
    try { await api.patch("/notifications/read-all"); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to mark notifications as read"); }
    finally { setBusy(false); }
  }

  async function removeAll() {
    if (!window.confirm("Remove all notifications permanently?")) return;
    setBusy(true); setError("");
    try { await api.delete("/notifications"); setItems([]); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to remove notifications"); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-emerald-600">Stay updated</p><h1 className="mt-2 text-3xl font-black text-slate-900">Notifications</h1></div>{items.length > 0 && <div className="flex flex-wrap gap-3">{items.some((item) => !item.isRead) && <button type="button" disabled={busy} onClick={readAll} className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">Mark all read</button>}<button type="button" disabled={busy} onClick={removeAll} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-red-200 hover:text-red-600 disabled:opacity-50">Remove all</button></div>}</div>
      {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? [1, 2, 3].map((item) => <div key={item} className="animate-pulse border-b border-slate-100 p-5"><div className="h-4 w-2/3 rounded bg-slate-100" /></div>) : items.length === 0 ? <div className="px-6 py-16 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="bell" className="h-8 w-8" /></span><h2 className="mt-5 text-xl font-bold">You&apos;re all caught up</h2><p className="mt-2 text-sm text-slate-500">Complaint updates will appear here.</p></div> : items.map((item) => <Link to={item.complaint ? `/complaints/${item.complaint._id}` : "/notifications"} onClick={() => read(item)} key={item._id} className={`flex gap-4 border-b border-slate-100 p-5 transition hover:bg-slate-50 ${item.isRead ? "" : "bg-emerald-50/50"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.isRead ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}><Icon name="bell" className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-700">{item.message}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.isRead && <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />}</Link>)}
      </div>
    </div>
  );
}

export default NotificationsPage;
