import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  FileUser,
  Sparkles,
  ChevronLeft,
  Atom,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: FileUser, label: "Resume", path: "/resume" },
  { icon: Sparkles, label: "AI Insights", path: "/ai-insights" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const Sidebar = ({ collapsed, onToggle, isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      style={{ width: isMobile ? 240 : (effectiveCollapsed ? 72 : 240) }}
      className={`${isMobile ? 'relative' : 'fixed left-0 top-0'} h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-[width] duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Atom className="w-5 h-5 text-primary" />
          </div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-foreground text-lg overflow-hidden whitespace-nowrap"
              >
                Axesis
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-primary" : "group-hover:text-primary"
                    }`}
                  />
                  <AnimatePresence>
                    {!effectiveCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse/Close Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-200"
        >
          <motion.div
            animate={{ rotate: isMobile ? 0 : (effectiveCollapsed ? 180 : 0) }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                {isMobile ? "Close" : "Collapse"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
