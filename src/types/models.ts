export type NoteAccentColor = "cyan" | "purple" | "green" | "orange";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ProjectStatus = "In Progress" | "Completed" | "Planning";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface GoalProfile {
  id: string;
  targetRoles: string[];
  interests: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ResumeEntry {
  id: string;
  fileName: string;
  mimeType: string;
  text: string;
  textHash?: string;
  analysis?: ResumeAnalysis;
  analyzedAt?: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  careerPaths: string[];
  nextSteps: string[];
  explanation: string;
  raw?: string;
}

export type AiInsightKind = "skill_gap" | "career_path" | "learning";

export interface AiInsightItem {
  kind: AiInsightKind;
  title: string;
  description: string;
  action: string;
  type: "recommendation" | "insight";
}

export interface SkillGapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  reason: string;
  evidence?: string;
}

export interface AiInsightsResponse {
  generatedAt: string;
  quickStats: AiQuickStat[];
  insights: AiInsightItem[];
  skillGapAnalysis: {
    targetRoles: string[];
    strengths: string[];
    gaps: SkillGapItem[];
  };
  learningRecommendations: Array<{
    title: string;
    why: string;
    steps: string[];
    timeframeWeeks?: number;
  }>;
  careerPathSuggestions: Array<{
    title: string;
    why: string;
    nextSteps: string[];
  }>;
  raw?: string;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  action: string;
  type: "recommendation" | "insight";
}

export interface AiQuickStat {
  label: string;
  value: number;
}

export interface SkillProgressResponse {
  generatedAt: string; // ISO
  skills: Array<{ skill: string; percentage: number }>;
}
