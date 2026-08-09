const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Assigned:
    "border-blue-200 bg-blue-50 text-blue-700",
  "In Progress":
    "border-violet-200 bg-violet-50 text-violet-700",
  Resolved:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected:
    "border-red-200 bg-red-50 text-red-700",
  Reopened:
    "border-orange-200 bg-orange-50 text-orange-700",
};

function StatusBadge({ status }) {
  const classes =
    statusClasses[status] ||
    "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export default StatusBadge;
