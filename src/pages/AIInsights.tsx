import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askAiAssistant, getAiInsights, getLatestAiInsights } from "@/services/ai";
import { getGoals } from "@/services/goals";
import { listNotes } from "@/services/notes";
import { listProjects } from "@/services/projects";
import { getLatestResume } from "@/services/resume";
import type { AiInsightsResponse, AiInsightItem, AiQuickStat, GoalProfile } from "@/types/models";
import { getCurrentUserId } from "@/services/authIdentity";

function iconForKind(kind: AiInsightItem["kind"]) {
  switch (kind) {
    case "skill_gap":
      return Target;
    case "career_path":
      return TrendingUp;
    case "learning":
      return BookOpen;
    default:
      return Sparkles;
  }
}

const AIInsights = () => {
  const navigate = useNavigate();
  const userId = getCurrentUserId() ?? "anon";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AiInsightItem[]>([]);
  const [quickStats, setQuickStats] = useState<AiQuickStat[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalProfile | null>(null);
  const [details, setDetails] = useState<AiInsightsResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const CACHE_KEY = useMemo(() => `aiInsights.cache.v1.${userId}`, [userId]);
  const GOALS_CACHE_KEY = useMemo(() => `aiInsights.goals.v1.${userId}`, [userId]);

  const applyInsightsResult = useCallback((result: AiInsightsResponse) => {
    setDetails(result);
    setInsights(result.insights ?? []);
    setQuickStats(result.quickStats ?? []);
    setLastUpdated(result.generatedAt ?? null);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
  }, [CACHE_KEY]);

  const hydrateFromCache = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AiInsightsResponse;
      if (!parsed || typeof parsed !== "object") return;

      applyInsightsResult(parsed);
    } catch {
      // ignore cache failures
    }
  }, [applyInsightsResult, CACHE_KEY]);

  const loadLatestPersisted = useCallback(async () => {
    try {
      const latest = await getLatestAiInsights();
      if (!latest) return;

      const cachedRaw = sessionStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as AiInsightsResponse;
          const cachedTime = cached?.generatedAt ? new Date(cached.generatedAt).getTime() : 0;
          const latestTime = latest?.generatedAt ? new Date(latest.generatedAt).getTime() : 0;
          if (latestTime && cachedTime && latestTime <= cachedTime) return;
        } catch {
          // ignore
        }
      }

      applyInsightsResult(latest);
    } catch {
      // ignore
    }
  }, [applyInsightsResult, CACHE_KEY]);

  const hydrateGoalsFromCache = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(GOALS_CACHE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as GoalProfile;
      if (!parsed || typeof parsed !== "object") return false;
      setGoals(parsed);
      return true;
    } catch {
      return false;
    }
  }, [GOALS_CACHE_KEY]);

  const loadGoals = useCallback(async () => {
    try {
      const g = await getGoals();
      setGoals(g);
      sessionStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(g));
    } catch {
      // ignore
    }
  }, [GOALS_CACHE_KEY]);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resume, goals, notes, projects] = await Promise.all([
        getLatestResume(),
        getGoals(),
        listNotes(),
        listProjects(),
      ]);

      setGoals(goals);
      sessionStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(goals));

      if (!resume.text?.trim()) {
        throw new Error("Upload your resume first (Resume page) to generate insights.");
      }

      const notesText = notes
        .map((n) => `Title: ${n.title}\nTags: ${(n.tags ?? []).join(", ") || "(none)"}\n${n.content}`)
        .join("\n\n---\n\n");

      const projectsText = projects
        .map(
          (p) =>
            `Title: ${p.title}\nStatus: ${p.status}\nTech: ${(p.technologies ?? []).join(", ") || "(none)"}\n${p.description}`,
        )
        .join("\n\n---\n\n");

      const result = await getAiInsights({
        resumeText: resume.text,
        notes: notesText,
        projects: projectsText,
        goals: { targetRoles: goals.targetRoles, interests: goals.interests },
      });

      applyInsightsResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [applyInsightsResult, GOALS_CACHE_KEY]);

  const sendChat = useCallback(async () => {
    const prompt = chatInput.trim();
    if (!prompt) return;

    setChatError(null);
    setChatLoading(true);
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const res = await askAiAssistant({ prompt });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Assistant request failed";
      setChatError(message);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput]);

  const ensureDetailsThenOpen = useCallback(
    async () => {
      if (!details) {
        await loadInsights();
      }
      setDetailsOpen(true);
      // allow layout to update before scroll
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    },
    [details, loadInsights],
  );

  useEffect(() => {
    hydrateFromCache();
    const hadGoals = hydrateGoalsFromCache();
    if (!hadGoals) {
      void loadGoals();
    }

    // Prefer the server-persisted insights if they exist.
    void loadLatestPersisted();
  }, [hydrateFromCache, hydrateGoalsFromCache, loadGoals, loadLatestPersisted]);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return "Not generated yet";
    const date = new Date(lastUpdated);
    if (Number.isNaN(date.getTime())) return lastUpdated;
    return date.toLocaleString();
  }, [lastUpdated]);

  const hasGoals = useMemo(() => {
    const roles = goals?.targetRoles?.filter(Boolean) ?? [];
    const interests = goals?.interests?.filter(Boolean) ?? [];
    return roles.length > 0 || interests.length > 0;
  }, [goals]);

  return (
    <DashboardLayout
      title="AI Insights"
      subtitle="AI-powered career intelligence and recommendations."
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Personalized Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {formattedLastUpdated}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={loadInsights}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? "Refreshing..." : "Refresh Insights"}
        </Button>
      </div>

      {error ? (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : null}

      {!hasGoals ? (
        <div className="mb-6 bg-secondary border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Add Goals for accurate skill-gap analysis</p>
            <p className="text-xs text-muted-foreground">
              Set your target roles and interests so insights are tailored to your career direction.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/resume")}>
              Add goals
            </Button>
            <Button onClick={loadInsights} disabled={loading}>
              {loading ? "Refreshing..." : "Import & refresh"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Goals used for analysis</p>
          <div className="flex flex-wrap gap-2">
            {(goals?.targetRoles ?? []).map((role) => (
              <Badge key={`role-${role}`} variant="secondary">{role}</Badge>
            ))}
            {(goals?.interests ?? []).map((interest) => (
              <Badge key={`interest-${interest}`} variant="outline">{interest}</Badge>
            ))}
            <Button variant="ghost" className="h-7 px-2" onClick={() => navigate("/resume")}>
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {(quickStats.length
          ? quickStats
          : [
              { label: "Skills Analyzed", value: 0 },
              { label: "Recommendations", value: 0 },
              { label: "Insights Generated", value: 0 },
              { label: "Goals Tracked", value: 0 },
            ])
          .map((stat, index) => (
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
        {(insights.length
          ? insights
          : [
              {
                kind: "skill_gap" as const,
                title: "Generate insights to see results",
                description: "Click Refresh Insights to generate personalized recommendations.",
                action: "Refresh now",
                type: "insight" as const,
              },
            ])
          .map((insight, index) => {
            const Icon = iconForKind(insight.kind);
            return (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 card-glow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {insight.description}
                </p>
                <button
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={() => {
                    if (insight.action.toLowerCase().includes("refresh")) {
                      void loadInsights();
                      return;
                    }
                    void ensureDetailsThenOpen();
                  }}
                  type="button"
                >
                  {insight.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
            );
          })}
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
        {!chatOpen ? (
          <div>
            <div className="bg-secondary rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground italic">
                "What skills should I learn next to become a senior developer?"
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 gradient-border ml-4">
              <p className="text-sm text-foreground">Ask a question and I’ll answer using your resume + goals.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Examples: “What should I improve in my resume?”, “What projects should I build next?”, “Which role suits me best?”
              </p>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => {
                  setChatOpen(true);
                  setMessages([]);
                  setChatError(null);
                }}
              >
                Start New Conversation
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Ask anything — I’ll use your latest resume + goals to answer.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div
                    key={`${m.role}-${idx}`}
                    className={
                      m.role === "user"
                        ? "bg-secondary rounded-lg p-4"
                        : "bg-muted/50 rounded-lg p-4 gradient-border ml-4"
                    }
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            {chatLoading ? (
              <div className="bg-muted/50 rounded-lg p-4 gradient-border ml-4">
                <p className="text-sm text-muted-foreground">Thinking…</p>
              </div>
            ) : null}

            {chatError ? <p className="text-xs text-destructive">{chatError}</p> : null}

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={chatInput}
                placeholder="Ask a question…"
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendChat();
                  }
                }}
                disabled={chatLoading}
              />
              <Button onClick={() => void sendChat()} disabled={chatLoading || !chatInput.trim()} className="sm:w-auto">
                {chatLoading ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detailed sections (only shown on click) */}
      {detailsOpen && details ? (
        <div ref={detailsRef} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Detailed Skill Gap Analysis</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Target roles</p>
                <div className="flex flex-wrap gap-2">
                  {(details.skillGapAnalysis?.targetRoles ?? []).length ? (
                    (details.skillGapAnalysis?.targetRoles ?? []).map((r) => (
                      <Badge key={r} variant="secondary">{r}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No target roles set — add Goals for a tighter analysis.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {(details.skillGapAnalysis?.strengths ?? []).length ? (
                    (details.skillGapAnalysis?.strengths ?? []).map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No strengths extracted.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Gaps (prioritized)</p>
                {(details.skillGapAnalysis?.gaps ?? []).length ? (
                  <div className="space-y-3">
                    {details.skillGapAnalysis.gaps.map((gap, idx) => (
                      <div key={`${gap.skill}-${idx}`} className="bg-secondary rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{gap.skill}</p>
                            <p className="text-sm text-muted-foreground mt-1">{gap.reason}</p>
                            {gap.evidence ? (
                              <p className="text-xs text-muted-foreground mt-2">Evidence: {gap.evidence}</p>
                            ) : null}
                          </div>
                          <Badge
                            variant={gap.priority === "high" ? "destructive" : gap.priority === "medium" ? "secondary" : "outline"}
                          >
                            {gap.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No gaps generated yet. Click Refresh Insights.</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Learning Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Learning Recommendations</h3>
            </div>
            {(details.learningRecommendations ?? []).length ? (
              <div className="space-y-4">
                {details.learningRecommendations.map((rec, idx) => (
                  <div key={`${rec.title}-${idx}`} className="bg-secondary rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{rec.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rec.why}</p>
                      </div>
                      {rec.timeframeWeeks ? (
                        <Badge variant="outline">{rec.timeframeWeeks} weeks</Badge>
                      ) : null}
                    </div>
                    {(rec.steps ?? []).length ? (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {rec.steps.map((s, sIdx) => (
                          <li key={`${idx}-step-${sIdx}`}>• {s}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No learning recommendations yet.</span>
            )}
          </motion.div>

          {/* Career Path Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Career Path Suggestions</h3>
            </div>
            {(details.careerPathSuggestions ?? []).length ? (
              <div className="space-y-4">
                {details.careerPathSuggestions.map((path, idx) => (
                  <div key={`${path.title}-${idx}`} className="bg-secondary rounded-lg p-4">
                    <p className="font-medium text-foreground">{path.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{path.why}</p>
                    {(path.nextSteps ?? []).length ? (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {path.nextSteps.map((s, sIdx) => (
                          <li key={`${idx}-next-${sIdx}`}>• {s}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No career paths yet.</span>
            )}
          </motion.div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default AIInsights;
