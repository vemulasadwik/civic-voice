import { Link } from "react-router-dom";
import Icon from "../components/Icon";

const benefits = [
  ["shield", "Easy reporting", "Report local issues in a few simple steps."],
  ["clipboard", "Track in real-time", "Follow every complaint update as it happens."],
  ["check", "Full transparency", "A clear history from submission to resolution."],
  ["user", "Community driven", "Citizens and ward teams working together."],
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><Icon name="shield" /></span><span><strong className="block text-lg leading-none">Civic<span className="text-emerald-600">Voice</span></strong><small className="text-[10px] font-medium text-slate-500">Citizen Grievance System</small></span></Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex"><a href="#home" className="text-emerald-600">Home</a><Link to="/about" className="hover:text-emerald-600">About Us</Link><a href="#how" className="hover:text-emerald-600">How It Works</a><Link to="/complaints" className="hover:text-emerald-600">Track Complaint</Link><Link to="/contact" className="hover:text-emerald-600">Contact Us</Link></nav>
          <div className="flex items-center gap-2"><Link to="/login" className="hidden rounded-lg border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 sm:inline-flex">Login</Link><Link to="/register" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700">Register</Link></div>
        </div>
      </header>

      <main id="home">
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-sky-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
            <div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><span className="text-base">✦</span>Together for a better community</span><h1 className="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">Your Voice.<br/><span className="text-emerald-600">Better Tomorrow.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Report local issues, track progress, and help us build a cleaner, safer and better city for everyone.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/complaints/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"><Icon name="plus" />Submit a complaint</Link><Link to="/complaints" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 shadow-sm hover:border-emerald-300"><Icon name="location" />Track complaint</Link></div><div className="mt-9 flex max-w-md items-start gap-3 rounded-xl border border-emerald-100 bg-white/80 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="shield" className="h-4 w-4" /></span><p className="text-xs leading-5 text-slate-500"><b className="text-slate-700">Your evidence matters.</b><br/>A clear photo and exact location help the ward team respond correctly.</p></div></div>
            <HeroIllustration />
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><div className="text-center"><h2 className="text-3xl font-black text-slate-900">Why use <span className="text-emerald-600">CivicVoice?</span></h2><div className="mx-auto mt-3 h-1 w-16 rounded-full bg-emerald-500" /></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(([icon,title,text])=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name={icon} /></span><h3 className="mt-5 font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></section>

        <section id="about" className="mx-auto mb-16 max-w-7xl px-5 sm:px-8"><div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-8"><div className="mb-6 text-center"><p className="text-sm font-bold text-emerald-700">Help your complaint move faster</p><h2 className="mt-2 text-2xl font-black text-slate-900">Include the details your ward team needs</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[["location","Exact location","Add the street, ward and a nearby landmark."],["plus","Clear evidence","Upload a focused photo that shows the issue."],["clipboard","One issue per report","Create separate complaints for separate problems."],["bell","Check your updates","Follow the timeline and reply when needed."]].map(([icon,title,text])=><div key={title} className="rounded-xl bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name={icon} /></span><p className="mt-4 text-sm font-bold text-slate-800">{title}</p><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>)}</div></div></section>
      </main>
      <footer className="border-t border-slate-100 bg-slate-50"><div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-slate-500 sm:px-8"><p>© 2026 CivicVoice. All rights reserved.</p></div></footer>
    </div>
  );
}

function HeroIllustration(){return <div className="relative mx-auto h-[390px] w-full max-w-xl"><div className="absolute inset-x-0 bottom-5 h-32 rounded-[50%] bg-emerald-100/70"/><div className="absolute bottom-16 left-3 h-36 w-20 rounded-t-full bg-sky-100 sm:left-12"/><div className="absolute bottom-16 right-4 h-44 w-24 rounded-t-full bg-emerald-100 sm:right-12"/><div className="absolute bottom-10 left-1/2 h-80 w-44 -translate-x-1/2 -rotate-3 rounded-[2.5rem] border-[10px] border-slate-800 bg-white shadow-2xl"><div className="mx-auto h-4 w-20 rounded-b-xl bg-slate-800"/><div className="p-4"><p className="text-xs font-black text-emerald-600">CivicVoice</p><h3 className="mt-5 text-lg font-black text-slate-900">How can we<br/>help your city?</h3><div className="mt-5 space-y-2">{["Road damage","Garbage / Waste","Water leakage","Street light"].map((item)=><div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-[9px] font-bold text-slate-600">● &nbsp;{item}</div>)}</div></div></div><div className="absolute bottom-9 right-10 hidden h-52 w-24 sm:block"><div className="mx-auto h-14 w-14 rounded-full bg-amber-200"/><div className="mx-auto -mt-1 h-32 w-20 rounded-t-3xl bg-emerald-700"/><div className="absolute -right-4 top-20 h-28 w-5 rotate-[-15deg] rounded-full bg-emerald-700"/></div><div className="absolute bottom-8 left-10 h-20 w-24 rounded-t-full bg-emerald-300"/><div className="absolute bottom-8 right-0 h-24 w-28 rounded-t-full bg-green-300"/></div>}

export default LandingPage;
