import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Atom } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/services/authToken";
import { pageTransition, pageVariants } from "@/components/landing_pages/motion";

export default function LandingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <Atom className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">Axesis</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              AI Career Hub
            </Badge>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "rounded-lg px-3 py-2 text-sm transition-colors " +
                (isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/features"
              className={({ isActive }) =>
                "rounded-lg px-3 py-2 text-sm transition-colors " +
                (isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                "rounded-lg px-3 py-2 text-sm transition-colors " +
                (isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              How it works
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Axesis</span>
            <div className="flex gap-4">
              <Link to="/features" className="hover:text-foreground">
                Features
              </Link>
              <Link to="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
              <Link to="/login" className="hover:text-foreground">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
