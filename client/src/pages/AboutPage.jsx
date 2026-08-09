import PublicHeader from "../components/PublicHeader";
import Icon from "../components/Icon";

const expectations = [
  ["clipboard", "One reference for every report", "Each complaint receives its own tracking number and timeline."],
  ["bell", "Updates you can follow", "See assignment, progress and resolution updates without visiting an office."],
  ["user", "Direct ward communication", "Exchange useful comments with the team handling your complaint."],
  ["check", "A way to speak up again", "Reopen a resolved complaint when the reported issue is still present."],
];

function AboutPage() {
  return <div className="min-h-screen bg-[#f8faf9]"><PublicHeader/><main>
    <section className="bg-emerald-600 px-5 py-16 text-center text-white sm:py-20"><p className="text-sm font-bold uppercase tracking-widest text-emerald-100">About CivicVoice</p><h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black sm:text-5xl">Connecting citizens with the people who improve their city.</h1><p className="mx-auto mt-5 max-w-2xl leading-7 text-emerald-50">A clear, accessible platform for reporting civic problems and following every step toward resolution.</p></section>
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start"><div><p className="text-sm font-bold text-emerald-600">Why we built it</p><h2 className="mt-2 text-3xl font-black text-slate-900">Reporting a local issue should be simple and transparent.</h2><p className="mt-5 leading-8 text-slate-600">CivicVoice replaces disconnected, difficult-to-track complaint systems with one service. Citizens provide clear evidence and location details while ward teams receive the information needed to act.</p><div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5"><p className="font-bold text-amber-900">For immediate danger</p><p className="mt-2 text-sm leading-6 text-amber-800">Use your local emergency service instead of submitting an online civic complaint.</p></div></div><div><h2 className="text-xl font-bold text-slate-900">What citizens can expect</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{expectations.map(([icon,title,text]) => <article key={title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon name={icon}/></span><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>
    <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><div className="grid gap-4 sm:grid-cols-3">{[["shield","Transparent","Every status update is visible."],["user","Inclusive","Designed to be simple for everyone."],["check","Accountable","Clear ownership from report to resolution."]].map(([icon,title,text]) => <article key={title} className="rounded-2xl bg-white p-6 shadow-sm"><Icon name={icon} className="h-8 w-8 text-emerald-600"/><h3 className="mt-5 font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm text-slate-500">{text}</p></article>)}</div></section>
  </main></div>;
}

export default AboutPage;
