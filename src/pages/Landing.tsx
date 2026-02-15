import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Atom, CheckCircle2, FileText, FolderKanban, FileUser, Sparkles } from "lucide-react";
import { getAuthToken } from "@/services/authToken";

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <Atom className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">Axesis</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">AI Career Hub</Badge>
          </div>

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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Hero */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <Badge variant="secondary">Personalized, practical, and simple</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Turn your resume, notes, and projects into a clear learning path.
            </h1>
            <p className="text-muted-foreground">
              Axesis helps you track your work, understand your skill gaps, and get AI guidance that’s grounded in your actual profile.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              {isLoggedIn ? (
                <Button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">Go to Dashboard</Button>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button className="w-full">Get started</Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">I already have an account</Button>
                  </Link>
                </>
              )}
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Stable AI results (cached)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Works for any background</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Resume + Goals + Projects context</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Google login supported</span>
              </div>
            </div>
          </div>

          {/* Feature snapshot */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileUser className="h-4 w-4 text-primary" /> Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload your resume, analyze it with AI, and keep the results consistent across sessions.
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Get practical insights and recommendations based on your resume, goals, notes, and projects.
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Save learning notes and filter them so you can find what matters fast.
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderKanban className="h-4 w-4 text-primary" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track projects and technologies to build a portfolio and inform your next steps.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What you can do */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">What Axesis includes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Dashboard overview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                See your recent activity, your next focus area, and AI-driven progress signals.
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Skill progress</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Skill progress is generated from your profile context and cached to stay stable.
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Plain-text assistant answers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ask questions and get clean, readable answers without markdown noise.
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Axesis</span>
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-foreground">Login</Link>
              <Link to="/register" className="hover:text-foreground">Sign up</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
