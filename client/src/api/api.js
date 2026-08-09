import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Let the browser add the multipart boundary for file uploads.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthenticationRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthenticationRequest) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.assign("/login?session=expired");
    }
    return Promise.reject(error);
  }
);

export default api;
