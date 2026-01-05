import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const insights = [
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Based on your career goals, you should focus on System Design and Cloud Architecture. These are commonly required for senior positions.",
    action: "View detailed analysis",
    type: "recommendation",
  },
  {
    icon: TrendingUp,
    title: "Career Path Suggestion",
    description:
      "Your current trajectory aligns well with Full Stack Developer roles. Consider specializing in either frontend or backend for faster advancement.",
    action: "Explore career paths",
    type: "insight",
  },
  {
    icon: BookOpen,
    title: "Learning Recommendation",
    description:
      "Complete the AWS Solutions Architect certification to strengthen your cloud skills. This complements your existing Node.js expertise.",
    action: "Start learning path",
    type: "recommendation",
  },
];

const quickStats = [
  { label: "Skills Analyzed", value: 24 },
  { label: "Recommendations", value: 12 },
  { label: "Insights Generated", value: 47 },
  { label: "Goals Tracked", value: 5 },
];

const AIInsights = () => {
  return (
    <DashboardLayout
      title="AI Insights"
      subtitle="AI-powered career intelligence and recommendations."
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Personalized Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: 2 hours ago
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Insights
        </Button>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 card-glow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <insight.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {insight.description}
                </p>
                <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  {insight.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Chat Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Ask AI Assistant</h3>
        </div>
        <div className="bg-secondary rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground italic">
            "What skills should I learn next to become a senior developer?"
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 gradient-border ml-4">
          <p className="text-sm text-foreground">
            Based on your current profile, I recommend focusing on these areas:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• System Design & Architecture patterns</li>
            <li>• Advanced TypeScript & design patterns</li>
            <li>• Cloud services (AWS/GCP) with focus on serverless</li>
            <li>• Performance optimization & monitoring</li>
          </ul>
        </div>
        <div className="mt-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start New Conversation
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AIInsights;
