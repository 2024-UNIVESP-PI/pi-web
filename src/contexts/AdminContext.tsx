import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import adminService from "../services/adminService";
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAdminSessionStorage,
  clearCaixaSessionStorage,
  getStoredAdminSession,
  setAdminSessionStorage,
} from "./authStorage";

type AdminContextType = {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => getStoredAdminSession());

  useEffect(() => {
    const syncAdminSession = () => {
      setIsAdmin(getStoredAdminSession());
    };

    window.addEventListener("storage", syncAdminSession);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncAdminSession);

    return () => {
      window.removeEventListener("storage", syncAdminSession);
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncAdminSession);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await adminService.loginAdmin({ username, password });
      clearCaixaSessionStorage();
      setAdminSessionStorage(true);
      setIsAdmin(true);
      return true;
    } catch {
      clearAdminSessionStorage();
      setIsAdmin(false);
      return false;
    }
  };

  const logout = () => {
    clearAdminSessionStorage();
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
