import { Link } from "react-router-dom";
import Icon from "./Icon";
function PublicHeader(){return <header className="border-b border-slate-100 bg-white"><div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8"><Link to="/" className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><Icon name="shield"/></span><b className="text-lg text-slate-900">Civic<span className="text-emerald-600">Voice</span></b></Link><nav className="flex gap-4 text-sm font-semibold text-slate-600 sm:gap-7"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav></div></header>}
export default PublicHeader;
