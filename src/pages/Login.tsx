import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Atom, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { setStoredToken, useGoogleLoginMutation, useLoginMutation } from "@/hooks/api/useAuth";
import { env } from "@/lib/env";
import { clearUserSessionCaches } from "@/services/sessionCache";
import { useQueryClient } from "@tanstack/react-query";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const googleLoginMutation = useGoogleLoginMutation();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      setStoredToken(result.token);
      clearUserSessionCaches();
      queryClient.clear();
      toast.success("Signed in");
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!env.googleClientId) return;
    if (env.useMockApi) return;
    if (!googleBtnRef.current) return;

    const existing = document.querySelector("script[data-google-identity]");
    const script = existing as HTMLScriptElement | null;
    const ensureInitialized = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: env.googleClientId,
        ux_mode: "popup",
        callback: async (response) => {
          try {
            const credential = response.credential;
            if (!credential) throw new Error("Google sign-in did not return a credential");
            const result = await googleLoginMutation.mutateAsync({ credential });
            setStoredToken(result.token);
            clearUserSessionCaches();
            queryClient.clear();
            toast.success("Signed in with Google");
            navigate("/dashboard");
          } catch (err) {
            const message = err instanceof Error ? err.message : "Google sign-in failed";
            toast.error(message);
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 360,
          text: "continue_with",
        });
      }
    };

    if (script) {
      if (script.getAttribute("data-loaded") === "true") ensureInitialized();
      else script.addEventListener("load", ensureInitialized);
      return () => script.removeEventListener("load", ensureInitialized);
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-google-identity", "true");
    s.addEventListener("load", () => {
      s.setAttribute("data-loaded", "true");
      ensureInitialized();
    });
    document.head.appendChild(s);

    return () => {
      s.removeEventListener("load", ensureInitialized);
    };
  }, [googleLoginMutation, navigate, queryClient]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4">
            <Atom className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your Axesis account
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Google Sign In */}
          {env.useMockApi || !env.googleClientId ? (
            <Button
              variant="outline"
              className="w-full mb-6 h-11 gap-3 border-border bg-secondary hover:bg-secondary/80"
              disabled
              title={
                env.useMockApi
                  ? "Disable mock API (VITE_USE_MOCK_API=false) to use Google login"
                  : "Set VITE_GOOGLE_CLIENT_ID to enable Google login"
              }
            >
              Continue with Google
            </Button>
          ) : (
            <div className="w-full mb-6 flex justify-center">
              <div ref={googleBtnRef} />
            </div>
          )}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-secondary accent-primary"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary/80">
                Forgot password?
              </a>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              disabled={loginMutation.isPending}
              type="submit"
            >
              Sign In
            </Button>
          </form>

          {/* Create Account */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Don't have an account?
            </p>
            <Link to="/register">
              <Button
                variant="outline"
                className="w-full h-11 border-primary text-primary hover:bg-primary/10"
              >
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
