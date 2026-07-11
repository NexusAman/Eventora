import React from "react";
import api from "../utils/axios.js"; // Adjust the import path as necessary
const AuthContext = React.createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const loading = false;

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return data;
    } catch (error) {
      console.error("Login failed:", error);

      throw error.response?.data || error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verifyOtp, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
