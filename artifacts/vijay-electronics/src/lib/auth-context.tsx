import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "ve_admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  // sessionStorage clears on tab close — fresh loads always require login
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });

  const login = (newToken: string) => {
    setToken(newToken);
    try {
      sessionStorage.setItem(SESSION_KEY, newToken);
      // Clear any stale localStorage tokens from older versions
      localStorage.removeItem("admin_token");
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setToken(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
