import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("readora_token")
  );

  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD CURRENT USER
  // ======================================================

  const loadUser = async () => {
    const savedToken = localStorage.getItem("readora_token");

    if (!savedToken) {
      setCurrentUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (response.data.success) {
        setCurrentUser(response.data.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem("readora_token");
        setToken(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);

      localStorage.removeItem("readora_token");
      setToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================

  const login = async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    if (response.data.success) {
      const newToken = response.data.token;

      localStorage.setItem("readora_token", newToken);

      setToken(newToken);
      setCurrentUser(response.data.user);
    }

    return response.data;
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    localStorage.removeItem("readora_token");

    setToken(null);
    setCurrentUser(null);
  };

  // ======================================================
  // CONTEXT VALUE
  // ======================================================

  const value = {
    currentUser,

    // Compatibility with StudentDashboard
    user: currentUser,

    setCurrentUser,
    token,
    loading,
    login,
    logout,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ======================================================
// USE AUTH
// ======================================================

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;