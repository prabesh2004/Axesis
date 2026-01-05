import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import SkillProgress from "@/components/dashboard/SkillProgress";
import {
  FileText,
  FolderKanban,
  FileUser,
  Sparkles,
  Clock,
  TrendingUp,
  FileCode,
  FolderGit,
} from "lucide-react";

const stats = [
  {
    title: "Total Notes",
    value: 24,
    change: "+3 this week",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Active Projects",
    value: 5,
    change: "2 in progress",
    changeType: "neutral" as const,
    icon: FolderKanban,
  },
  {
    title: "Resume Score",
    value: "78%",
    change: "+12% improvement",
    changeType: "positive" as const,
    icon: FileUser,
  },
  {
    title: "AI Insights",
    value: 12,
    change: "3 new recommendations",
    changeType: "positive" as const,
    icon: Sparkles,
  },
];

const activities = [
  { icon: FileCode, title: "React Hooks Deep Dive", time: "2 hours ago" },
  { icon: FolderGit, title: "Portfolio Website v2", time: "5 hours ago" },
  { icon: Sparkles, title: "Skill Gap Analysis completed", time: "1 day ago" },
  { icon: FileUser, title: "Resume updated", time: "2 days ago" },
];

const skills = [
  { skill: "React", percentage: 85, color: "cyan" as const },
  { skill: "TypeScript", percentage: 70, color: "purple" as const },
  { skill: "Node.js", percentage: 60, color: "cyan" as const },
  { skill: "MongoDB", percentage: 55, color: "green" as const },
];

const Index = () => {
  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Recent Activity
              </h2>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View all →
            </button>
          </div>
          <div>
            {activities.map((activity) => (
              <ActivityItem key={activity.title} {...activity} />
            ))}
          </div>
        </motion.div>

        {/* Skill Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Skill Progress
            </h2>
          </div>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <SkillProgress key={skill.skill} {...skill} delay={0.6 + index * 0.1} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="mt-6 bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Quick Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
            <p className="text-foreground font-medium">System Design</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Learning Streak</p>
            <p className="text-foreground font-medium">7 days</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Next Goal</p>
            <p className="text-foreground font-medium">Complete AWS Certification</p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

// Fix missing import
import { Settings } from "lucide-react";

export default Index;
