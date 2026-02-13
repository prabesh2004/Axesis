import { Link, useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthToken, clearAuthToken } from "@/services/authToken";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(getAuthToken());

  const handleLogout = () => {
    clearAuthToken();
    queryClient.clear();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-64 pl-10 bg-secondary border-border focus:border-primary"
            />
          </div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg hover:bg-secondary"
                >
                  <span className="sr-only">Account</span>
                  <span
                    className={
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-colors " +
                      "bg-primary/20"
                    }
                  >
                    <User className="w-5 h-5 text-primary" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Login"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
