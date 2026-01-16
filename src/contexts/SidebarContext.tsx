import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage to persist state
  const [collapsed, setCollapsedState] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed state to localStorage
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  };

  const toggle = () => setCollapsed(!collapsed);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
