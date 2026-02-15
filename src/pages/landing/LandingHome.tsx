import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthToken } from "@/services/authToken";
import { landingFeatures } from "@/components/landing_pages/data";
import { fadeUpItem, staggerContainer } from "@/components/landing_pages/motion";

export default function LandingHome() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());

  const topFeatures = landingFeatures.slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
          <motion.div variants={fadeUpItem}>
            <Badge variant="secondary">Built for real progress</Badge>
          </motion.div>
          <motion.h1 variants={fadeUpItem} className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Turn your resume, notes, and projects into a clear next step.
          </motion.h1>
          <motion.p variants={fadeUpItem} className="text-muted-foreground">
            Axesis helps you organize your work and get AI guidance based on your actual profile — not generic templates.
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
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          <motion.div variants={fadeUpItem} className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
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
              <span>Grounded in your context</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Google login supported</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2">
          {topFeatures.map((f) => (
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
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Explore more</h2>
            <p className="text-sm text-muted-foreground">See the full feature list and the workflow.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/features">
              <Button variant="outline">Features</Button>
            </Link>
            <Link to="/how-it-works">
              <Button>How it works</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
