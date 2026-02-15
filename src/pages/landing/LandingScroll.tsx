import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Atom, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthToken } from "@/services/authToken";
import { landingFeatures, landingSteps } from "@/components/landing_pages/data";
import { fadeUpItem, staggerContainer } from "@/components/landing_pages/motion";

type LandingScrollProps = {
  initialSectionId?: "features" | "how-it-works";
};

export default function LandingScroll({ initialSectionId }: LandingScrollProps) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());

  useEffect(() => {
    if (!initialSectionId) return;
    const el = document.getElementById(initialSectionId);
    if (!el) return;
    // Let the page render before scrolling.
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [initialSectionId]);

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
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Intro */}
        <section id="intro" className="scroll-mt-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              <motion.div variants={fadeUpItem}>
                  <Badge variant="secondary">Stay organized. Move forward.</Badge>
              </motion.div>
              <motion.h1 variants={fadeUpItem} className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Keep your career work in one place.
              </motion.h1>
              <motion.p variants={fadeUpItem} className="text-muted-foreground">
                  Organize your resume, notes, projects, and goals. See clearer next steps, with guidance shaped around your background.
              </motion.p>

              <motion.div variants={fadeUpItem} className="flex flex-col gap-2 sm:flex-row">
                {isLoggedIn ? (
                  <Button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button className="w-full">
                        Get started <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <a href="#features">See features</a>
                    </Button>
                  </>
                )}
              </motion.div>

              <motion.div variants={fadeUpItem} className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Resume, notes, projects, and goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Clearer next steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Guidance shaped around you</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Simple, calm dashboard</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-4 sm:grid-cols-2"
            >
              {landingFeatures.slice(0, 4).map((f) => (
                <motion.div key={f.title} variants={fadeUpItem}>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <f.icon className="h-4 w-4 text-primary" />
                        {f.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{f.description}</CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <motion.section
          id="features"
          className="mt-14 scroll-mt-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={fadeUpItem} className="space-y-2">
            <Badge variant="secondary">What you can do</Badge>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Features</h2>
            <p className="text-muted-foreground">A simple set of tools to stay focused and keep moving.</p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {landingFeatures.map((f) => (
              <motion.div key={f.title} variants={fadeUpItem}>
                <Card className="border-border h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <f.icon className="h-4 w-4 text-primary" />
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{f.description}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          id="how-it-works"
          className="mt-14 scroll-mt-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={fadeUpItem} className="space-y-2">
            <Badge variant="secondary">Simple flow</Badge>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">How it works</h2>
            <p className="text-muted-foreground">Set things up once, then use it as your home base.</p>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {landingSteps.map((s, idx) => (
              <motion.div key={s.title} variants={fadeUpItem}>
                <Card className="border-border h-full">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {idx + 1}. {s.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{s.description}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="mt-14"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-base font-semibold text-foreground">Ready when you are</div>
                  <div className="text-sm text-muted-foreground">Create an account and start with your resume and goals.</div>
                </div>
                {isLoggedIn ? (
                  <Button onClick={() => navigate("/dashboard")}>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/register">
                      <Button>Sign up</Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Axesis</span>
            <div className="flex gap-4">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#how-it-works" className="hover:text-foreground">How it works</a>
              <Link to="/login" className="hover:text-foreground">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
