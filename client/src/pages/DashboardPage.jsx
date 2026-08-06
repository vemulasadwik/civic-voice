import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Citizen dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome, {user?.name}
        </h2>

        <p className="mt-3 max-w-2xl text-slate-600">
          Submit civic complaints and track every status update
          from this dashboard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/complaints/new"
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Submit a complaint
          </Link>

          <Link
            to="/complaints"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View my complaints
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Registered email</p>
          <p className="mt-2 font-semibold text-slate-900">
            {user?.email}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Selected ward</p>
          <p className="mt-2 font-semibold text-slate-900">
            {user?.ward || "Not provided"}
          </p>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;