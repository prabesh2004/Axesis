import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import AIInsights from "./pages/AIInsights";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
          <Route
            path="/notes"
            element={
              <RequireAuth>
                <Notes />
              </RequireAuth>
            }
          />
          <Route
            path="/projects"
            element={
              <RequireAuth>
                <Projects />
              </RequireAuth>
            }
          />
          <Route
            path="/resume"
            element={
              <RequireAuth>
                <Resume />
              </RequireAuth>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <RequireAuth>
                <AIInsights />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

