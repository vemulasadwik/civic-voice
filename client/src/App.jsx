import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [backendMessage, setBackendMessage] = useState(
    "Checking backend connection..."
  );

  const [connectionStatus, setConnectionStatus] = useState("checking");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/health"
        );

        setBackendMessage(response.data.message);
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Backend connection error:", error);

        setBackendMessage("Could not connect to the backend");
        setConnectionStatus("failed");
      }
    }

    checkBackend();
  }, []);

  const statusStyles = {
    checking: {
      container: "border-amber-200 bg-amber-50",
      dot: "bg-amber-500",
      title: "text-amber-800",
      message: "text-amber-700",
    },
    connected: {
      container: "border-emerald-200 bg-emerald-50",
      dot: "bg-emerald-500",
      title: "text-emerald-800",
      message: "text-emerald-700",
    },
    failed: {
      container: "border-red-200 bg-red-50",
      dot: "bg-red-500",
      title: "text-red-800",
      message: "text-red-700",
    },
  };

  const currentStyle = statusStyles[connectionStatus];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 shadow-md">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-3xl font-bold text-white">
            Civic Voice
          </h1>

          <p className="mt-1 text-blue-100">
            Citizen Complaint Management System
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Project setup
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Welcome to Civic Voice
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Citizens will use this application to submit civic
            complaints and track their progress.
          </p>

          <div
            className={`mt-8 rounded-xl border p-5 ${currentStyle.container}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-3 w-3 rounded-full ${currentStyle.dot}`}
              />

              <div>
                <h3 className={`font-semibold ${currentStyle.title}`}>
                  Backend connection
                </h3>

                <p className={`mt-1 ${currentStyle.message}`}>
                  {backendMessage}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;