import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/api";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/StatusBadge";

const locationMarker = L.divIcon({ className: "", html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#059669;border:3px solid white;box-shadow:0 2px 8px #0006;transform:rotate(-45deg)"></span>', iconSize: [22, 22], iconAnchor: [11, 22] });

function OfficerComplaintDetailPage() {
  const { id } = useParams(); const [complaint, setComplaint] = useState(null); const [comments, setComments] = useState([]); const [note, setNote] = useState(""); const [comment, setComment] = useState(""); const [files, setFiles] = useState([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function load() { const [detail, messages] = await Promise.all([api.get(`/officer/complaints/${id}`), api.get(`/officer/complaints/${id}/comments`)]); setComplaint(detail.data.complaint); setComments(messages.data.comments || []); }
  useEffect(() => { let active = true; Promise.all([api.get(`/officer/complaints/${id}`), api.get(`/officer/complaints/${id}/comments`)]).then(([detail, messages]) => { if (active) { setComplaint(detail.data.complaint); setComments(messages.data.comments || []); } }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load assignment"); }).finally(() => { if (active) setLoading(false); }); return () => { active = false }; }, [id]);
  async function runAction(action, success) { setBusy(true); setError(""); setMessage(""); try { await action(); setMessage(success); await load(); return true; } catch (requestError) { setError(requestError.response?.data?.message || "Action could not be completed"); return false; } finally { setBusy(false); } }
  async function changeStatus(status) {
    if (status === "Rejected" && !window.confirm("Reject this complaint? The citizen will be notified.")) return;
    if (status === "Resolved" && !complaint.completionImages?.length && !files.length) {
      setError("Choose at least one completion image before resolving the complaint");
      return;
    }
    if (status === "Resolved" && files.length) {
      const data = new FormData();
      files.forEach((file) => data.append("images", file));
      setBusy(true); setError(""); setMessage("");
      try {
        await api.post(`/officer/complaints/${id}/images`, data);
        await api.patch(`/officer/complaints/${id}/status`, { status, note });
        setFiles([]);
        setMessage("Completion photo uploaded and complaint marked Resolved");
        await load();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to upload completion photo and resolve complaint");
      } finally {
        setBusy(false);
      }
      return;
    }
    await runAction(() => api.patch(`/officer/complaints/${id}/status`, { status, note }), `Complaint marked ${status}`);
  }
  const addComment = (event) => { event.preventDefault(); if (!comment.trim()) return; runAction(() => api.post(`/officer/complaints/${id}/comments`, { message: comment }), "Comment sent").then(() => setComment("")); };
  async function uploadSelectedImages(fileList) {
    const selected = Array.from(fileList).slice(0, 5);
    if (!selected.length) return;
    setFiles(selected);
    const data = new FormData();
    selected.forEach((file) => data.append("images", file));
    if (await runAction(() => api.post(`/officer/complaints/${id}/images`, data), "Completion images uploaded successfully")) setFiles([]);
  }
  async function deleteCompletionImage(publicId) {
    if (!window.confirm("Delete this completion photo?")) return;
    await runAction(() => api.delete(`/officer/complaints/${id}/images`, { data: { publicId } }), "Completion photo deleted");
  }
  if (loading) return <div className="animate-pulse space-y-5"><div className="h-8 w-52 rounded bg-slate-200" /><div className="h-80 rounded-2xl bg-white" /></div>;
  if (!complaint) return <div className="rounded-2xl bg-white p-10 text-center"><h1 className="text-xl font-bold">Assignment unavailable</h1><p className="mt-2 text-sm text-slate-500">{error}</p><Link to="/officer/complaints" className="mt-5 inline-block font-bold text-blue-600">Back to assignments</Link></div>;
  return <div><Link to="/officer/complaints" className="text-sm font-semibold text-slate-500">← Back to assignments</Link><div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold text-blue-600">{complaint.complaintNumber}</p><h1 className="mt-2 text-3xl font-black">{complaint.title}</h1><p className="mt-2 text-sm text-slate-500">{complaint.category} / {complaint.ward} / {complaint.priority} priority</p></div><StatusBadge status={complaint.status} /></div>{message && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Issue information</h2><p className="mt-4 text-sm leading-7 text-slate-600">{complaint.description}</p><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Exact complaint location</p><p className="mt-2 text-sm font-semibold">{complaint.location?.address || "Address not provided"}</p></div><OfficerLocationMap location={complaint.location} /><div className="mt-5 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase text-slate-400">Citizen</p><p className="mt-2 font-bold">{complaint.citizen?.name}</p><p className="mt-1 text-sm text-slate-500">{complaint.citizen?.phone || complaint.citizen?.email}</p></div>{complaint.images?.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{complaint.images.map((image) => <img key={image.publicId} src={image.url} alt="Citizen evidence" className="h-32 w-full rounded-xl object-cover" />)}</div>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Update work</h2><textarea value={note} onChange={(event) => setNote(event.target.value)} rows="3" placeholder="Optional note for this status update, or explain why the complaint is being rejected" className="mt-4 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500" /><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{["Assigned", "Reopened"].includes(complaint.status) && <><button disabled={busy} onClick={() => changeStatus("In Progress")} className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Accept and start work</button><button disabled={busy} onClick={() => changeStatus("Rejected")} className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Reject complaint</button></>}{complaint.status === "In Progress" && <button disabled={busy} onClick={() => changeStatus("Resolved")} className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Mark as resolved</button>}</div>{complaint.status === "In Progress" && <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><p className="text-xs font-bold text-slate-600">Completion evidence</p><input id="completion-images" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { setError(""); uploadSelectedImages(event.target.files); event.target.value = ""; }} className="sr-only" /><div className="mt-3"><label htmlFor="completion-images" className={`inline-flex cursor-pointer items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 ${busy ? "pointer-events-none opacity-50" : ""}`}>{busy ? "Uploading photos..." : "Choose completion photos"}</label></div><p className="mt-2 text-xs text-slate-500">Photos upload automatically after selection. JPEG, PNG or WebP; maximum five images, 5 MB each.</p></div>}</section>
      <SelectedCompletionImages files={files} />
      {complaint.completionImages?.length > 0 && <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Completion evidence</p><h2 className="mt-2 font-bold">Uploaded work-completion photos</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{complaint.completionImages.map((image) => <div key={image.publicId} className="relative"><a href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt="Completed work" className="h-36 w-full rounded-xl bg-white object-cover" /></a>{complaint.status === "In Progress" && <button type="button" disabled={busy} onClick={() => deleteCompletionImage(image.publicId)} className="absolute right-2 top-1 grid h-9 w-9 place-items-center bg-transparent text-3xl font-light leading-none text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-red-400 disabled:opacity-50" aria-label="Delete completion photo" title="Delete completion photo">&times;</button>}</div>)}</div></section>}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Conversation</h2><div className="mt-4 max-h-72 space-y-3 overflow-y-auto">{comments.map((item) => <div key={item._id} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold capitalize text-blue-600">{item.author?.name} / {item.author?.role}</p><p className="mt-2 text-sm text-slate-600">{item.message}</p></div>)}{!comments.length && <p className="py-4 text-center text-sm text-slate-400">No comments yet</p>}</div><form onSubmit={addComment} className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Message the citizen" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /><button disabled={busy} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white">Send</button></form></section></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Progress history</h2><div className="mt-6">{complaint.statusHistory?.map((history, index) => <div key={history._id || index} className="relative flex gap-4 pb-8 last:pb-0"><span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 text-white"><Icon name="check" className="h-4 w-4" /></span>{index < complaint.statusHistory.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-blue-200" />}<div><p className="text-sm font-bold">{history.status}</p><p className="mt-1 text-xs leading-5 text-slate-500">{history.note || "Status updated"}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(history.createdAt).toLocaleString()}</p></div></div>)}</div></section></div></div>;
}

function OfficerLocationMap({ location }) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  const hasCoordinates = location?.latitude !== null && location?.latitude !== undefined && location?.latitude !== "" && location?.longitude !== null && location?.longitude !== undefined && location?.longitude !== "" && Number.isFinite(latitude) && Number.isFinite(longitude);
  if (!hasCoordinates) return <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs text-slate-500">This complaint was submitted without map coordinates. Use the written address above.</div>;
  const position = [latitude, longitude];
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`;
  return <div className="mt-4 overflow-hidden rounded-xl border border-emerald-100"><div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3"><p className="text-xs font-bold text-emerald-800">Citizen-selected map position</p><a href={directionsUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Open directions</a></div><MapContainer center={position} zoom={18} scrollWheelZoom className="h-72 w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} /><Marker position={position} icon={locationMarker}><Popup><p className="max-w-64 text-xs font-semibold leading-5">{location.address || "Complaint location"}</p></Popup></Marker></MapContainer></div>;
}

function SelectedCompletionImages({ files }) {
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);
  if (!previews.length) return null;
  return <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5"><p className="text-sm font-bold text-blue-800">Selected completion photos</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{previews.map((image) => <div key={image.url}><img src={image.url} alt={image.name} className="h-32 w-full rounded-xl bg-white object-cover" /><p className="mt-1 truncate text-[10px] text-slate-500">{image.name}</p></div>)}</div><p className="mt-3 text-xs font-semibold text-blue-700">Click Mark as resolved to upload these photos and complete the complaint.</p></section>;
}

export default OfficerComplaintDetailPage;
