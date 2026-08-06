import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import api from "../api/api";
import StatusBadge from "../components/StatusBadge";

function MyComplaintsPage() {
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const successMessage =
    location.state?.successMessage || "";

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await api.get("/complaints/mine");
        setComplaints(response.data.complaints);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load complaints"
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Complaint tracking
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            My complaints
          </h2>

          <p className="mt-2 text-slate-600">
            Review your submitted complaints and their current
            progress.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
        >
          Submit complaint
        </Link>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />

          <p className="mt-4 text-slate-600">
            Loading complaints...
          </p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            No complaints submitted
          </h3>

          <p className="mt-2 text-slate-600">
            When you report a civic problem, it will appear here.
          </p>

          <Link
            to="/complaints/new"
            className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Submit your first complaint
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {complaints.map((complaint) => (
            <article
              key={complaint._id}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    {complaint.complaintNumber}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {complaint.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    {complaint.category} · {complaint.ward}
                  </p>
                </div>

                <StatusBadge status={complaint.status} />
              </div>

              <p className="mt-4 line-clamp-2 text-slate-600">
                {complaint.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  Submitted{" "}
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </p>

                <p className="text-sm font-medium text-slate-700">
                  Priority: {complaint.priority}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyComplaintsPage;