import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Set auth token in axios headers
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Try to load from localStorage
  const storedToken = localStorage.getItem("tp_token");
  const storedUser = localStorage.getItem("tp_user");
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [token, setToken] = useState<string | null>(storedToken);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);

    // Persist
    localStorage.setItem("tp_token", data.token);
    localStorage.setItem("tp_user", JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);

    // Persist
    localStorage.setItem("tp_token", data.token);
    localStorage.setItem("tp_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    // Clear persisted data
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
