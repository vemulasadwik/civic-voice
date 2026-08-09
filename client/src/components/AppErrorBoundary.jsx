import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Civic Voice interface error", error, info); }
  render() {
    if (this.state.hasError) return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black text-slate-900">This page could not be displayed</h1><p className="mt-3 text-sm leading-6 text-slate-500">Your account and data are safe. Reload the application to try again.</p><button onClick={() => window.location.assign("/")} className="mt-6 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Return home</button></div></main>;
    return this.props.children;
  }
}

export default AppErrorBoundary;
