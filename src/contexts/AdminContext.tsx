import { createContext, useContext, useState, ReactNode } from "react";
import adminService from "../services/adminService";

type AdminContextType = {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true"
  );

  const login = async (username: string, password: string) => {
    try {
      await adminService.loginAdmin({ username, password });
      setIsAdmin(true);
      localStorage.setItem("adminLoggedIn", "true");
      return true;
    } catch {
      setIsAdmin(false);
      localStorage.removeItem("adminLoggedIn");
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("adminLoggedIn");
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
