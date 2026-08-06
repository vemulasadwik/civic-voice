import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  COMPLAINT_CATEGORIES,
} from "../constants/complaintConstants";

const initialForm = {
  title: "",
  description: "",
  category: "",
  ward: "",
  address: "",
};

function NewComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ...initialForm,
    ward: user?.ward || "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.title.trim().length < 5) {
      setError("Title must contain at least 5 characters");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError(
        "Description must contain at least 10 characters"
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/complaints", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ward: formData.ward,
        location: {
          address: formData.address,
        },
      });

      navigate("/complaints", {
        state: {
          successMessage: "Complaint submitted successfully",
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit complaint"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          New complaint
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Report a civic problem
        </h2>

        <p className="mt-2 text-slate-600">
          Provide enough information for the ward team to locate
          and understand the problem.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Complaint title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={5}
              maxLength={120}
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Large pothole near bus stop"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select a category</option>

              {COMPLAINT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              minLength={10}
              maxLength={2000}
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the problem, its severity and how long it has existed."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {formData.description.length}/2000
            </p>
          </div>

          <div>
            <label
              htmlFor="ward"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Ward
            </label>

            <input
              id="ward"
              name="ward"
              type="text"
              required
              value={formData.ward}
              onChange={handleChange}
              placeholder="Example: Ward 12"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Complaint location
            </label>

            <textarea
              id="address"
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter the street, landmark and area"
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {submitting
              ? "Submitting complaint..."
              : "Submit complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewComplaintPage;