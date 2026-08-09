import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";
import AppErrorBoundary from "./components/AppErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
