import { motion } from "framer-motion";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { getLatestAiInsights, getSkillProgress } from "@/services/ai";
import type { AiInsightsResponse, Note, Project, ResumeAnalysis, SkillProgressResponse } from "@/types/models";
import { getCurrentUserId } from "@/services/authIdentity";

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

function readCachedInsights(userId: string): AiInsightsResponse | null {
  try {
    const raw = sessionStorage.getItem(`aiInsights.cache.v1.${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AiInsightsResponse;
  } catch {
    return null;
  }
}

function normalizeSkill(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/g, "");
}

export default function Index() {
  const userId = getCurrentUserId() ?? "anon";
  const notesQuery = useQuery({
    queryKey: ["notes", userId],
    queryFn: listNotes,
    staleTime: 30_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", userId],
    queryFn: listProjects,
    staleTime: 30_000,
  });

  const resumeQuery = useQuery({
    queryKey: ["resume", "latest", userId],
    queryFn: getLatestResume,
    staleTime: 60_000,
    retry: false,
  });

  const goalsQuery = useQuery({
    queryKey: ["goals", userId],
    queryFn: getGoals,
    staleTime: 60_000,
  });

  const insightsLatestQuery = useQuery({
    queryKey: ["ai", "insights", "latest", userId],
    queryFn: getLatestAiInsights,
    staleTime: 60_000,
    retry: false,
  });

  const skillProgressQuery = useQuery({
    queryKey: ["ai", "skill-progress", userId],
    queryFn: getSkillProgress,
    staleTime: 60_000,
    retry: false,
  });

  const cachedInsights = useMemo(() => readCachedInsights(userId), [userId]);
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
  const focusArea =
    insights?.skillGapAnalysis?.gaps?.[0]?.skill ??
    resumeQuery.data?.analysis?.gaps?.[0] ??
    insights?.insights?.[0]?.title ??
    null;

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

  const nextGoalLabel = nextGoal ?? (goalsQuery.data ? "Add a target role or interest" : "Set your goals");
  const focusAreaLabel = focusArea ?? (insights ? "Review your insights" : "Generate AI Insights");

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

  const heuristicSkills = useMemo(() => {
    const resumeAnalysis: ResumeAnalysis | undefined = resumeQuery.data?.analysis;

    const projectCounts = new Map<string, number>();
    for (const p of projects) {
      for (const tech of p.technologies ?? []) {
        const key = normalizeSkill(tech);
        if (!key) continue;
        projectCounts.set(key, (projectCounts.get(key) ?? 0) + 1);
      }
    }

    const strengthSkills = new Set<string>();
    const addStrengths = (values: string[] | undefined) => {
      for (const v of values ?? []) {
        const key = normalizeSkill(v);
        if (!key) continue;
        strengthSkills.add(key);
      }
    };
    addStrengths(insights?.skillGapAnalysis?.strengths);
    addStrengths(resumeAnalysis?.strengths);

    const gapPenaltyBySkill = new Map<string, number>();
    for (const g of insights?.skillGapAnalysis?.gaps ?? []) {
      const key = normalizeSkill(g.skill);
      if (!key) continue;
      const penalty = g.priority === "high" ? 30 : g.priority === "medium" ? 20 : 10;
      gapPenaltyBySkill.set(key, Math.max(gapPenaltyBySkill.get(key) ?? 0, penalty));
    }
    // Resume analysis gaps may be less structured; treat as mild penalty.
    for (const g of resumeAnalysis?.gaps ?? []) {
      const key = normalizeSkill(g);
      if (!key) continue;
      gapPenaltyBySkill.set(key, Math.max(gapPenaltyBySkill.get(key) ?? 0, 10));
    }

    const allSkills = new Set<string>();
    for (const k of projectCounts.keys()) allSkills.add(k);
    for (const k of strengthSkills) allSkills.add(k);
    for (const k of gapPenaltyBySkill.keys()) allSkills.add(k);

    const maxProjectCount = Math.max(1, ...Array.from(projectCounts.values()));

    const scored = Array.from(allSkills).map((skill) => {
      const count = projectCounts.get(skill) ?? 0;
      const hasStrength = strengthSkills.has(skill);
      const gapPenalty = gapPenaltyBySkill.get(skill) ?? 0;

      // Start from evidence: projects weigh most. Strengths help. Gaps reduce.
      let score = 0;
      if (count > 0) {
        score = 50 + Math.round((count / maxProjectCount) * 50);
      } else if (hasStrength) {
        score = 65;
      } else {
        score = 45;
      }

      if (hasStrength) score += 10;
      score -= gapPenalty;
      score = Math.max(10, Math.min(100, score));

      return { skill, percentage: score };
    });

    scored.sort((a, b) => b.percentage - a.percentage);

    const palette = ["cyan", "purple", "green", "orange"] as const;
    return scored.slice(0, 4).map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length],
    }));
  }, [projects, insights?.skillGapAnalysis?.strengths, insights?.skillGapAnalysis?.gaps, resumeQuery.data?.analysis]);

  const skills = useMemo(() => {
    const data = skillProgressQuery.data as SkillProgressResponse | null | undefined;
    if (data?.skills?.length) {
      const palette = ["cyan", "purple", "green", "orange"] as const;
      return data.skills.slice(0, 4).map((s, idx) => ({
        skill: s.skill,
        percentage: Math.max(0, Math.min(100, Math.round(s.percentage))),
        color: palette[idx % palette.length],
      }));
    }
    return heuristicSkills;
  }, [skillProgressQuery.data, heuristicSkills]);

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
                Add projects, upload your resume, or generate AI Insights to see skill progress.
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
              {focusAreaLabel}
            </p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Learning Streak</p>
            <p className="text-foreground font-medium">{learningStreakDays} days</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Next Goal</p>
            <p className="text-foreground font-medium">{nextGoalLabel}</p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
