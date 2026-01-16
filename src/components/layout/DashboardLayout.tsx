import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, User } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className="transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: 0 }}
      >
        <div 
          className="hidden md:block md:transition-[margin-left] md:duration-300 md:ease-in-out"
          style={{ marginLeft: collapsed ? 72 : 240 }}
        >
          <Header title={title} subtitle={subtitle} />
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden">
          <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="h-9 w-9"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                </div>
              </div>
              <Link
                to="/login"
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <User className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
          </header>
        </div>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-4 md:p-6 md:transition-[margin-left] md:duration-300 md:ease-in-out"
          style={{ marginLeft: collapsed ? 72 : 240 }}
        >
          <div className="md:hidden" style={{ marginLeft: 0 }} />
          {children}
        </motion.main>
      </div>

      {/* Mobile main content fix */}
      <style>{`
        @media (max-width: 767px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
