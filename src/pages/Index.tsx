import { motion } from "framer-motion";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import SkillProgress from "@/components/dashboard/SkillProgress";

import {
  Clock,
  FileCode,
  FileText,
  FileUser,
  FolderGit,
  FolderKanban,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { listNotes } from "@/services/notes";
import { listProjects } from "@/services/projects";
import { getLatestResume } from "@/services/resume";
import { getGoals } from "@/services/goals";
import { getLatestAiInsights } from "@/services/ai";
import type { AiInsightsResponse, Note, Project } from "@/types/models";

function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 45) return "just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hours ago`;
  if (day === 1) return "1 day ago";
  return `${day} days ago`;
}

function isWithinLastDays(date: Date, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

function computeStreakDays(dates: Date[]): number {
  const uniqueDays = new Set<string>();
  for (const d of dates) {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    uniqueDays.add(key);
  }

  let streak = 0;
  for (;;) {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - streak);
    const key = `${target.getFullYear()}-${target.getMonth()}-${target.getDate()}`;
    if (!uniqueDays.has(key)) break;
    streak += 1;
  }
  return streak;
}

function readCachedInsights(): AiInsightsResponse | null {
  try {
    const raw = sessionStorage.getItem("aiInsights.cache.v1");
    if (!raw) return null;
    return JSON.parse(raw) as AiInsightsResponse;
  } catch {
    return null;
  }
}

