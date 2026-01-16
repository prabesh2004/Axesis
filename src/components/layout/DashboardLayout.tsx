import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
      <motion.div
        initial={false}
        animate={{ marginLeft: 0 }}
        className="md:transition-[margin] md:duration-300 md:ease-in-out"
        style={{ marginLeft: 0 }}
      >
        <div 
          className="hidden md:block"
          style={{ marginLeft: collapsed ? 72 : 240, transition: "margin 0.3s ease-in-out" }}
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
            </div>
          </header>
        </div>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-4 md:p-6"
          style={{ marginLeft: 0 }}
        >
          <div 
            className="hidden md:contents"
            style={{ marginLeft: collapsed ? 72 : 240 }}
          />
          {children}
        </motion.main>
      </motion.div>

      {/* Desktop margin wrapper */}
      <style>{`
        @media (min-width: 768px) {
          .md\\:transition-\\[margin\\] > header,
          .md\\:transition-\\[margin\\] > main {
            margin-left: ${collapsed ? 72 : 240}px;
            transition: margin 0.3s ease-in-out;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
