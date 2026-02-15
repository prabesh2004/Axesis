import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Atom,
  CheckCircle2,
  FileUser,
  FileText,
  FolderKanban,
  Target,
  Sparkles,
  ListChecks,
  Brain,
  Compass,
  Layers,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/services/authToken";

type LandingScrollProps = {
  initialSectionId?: "features" | "how-it-works";
};

/* ── animation helpers ──────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

/* ── data ───────────────────────────────────────────── */

const features = [
  { icon: FileUser, title: "Resume Hub", desc: "Upload once, reference anytime. AI analyzes your resume so every recommendation is grounded in reality." },
  { icon: FileText, title: "Smart Notes", desc: "Capture what you learn with tags and search. Your notes feed into AI context for better guidance." },
  { icon: FolderKanban, title: "Project Tracker", desc: "Log projects with tech stacks and progress. Build a portfolio that informs your next career move." },
  { icon: Target, title: "Goal Setting", desc: "Define target roles and interests. Axesis aligns every insight to what you're actually working toward." },
  { icon: Sparkles, title: "AI Insights", desc: "Get actionable recommendations based on your full profile — not generic advice from a template." },
  { icon: ListChecks, title: "Action Plans", desc: "Turn scattered information into clear, ordered steps you can start today." },
];

const whyItems = [
  { icon: Brain, title: "Context-aware", desc: "AI that knows your resume, goals, and projects — not just keywords." },
  { icon: Compass, title: "Direction, not noise", desc: "Clear next steps instead of overwhelming suggestions." },
  { icon: Layers, title: "Everything connected", desc: "Notes, projects, and goals feed into one coherent picture." },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up in seconds with email or Google." },
  { num: "02", title: "Add your context", desc: "Upload your resume, set goals, and capture notes." },
  { num: "03", title: "Get direction", desc: "AI analyzes your profile and surfaces what matters." },
  { num: "04", title: "Take action", desc: "Follow clear steps and track progress as you grow." },
];

/* ── component ──────────────────────────────────────── */

export default function LandingScroll({ initialSectionId }: LandingScrollProps) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (!initialSectionId) return;
    const el = document.getElementById(initialSectionId);
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }, [initialSectionId]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── HEADER ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <Atom className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">Axesis</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#why" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Why Axesis
            </a>
            <a href="#how-it-works" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button onClick={() => navigate("/dashboard")} size="sm">Dashboard</Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────── */}
      <div ref={heroRef} className="relative">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/6 blur-[100px]" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28 lg:pt-36"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-6 border-primary/20 bg-primary/10 text-primary">
                AI-powered career development
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Your career,{" "}
              <span className="gradient-text">organized & guided</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
            >
              Axesis brings your resume, notes, projects, and goals into one place — then uses AI to show you exactly what to do next.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isLoggedIn ? (
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="px-8">
                      Start for free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button asChild variant="outline" size="lg">
                    <a href="#features">Explore features</a>
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Context-aware AI", "Resume analysis", "Goal tracking", "No setup needed"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── STATS BAR ──────────────────────────────── */}
      <Section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {[
            { val: "100%", label: "Free to start" },
            { val: "AI", label: "Personalized guidance" },
            { val: "All-in-1", label: "Career workspace" },
            { val: "Fast", label: "Setup in minutes" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="text-2xl font-bold text-primary">{s.val}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── FEATURES ───────────────────────────────── */}
      <Section id="features" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20">
        <motion.div variants={fadeUp} className="text-center">
          <Badge variant="secondary" className="mb-4">Core features</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need, <span className="gradient-text">nothing you don't</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Six focused tools that work together to keep your career moving forward.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={scaleIn}
              className="group rounded-xl border border-border/60 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(174_72%_50%/0.08)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── WHY AXESIS ─────────────────────────────── */}
      <Section id="why" className="scroll-mt-20 border-y border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div variants={fadeUp} className="text-center">
            <Badge variant="secondary" className="mb-4">Why Axesis</Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Built different, <span className="gradient-text">on purpose</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Not another generic career tool. Axesis understands your unique context.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whyItems.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="relative rounded-xl border border-border/40 bg-background/80 p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <Section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20">
        <motion.div variants={fadeUp} className="text-center">
          <Badge variant="secondary" className="mb-4">How it works</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Four steps to <span className="gradient-text">clarity</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            From scattered thoughts to a focused plan in minutes.
          </p>
        </motion.div>

        <div className="relative mt-12">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-border/60 md:block" />
          <div className="grid gap-6">
            {steps.map((s, idx) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                className="relative flex gap-6 md:items-center"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background text-sm font-bold text-primary">
                  {s.num}
                </div>
                <div className="rounded-xl border border-border/40 bg-card/50 p-5 flex-1">
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ──────────────────────────────── */}
      <Section className="border-t border-border/50">
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-primary/6 blur-[100px]" />
            <div className="absolute bottom-10 right-1/4 h-[250px] w-[250px] rounded-full bg-accent/5 blur-[80px]" />
          </div>

          <motion.div variants={fadeUp} className="relative text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to take control of your <span className="gradient-text">career path</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join Axesis and turn your experience into a clear, AI-guided action plan.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isLoggedIn ? (
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="px-8">
                      Get started — it's free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">Login</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Atom className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Axesis</span>
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">Features</a>
              <a href="#why" className="transition-colors hover:text-foreground">Why Axesis</a>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
              <Link to="/login" className="transition-colors hover:text-foreground">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
