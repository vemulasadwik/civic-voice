import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Unable to restore login:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreUser();
  }, []);

  async function register(formData) {
    const response = await api.post("/auth/register", formData);

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  async function refreshUser() {
    const response = await api.get("/auth/me");
    setUser(response.data.user);
    return response.data.user;
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