export default function Index() {
  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: listNotes,
    staleTime: 30_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    staleTime: 30_000,
  });

  const resumeQuery = useQuery({
    queryKey: ["resume", "latest"],
    queryFn: getLatestResume,
    staleTime: 60_000,
    retry: false,
  });

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
    staleTime: 60_000,
  });

  const insightsLatestQuery = useQuery({
    queryKey: ["ai", "insights", "latest"],
    queryFn: getLatestAiInsights,
    staleTime: 60_000,
    retry: false,
  });

  const cachedInsights = useMemo(() => readCachedInsights(), []);
  const insights = (insightsLatestQuery.data ?? cachedInsights) as AiInsightsResponse | null;

  const notes = (notesQuery.data ?? []) as Note[];
  const projects = (projectsQuery.data ?? []) as Project[];

  const notesThisWeek = useMemo(() => {
    return notes.filter((n) => {
      const d = toDate(n.createdAt) ?? toDate(n.updatedAt);
      return d ? isWithinLastDays(d, 7) : false;
    }).length;
  }, [notes]);

  const inProgressCount = useMemo(
    () => projects.filter((p) => p.status === "In Progress").length,
    [projects],
  );

  const resumeUploadedAt = useMemo(() => {
    const r = resumeQuery.data;
    return toDate(r?.updatedAt) ?? toDate(r?.createdAt);
  }, [resumeQuery.data]);

  const resumeLabel = resumeQuery.data?.fileName ? "Uploaded" : "Not uploaded";
  const resumeChange = resumeUploadedAt ? `Updated ${timeAgo(resumeUploadedAt)}` : "Upload your resume";

  const insightsCount = insights?.insights?.length ?? 0;
  const recommendationsCount = insights?.insights?.filter((i) => i.type === "recommendation").length ?? 0;
  const focusArea = insights?.skillGapAnalysis?.gaps?.[0]?.skill ?? null;

  const activityDates = useMemo(() => {
    const ds: Date[] = [];
    for (const n of notes) {
      const d = toDate(n.updatedAt) ?? toDate(n.createdAt);
      if (d) ds.push(d);
    }
    for (const p of projects) {
      const d = toDate(p.updatedAt) ?? toDate(p.createdAt);
      if (d) ds.push(d);
    }
    if (resumeUploadedAt) ds.push(resumeUploadedAt);
    const insightsDate = toDate(insights?.generatedAt);
    if (insightsDate) ds.push(insightsDate);
    return ds;
  }, [notes, projects, resumeUploadedAt, insights?.generatedAt]);

  const learningStreakDays = useMemo(() => computeStreakDays(activityDates), [activityDates]);

  const nextGoal = useMemo(() => {
    const roles = goalsQuery.data?.targetRoles?.filter(Boolean) ?? [];
    const interests = goalsQuery.data?.interests?.filter(Boolean) ?? [];
    return roles[0] ?? interests[0] ?? null;
  }, [goalsQuery.data]);

  const stats = useMemo(
    () => [
      {
        title: "Total Notes",
        value: notes.length,
        change: notesThisWeek ? `+${notesThisWeek} this week` : "No new notes this week",
        changeType: notesThisWeek ? ("positive" as const) : ("neutral" as const),
        icon: FileText,
      },
      {
        title: "Active Projects",
        value: projects.length,
        change: `${inProgressCount} in progress`,
        changeType: "neutral" as const,
        icon: FolderKanban,
      },
      {
        title: "Resume",
        value: resumeLabel,
        change: resumeChange,
        changeType: resumeQuery.data?.fileName ? ("positive" as const) : ("neutral" as const),
        icon: FileUser,
      },
      {
        title: "AI Insights",
        value: insightsCount,
        change: recommendationsCount ? `${recommendationsCount} recommendations` : "Generate insights in AI Insights",
        changeType: recommendationsCount ? ("positive" as const) : ("neutral" as const),
        icon: Sparkles,
      },
    ],
    [
      notes.length,
      notesThisWeek,
      projects.length,
      inProgressCount,
      resumeLabel,
      resumeChange,
      resumeQuery.data?.fileName,
      insightsCount,
      recommendationsCount,
    ],
  );

  const activities = useMemo(() => {
    const items: Array<{ icon: any; title: string; time: string; date: Date }> = [];

    for (const n of notes) {
      const d = toDate(n.updatedAt) ?? toDate(n.createdAt);
      if (!d) continue;
      items.push({ icon: FileCode, title: `Note: ${n.title}`, time: timeAgo(d), date: d });
    }

    for (const p of projects) {
      const d = toDate(p.updatedAt) ?? toDate(p.createdAt);
      if (!d) continue;
      items.push({ icon: FolderGit, title: `Project: ${p.title}`, time: timeAgo(d), date: d });
    }

    if (resumeUploadedAt && resumeQuery.data?.fileName) {
      items.push({
        icon: FileUser,
        title: `Resume uploaded: ${resumeQuery.data.fileName}`,
        time: timeAgo(resumeUploadedAt),
        date: resumeUploadedAt,
      });
    }

    const insightsDate = toDate(insights?.generatedAt);
    if (insightsDate) {
      items.push({ icon: Sparkles, title: "AI Insights generated", time: timeAgo(insightsDate), date: insightsDate });
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6).map(({ date: _d, ...rest }) => rest);
  }, [notes, projects, resumeUploadedAt, resumeQuery.data?.fileName, insights?.generatedAt]);

  const skills = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const tech of p.technologies ?? []) {
        const key = tech.trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 4);
    const max = top[0]?.[1] ?? 1;
    const palette = ["cyan", "purple", "green", "orange"] as const;
    return top.map(([skill, count], idx) => ({
      skill,
      percentage: Math.round((count / max) * 100),
      color: palette[idx % palette.length],
    }));
  }, [projects]);

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
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            <Link
              to="/notes"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div>
            {activities.length ? (
              activities.map((activity) => <ActivityItem key={activity.title} {...activity} />)
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
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
            <h2 className="text-lg font-semibold text-foreground">Skill Progress</h2>
          </div>
          <div className="space-y-4">
            {skills.length ? (
              skills.map((skill, index) => (
                <SkillProgress key={skill.skill} {...skill} delay={0.6 + index * 0.1} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Add technologies to your projects to see skill progress.
              </p>
            )}
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
            <p className="text-foreground font-medium">
              {focusArea ?? "Generate AI Insights"}
            </p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Learning Streak</p>
            <p className="text-foreground font-medium">{learningStreakDays} days</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Next Goal</p>
            <p className="text-foreground font-medium">{nextGoal ?? "Add goals in Resume"}</p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
