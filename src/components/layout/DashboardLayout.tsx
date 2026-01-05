import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { collapsed, toggle } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <motion.div
        initial={{ marginLeft: collapsed ? 72 : 240 }}
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Header title={title} subtitle={subtitle} />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-6"
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
