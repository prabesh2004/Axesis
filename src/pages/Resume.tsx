import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getGoals, updateGoals } from "@/services/goals";
import { analyzeResume } from "@/services/ai";
import { getLatestResume, uploadResume } from "@/services/resume";
import { listNotes } from "@/services/notes";
import { listProjects } from "@/services/projects";
import type { ResumeAnalysis } from "@/types/models";
import { getCurrentUserId } from "@/services/authIdentity";
import {
  CheckCircle,
  AlertCircle,
  Target,
} from "lucide-react";

type GoalState = {
  targetRoles: string[];
  interests: string[];
};

const normalizeTags = (values: string[]) => {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const parseTags = (input: string) =>
  normalizeTags(input.split(",").map((value) => value.trim()));

const Resume = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userId = getCurrentUserId() ?? "anon";
  const RESUME_ANALYSIS_CACHE_KEY = `axesis.resumeAnalysis.v1.${userId}`;
  const [goals, setGoals] = useState<GoalState>({
    targetRoles: [],
    interests: [],
  });
  const [targetInput, setTargetInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeTextHash, setResumeTextHash] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const readCachedAnalysis = (textHash: string): ResumeAnalysis | null => {
    try {
      const raw = sessionStorage.getItem(RESUME_ANALYSIS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { textHash?: string; analysis?: ResumeAnalysis };
      if (!parsed || parsed.textHash !== textHash || !parsed.analysis) return null;
      return parsed.analysis;
    } catch {
      return null;
    }
  };

  const writeCachedAnalysis = (textHash: string, next: ResumeAnalysis) => {
    try {
      sessionStorage.setItem(
        RESUME_ANALYSIS_CACHE_KEY,
        JSON.stringify({ textHash, analysis: next, cachedAt: new Date().toISOString() }),
      );
    } catch {
      // Ignore cache failures.
    }
  };

  const clearCachedAnalysis = () => {
    try {
      sessionStorage.removeItem(RESUME_ANALYSIS_CACHE_KEY);
    } catch {
      // Ignore cache failures.
    }
  };

  useEffect(() => {
    let active = true;
    getGoals()
      .then((data) => {
        if (!active) return;
        setGoals({
          targetRoles: data.targetRoles ?? [],
          interests: data.interests ?? [],
        });
      })
      .catch(() => {
        // Keep local defaults on failure.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getLatestResume()
      .then((data) => {
        if (!active) return;
        setResumeText(data.text);
        setResumeFileName(data.fileName);

        const textHash = data.textHash ?? null;
        setResumeTextHash(textHash);

        if (data.analysis) {
          setAnalysis(data.analysis);
          if (textHash) writeCachedAnalysis(textHash, data.analysis);
          return;
        }

        if (textHash) {
          const cached = readCachedAnalysis(textHash);
          if (cached) setAnalysis(cached);
        }
      })
      .catch(() => {
        if (!active) return;
        setResumeText("");
        setResumeFileName(null);
        setResumeTextHash(null);
        setAnalysis(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const persistGoals = (next: GoalState) => {
    setGoals(next);
    void updateGoals(next).catch(() => {
      // Keep local state even if save fails.
    });
  };

  const addTags = (field: keyof GoalState, input: string) => {
    const incoming = parseTags(input);
    if (!incoming.length) return;
    const merged = normalizeTags([...goals[field], ...incoming]);
    persistGoals({ ...goals, [field]: merged });
  };

  const removeTag = (field: keyof GoalState, value: string) => {
    const next = goals[field].filter((tag) => tag !== value);
    persistGoals({ ...goals, [field]: next });
  };

  const hasGoals = useMemo(
    () => goals.targetRoles.length > 0 || goals.interests.length > 0,
    [goals.targetRoles.length, goals.interests.length],
  );

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setAnalysisError(null);
    setIsUploading(true);
    try {
      const result = await uploadResume(file);
      setResumeText(result.text);
      setResumeFileName(result.fileName);
      setResumeTextHash(result.textHash ?? null);
      setAnalysis(null);
      clearCachedAnalysis();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setAnalysisError("Upload a resume to analyze.");
      return;
    }
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const [notes, projects] = await Promise.all([listNotes(), listProjects()]);
      const notesText = notes
        .map((note) => `Title: ${note.title}\nTags: ${note.tags.join(", ")}\n${note.content}`)
        .join("\n\n");
      const projectsText = projects
        .map((project) =>
          `Title: ${project.title}\nStatus: ${project.status}\nTech: ${project.technologies.join(", ")}\n${project.description}`,
        )
        .join("\n\n");

      const result = await analyzeResume({
        resumeText,
        notes: notesText,
        projects: projectsText,
        goals,
      });
      setAnalysis(result);
      if (resumeTextHash) writeCachedAnalysis(resumeTextHash, result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout
      title="Resume"
      subtitle="Manage and optimize your professional resume."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Goals</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Add your target roles and interests to guide AI recommendations.
              Separate items with commas.
            </p>

            <div className="mt-4 space-y-4">
              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Target Roles
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    value={targetInput}
                    placeholder="e.g. Software developer, Backend dev"
                    onChange={(event) => setTargetInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTags("targetRoles", targetInput);
                        setTargetInput("");
                      }
                    }}
                    onBlur={() => {
                      addTags("targetRoles", targetInput);
                      if (targetInput.trim()) setTargetInput("");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addTags("targetRoles", targetInput);
                      setTargetInput("");
                    }}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goals.targetRoles.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No target roles yet.
                    </span>
                  )}
                  {goals.targetRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="gap-1">
                      {role}
                      <button
                        type="button"
                        onClick={() => removeTag("targetRoles", role)}
                        className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${role}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Interests
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    value={interestInput}
                    placeholder="e.g. AI tools, SaaS, fintech"
                    onChange={(event) => setInterestInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTags("interests", interestInput);
                        setInterestInput("");
                      }
                    }}
                    onBlur={() => {
                      addTags("interests", interestInput);
                      if (interestInput.trim()) setInterestInput("");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addTags("interests", interestInput);
                      setInterestInput("");
                    }}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goals.interests.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No interests yet.
                    </span>
                  )}
                  {goals.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="gap-1">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeTag("interests", interest)}
                        className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${interest}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {!hasGoals && (
              <p className="mt-4 text-xs text-muted-foreground">
                Add goals to personalize AI insights and resume scoring.
              </p>
            )}
          </motion.div>

          {/* Resume Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Resume Preview
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isAnalyzing}
                >
                  Upload
                </Button>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleAnalyze}
                  disabled={isUploading || isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {resumeFileName ? `Uploaded: ${resumeFileName}` : "No resume uploaded"}
            </p>
            {uploadError && (
              <p className="text-xs text-destructive mb-4">{uploadError}</p>
            )}
            {analysisError && (
              <p className="text-xs text-destructive mb-4">{analysisError}</p>
            )}

            {/* Resume Content */}
            <div className="bg-secondary rounded-lg p-6">
              {resumeText ? (
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {resumeText}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Upload your resume to view extracted content here.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Resume Score & Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Score Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm text-muted-foreground mb-2">Resume Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">
                {analysis?.score ?? 0}
              </span>
              <span className="text-muted-foreground mb-1">/100</span>
            </div>
            <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis?.score ?? 0}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full progress-gradient"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {analysis?.summary ?? "Upload your resume and run analysis."}
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Suggestions</h3>
            <div className="space-y-3">
              {(analysis?.recommendations ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Run analysis to see AI suggestions.
                </p>
              )}
              {(analysis?.recommendations ?? []).map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item}</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis?.explanation ?? ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;
