import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landingFeatures } from "@/components/landing_pages/data";
import { fadeUpItem, staggerContainer } from "@/components/landing_pages/motion";

export default function LandingFeatures() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        <motion.div variants={fadeUpItem}>
          <Badge variant="secondary">Everything in one place</Badge>
        </motion.div>
        <motion.h1 variants={fadeUpItem} className="text-2xl font-semibold text-foreground sm:text-3xl">
          Features
        </motion.h1>
        <motion.p variants={fadeUpItem} className="text-muted-foreground">
          A quick overview of what Axesis can do today.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
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
      </motion.div>
    </main>
  );
}
