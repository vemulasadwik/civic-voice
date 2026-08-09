import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

const initialForm = { name: "", email: "", password: "", phone: "", ward: "" };

function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = ({ target: { name, value } }) => setFormData((data) => ({ ...data, [name]: value }));

  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (formData.password.length < 8) return setError("Password must contain at least 8 characters");
    try { setSubmitting(true); await register(formData); navigate("/dashboard"); }
    catch (requestError) { setError(requestError.response?.data?.message || "Registration failed. Please try again."); }
    finally { setSubmitting(false); }
  }

  const fields = [
    { name: "name", label: "Full name", type: "text", icon: "user", placeholder: "Enter your full name", required: true },
    { name: "email", label: "Email address", type: "email", icon: "mail", placeholder: "you@example.com", required: true },
    { name: "phone", label: "Phone number", type: "tel", icon: "phone", placeholder: "10-digit phone number" },
    { name: "ward", label: "Ward", type: "text", icon: "location", placeholder: "For example: Ward 12" },
    { name: "password", label: "Create password", type: "password", icon: "lock", placeholder: "Minimum 8 characters", required: true },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-civic-600 text-white"><Icon name="map" /></span><span className="text-xl font-bold text-ink">Civic Voice</span></Link><p className="hidden text-sm text-slate-500 sm:block">Already registered? <Link to="/login" className="font-bold text-civic-700">Sign in</Link></p></div></header>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-16">
        <section className="lg:pr-10"><span className="inline-flex items-center gap-2 rounded-full bg-civic-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-civic-700"><Icon name="shield" className="h-4 w-4" /> Free and secure</span><h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">Join citizens making their neighbourhood better.</h1><p className="mt-5 text-lg leading-8 text-slate-500">Create your account once, then report and track civic issues from anywhere.</p>
          <div className="mt-8 space-y-4">{["Submit complaints in minutes", "Receive clear progress updates", "Keep a transparent complaint history"].map((text)=><div key={text} className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-civic-100 text-civic-700"><Icon name="check" className="h-4 w-4" /></span>{text}</div>)}</div>
        </section>
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
          <div className="mb-7"><p className="text-sm font-bold text-civic-600">Citizen registration</p><h2 className="mt-1 text-2xl font-bold text-ink">Create your account</h2></div>
          {error && <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><Icon name="alert" className="h-5 w-5 shrink-0" />{error}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field, index)=><div key={field.name} className={index === 1 || index === 4 ? "sm:col-span-2" : ""}><label htmlFor={field.name} className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label><div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-civic-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-civic-100"><Icon name={field.icon} className="ml-4 h-5 w-5 shrink-0 text-slate-400" /><input {...field} id={field.name} value={formData[field.name]} onChange={handleChange} minLength={field.name === "password" ? 8 : undefined} className="w-full bg-transparent py-3.5 pr-4 outline-none" /></div></div>)}
          </div>
          <button type="submit" disabled={submitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#182b4d] px-5 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#20385f] disabled:opacity-60">{submitting ? "Creating your account..." : "Create citizen account"}<Icon name="arrow" /></button>
          <p className="mt-5 text-center text-sm text-slate-500 sm:hidden">Already registered? <Link to="/login" className="font-bold text-civic-700">Sign in</Link></p>
        </form>
      </div>
    </main>
  );
}

export default RegisterPage;
