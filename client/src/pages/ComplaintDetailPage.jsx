import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";

function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [reopenNote, setReopenNote] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [detail, messages] = await Promise.all([
      api.get(`/complaints/mine/${id}`),
      api.get(`/complaints/${id}/comments`),
    ]);
    setComplaint(detail.data.complaint);
    setComments(messages.data.comments || []);
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/complaints/mine/${id}`), api.get(`/complaints/${id}/comments`)])
      .then(([detail, messages]) => { if (active) { setComplaint(detail.data.complaint); setComments(messages.data.comments || []); } })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load complaint"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function runAction(action, successMessage) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); await load(); setMessage(successMessage); return true; }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to complete the request"); return false; }
    finally { setBusy(false); }
  }

  async function uploadEvidence() {
    if (!files.length) return setError("Choose at least one image");
    const data = new FormData(); files.forEach((file) => data.append("images", file));
    if (await runAction(() => api.post(`/complaints/${id}/images`, data), "Evidence uploaded successfully")) setFiles([]);
  }

  async function submitComment(event) {
    event.preventDefault(); if (!comment.trim()) return;
    if (await runAction(() => api.post(`/complaints/${id}/comments`, { message: comment }), "Comment sent")) setComment("");
  }

  async function reopen(event) {
    event.preventDefault();
    if (await runAction(() => api.patch(`/complaints/${id}/reopen`, { note: reopenNote }), "Complaint reopened")) setReopenNote("");
  }

  async function deleteComplaint() {
    if (!window.confirm("Delete this complaint permanently? This action cannot be undone.")) return;
    setBusy(true); setError("");
    try {
      await api.delete(`/complaints/${id}`);
      navigate("/complaints", { replace: true, state: { successMessage: "Complaint deleted successfully" } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete complaint");
      setBusy(false);
    }
  }

  async function deleteEvidence(publicId) {
    if (!window.confirm("Delete this photo?")) return;
    await runAction(() => api.delete(`/complaints/${id}/images`, { data: { publicId } }), "Photo deleted successfully");
  }

  if (loading) return <div className="animate-pulse space-y-5"><div className="h-8 w-48 rounded bg-slate-200" /><div className="h-72 rounded-2xl bg-white" /></div>;
  if (!complaint) return <ErrorState message={error} />;

  return (
    <div>
      <Link to="/complaints" className="text-sm font-semibold text-slate-500 hover:text-emerald-600">&larr; Back to complaints</Link>
      {message && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-600">{complaint.complaintNumber}</p><h1 className="mt-2 text-3xl font-black">{complaint.title}</h1><p className="mt-2 text-sm text-slate-500">Submitted {new Date(complaint.createdAt).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-3"><StatusBadge status={complaint.status} />{["Pending", "Rejected"].includes(complaint.status) && <button type="button" disabled={busy} onClick={deleteComplaint} className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Delete complaint</button>}</div></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Complaint details</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><Info label="Category" value={complaint.category} /><Info label="Priority" value={`${complaint.priority} priority`} /><Info label="Ward" value={complaint.ward} /><Info label="Location" value={complaint.location?.address} /></dl><div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</p><p className="mt-3 text-sm leading-7 text-slate-600">{complaint.description}</p></div>{complaint.images?.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{complaint.images.map((image) => <div key={image.publicId} className="relative"><a href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt="Complaint evidence" className="h-36 w-full rounded-xl bg-slate-100 object-cover" /></a>{["Pending", "Rejected"].includes(complaint.status) && <button type="button" disabled={busy} onClick={() => deleteEvidence(image.publicId)} className="absolute right-2 top-1 grid h-9 w-9 place-items-center bg-transparent text-3xl font-light leading-none text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-red-400 disabled:opacity-50" aria-label="Delete photo" title="Delete photo">&times;</button>}</div>)}</div>}<div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-700">Add photo evidence</p><p className="mt-1 text-xs text-slate-500">JPEG, PNG or WebP, up to five images and 5 MB each.</p><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setFiles(Array.from(event.target.files).slice(0, 5))} className="mt-3 block w-full text-xs text-slate-500" /><button type="button" disabled={busy || !files.length} onClick={uploadEvidence} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">Upload {files.length || ""} image{files.length === 1 ? "" : "s"}</button></div></section>
          {complaint.completionImages?.length > 0 && <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Work completed</p><h2 className="mt-2 text-xl font-bold text-slate-900">Completion evidence from your ward officer</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{complaint.completionImages.map((image) => <a key={image.publicId} href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt="Completed civic work" className="h-40 w-full rounded-xl bg-white object-cover" /></a>)}</div></section>}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Conversation</h2><div className="mt-5 max-h-80 space-y-4 overflow-y-auto">{comments.map((item) => <div key={item._id} className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between gap-4"><p className="text-xs font-bold capitalize text-emerald-700">{item.author?.name} / {item.author?.role}</p><p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p></div>)}{comments.length === 0 && <p className="py-5 text-center text-sm text-slate-400">No comments yet.</p>}</div><form onSubmit={submitComment} className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" /><button disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Send</button></form></section>
          {complaint.status === "Resolved" && <form onSubmit={reopen} className="rounded-2xl border border-orange-200 bg-orange-50 p-6"><h2 className="font-bold text-orange-800">Problem not fixed?</h2><textarea value={reopenNote} onChange={(event) => setReopenNote(event.target.value)} required rows="3" className="mt-4 w-full rounded-lg border border-orange-200 bg-white p-3 text-sm outline-none" placeholder="Reason for reopening" /><button disabled={busy} className="mt-3 rounded-lg bg-orange-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Reopen complaint</button></form>}
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Progress timeline</h2><div className="mt-6">{complaint.statusHistory?.map((history, index) => <div key={history._id || index} className="relative flex gap-4 pb-8 last:pb-0"><div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" className="h-4 w-4" /></div>{index < complaint.statusHistory.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-emerald-200" />}<div><p className="text-sm font-bold">{history.status}</p><p className="mt-1 text-xs leading-5 text-slate-500">{history.note || "Status updated"}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(history.createdAt).toLocaleString()}</p></div></div>)}</div></section>
      </div>
    </div>
  );
}

function Info({ label, value }) { return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-2 text-sm font-semibold text-slate-700">{value || "Not available"}</dd></div>; }
function ErrorState({ message }) { return <div className="rounded-2xl border border-red-100 bg-white p-10 text-center"><Icon name="alert" className="mx-auto h-10 w-10 text-red-400" /><h1 className="mt-4 text-xl font-bold">Complaint unavailable</h1><p className="mt-2 text-sm text-slate-500">{message}</p><Link to="/complaints" className="mt-6 inline-block font-bold text-emerald-600">Back to complaints</Link></div>; }

export default ComplaintDetailPage;
