import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landingSteps } from "@/components/landing_pages/data";
import { getAuthToken } from "@/services/authToken";
import { fadeUpItem, staggerContainer } from "@/components/landing_pages/motion";

export default function LandingHowItWorks() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getAuthToken());

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        <motion.div variants={fadeUpItem}>
          <Badge variant="secondary">Simple flow</Badge>
        </motion.div>
        <motion.h1 variants={fadeUpItem} className="text-2xl font-semibold text-foreground sm:text-3xl">
          How it works
        </motion.h1>
        <motion.p variants={fadeUpItem} className="text-muted-foreground">
          A short workflow to go from “where am I?” to “what should I do next?”
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-8 grid gap-4 md:grid-cols-2"
      >
        {landingSteps.map((s, idx) => (
          <motion.div key={s.title} variants={fadeUpItem}>
            <Card className="border-border h-full">
              <CardHeader>
                <CardTitle className="text-base">{idx + 1}. {s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{s.description}</CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem} initial="initial" animate="animate" className="mt-10">
        <Card className="border-border">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold text-foreground">Ready to start?</div>
              <div className="text-sm text-muted-foreground">Create your account and head to the dashboard.</div>
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
    </main>
  );
}
