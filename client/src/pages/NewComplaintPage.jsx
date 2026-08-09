import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Icon from "../components/Icon";
import { COMPLAINT_CATEGORIES } from "../constants/complaintConstants";
import { useAuth } from "../context/AuthContext";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const control = "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-ink outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:bg-white focus:ring-4 focus:ring-civic-100";

function NewComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", category: "", ward: user?.ward || "", address: "" });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const previews = useMemo(() => images.map((file) => ({ file, url: URL.createObjectURL(file) })), [images]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  function handleChange({ target: { name, value } }) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleImages(fileList) {
    const selected = Array.from(fileList).slice(0, 5);
    const invalid = selected.find((file) => !allowedImageTypes.has(file.type) || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setImages([]);
      setError(`${invalid.name} must be a JPEG, PNG or WebP image no larger than 5 MB`);
      return;
    }
    setError("");
    setImages(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (formData.title.trim().length < 5) return setError("Title must contain at least 5 characters");
    if (formData.description.trim().length < 10) return setError("Description must contain at least 10 characters");
    if (!images.length) return setError("Add at least one complaint photo before submitting");
    try {
      setSubmitting(true);
      const response = await api.post("/complaints", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ward: formData.ward,
        location: { address: formData.address },
      });
      if (images.length) {
        const uploadData = new FormData();
        images.forEach((image) => uploadData.append("images", image));
        await api.post(`/complaints/${response.data.complaint._id}/images`, uploadData);
      }
      navigate(`/complaints/${response.data.complaint._id}`, { replace: true, state: { successMessage: "Complaint and evidence submitted successfully" } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit complaint");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-7"><div className="flex items-center gap-2 text-sm font-bold text-civic-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-civic-100"><Icon name="plus" className="h-4 w-4" /></span>New complaint</div><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Tell us what needs attention</h1><p className="mt-2 max-w-2xl text-slate-500">Clear details help your ward team understand and resolve the issue faster.</p></div>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><Icon name="alert" className="h-5 w-5 shrink-0" />{error}</div>}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="What is the issue?" htmlFor="title"><input id="title" name="title" required minLength={5} maxLength={120} value={formData.title} onChange={handleChange} placeholder="Example: Large pothole near the bus stop" className={control} /></Field>
            <Field label="Category" htmlFor="category"><select id="category" name="category" required value={formData.category} onChange={handleChange} className={control}><option value="">Choose a category</option>{COMPLAINT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Ward" htmlFor="ward"><input id="ward" name="ward" required value={formData.ward} onChange={handleChange} placeholder="Example: Ward 12" className={control} /></Field>
            <Field className="sm:col-span-2" label="Describe the problem" htmlFor="description"><textarea id="description" name="description" required minLength={10} maxLength={2000} rows={6} value={formData.description} onChange={handleChange} placeholder="What happened? How severe is it?" className={`${control} resize-y`} /><div className="mt-2 flex justify-between text-xs text-slate-400"><span>Include useful landmarks and safety concerns.</span><span>{formData.description.length}/2000</span></div></Field>
            <Field className="sm:col-span-2" label="Exact location" htmlFor="address"><div className="relative"><Icon name="location" className="absolute left-4 top-4 h-5 w-5 text-slate-400" /><textarea id="address" name="address" required rows={3} value={formData.address} onChange={handleChange} placeholder="Street, landmark and area" className={`${control} resize-y pl-12`} /></div></Field>
            <Field className="sm:col-span-2" label="Photo evidence (required)" htmlFor="images">
              <label htmlFor="images" className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30"><Icon name="plus" className="h-7 w-7 text-emerald-600" /><span className="mt-3 text-sm font-bold text-slate-700">Choose up to 5 images</span><span className="mt-1 text-xs text-slate-400">JPEG, PNG or WebP / 5 MB each</span><input id="images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImages(event.target.files)} className="sr-only" /></label>
              {previews.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.lastModified}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={url} alt={`Selected evidence ${index + 1}`} className="h-28 w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Remove ${file.name}`} title="Remove photo" className="absolute right-2 top-1 grid h-9 w-9 place-items-center bg-transparent text-3xl font-light leading-none text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-red-400">&times;</button><p className="truncate px-2 py-2 text-[10px] font-semibold text-slate-500">{file.name}</p></div>)}</div>}
            </Field>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate("/dashboard")} disabled={submitting} className="rounded-xl border border-slate-200 px-5 py-3.5 font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-xl bg-civic-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? (images.length ? "Submitting and uploading..." : "Submitting...") : "Submit complaint"}<Icon name="arrow" /></button></div>
        </form>
      </section>
      <aside className="space-y-5 xl:pt-28"><div className="rounded-3xl bg-[#182b4d] p-6 text-white"><Icon name="shield" className="h-8 w-8 text-teal-300" /><h2 className="mt-5 text-lg font-bold">Before you submit</h2><ul className="mt-4 space-y-4 text-sm text-slate-300">{["Use a clear, specific title", "Describe the exact location", "Submit one issue per complaint"].map((tip) => <li key={tip} className="flex gap-3"><Icon name="check" className="h-5 w-5 shrink-0" />{tip}</li>)}</ul></div></aside>
    </div>
  );
}

function Field({ className = "", label, htmlFor, children }) { return <div className={className}><label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-slate-700">{label}</label>{children}</div>; }

export default NewComplaintPage;
