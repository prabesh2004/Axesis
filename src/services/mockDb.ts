import type { AuthResponse, AuthUser, GoalProfile, Note, Project, ResumeAnalysis, ResumeEntry } from "@/types/models";
import type { AiInsightsResponse } from "@/types/models";
import { generateId, readJson, writeJson } from "@/services/storage";

const KEYS = {
  notes: "axesis.notes.v1",
  projects: "axesis.projects.v1",
  users: "axesis.users.v1",
  goals: "axesis.goals.v1",
  resume: "axesis.resume.v1",
  aiInsights: "axesis.aiInsights.v1",
} as const;

type StoredUser = AuthUser & { password: string };

function nowIso() {
  return new Date().toISOString();
}

function seedNotes(): Note[] {
  const now = nowIso();
  return [
    {
      id: generateId(),
      title: "React Hooks Deep Dive",
      content:
        "Understanding useState, useEffect, useCallback, and useMemo for optimal performance...\n\nNotes go here.",
      tags: ["React", "Performance"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: "MongoDB Aggregation Pipeline",
      content:
        "Notes on $match, $group, $project, and other aggregation operators...\n\nExamples go here.",
      tags: ["MongoDB", "Database"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: "System Design Patterns",
      content:
        "Key patterns for building scalable systems: load balancing, caching, sharding...\n\nMore details go here.",
      tags: ["System Design", "Architecture"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedProjects(): Project[] {
  const now = nowIso();
  return [
    {
      id: generateId(),
      title: "AI Knowledge Platform",
      description:
        "Full-stack app for storing personal knowledge with AI-powered insights.",
      status: "In Progress",
      progress: 65,
      technologies: ["React", "Node.js", "MongoDB", "AI"],
      repoUrl: "",
      demoUrl: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: "Portfolio Website v2",
      description: "Modern portfolio with animations and dark theme.",
      status: "In Progress",
      progress: 80,
      technologies: ["React", "Framer Motion", "Tailwind"],
      repoUrl: "",
      demoUrl: "",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedGoals(): GoalProfile {
  const now = nowIso();
  return {
    id: generateId(),
    targetRoles: ["Full Stack Developer", "Backend Developer"],
    interests: ["SaaS", "AI tools", "Developer platforms"],
    createdAt: now,
    updatedAt: now,
  };
}

function seedResume(): ResumeEntry {
  const now = nowIso();
  return {
    id: generateId(),
    fileName: "resume.pdf",
    mimeType: "application/pdf",
    text: "Sample resume text for AI analysis.",
    createdAt: now,
    updatedAt: now,
  };
}

function ensureSeeded<T>(key: string, seed: () => T): T {
  const existing = localStorage.getItem(key);
  if (existing) return readJson<T>(key, seed());
  const initial = seed();
  writeJson(key, initial);
  return initial;
}

export const mockDb = {
  // Notes
  listNotes(): Note[] {
    const notes = ensureSeeded(KEYS.notes, seedNotes);
    return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  createNote(input: Pick<Note, "title" | "content" | "tags">): Note {
    const notes = ensureSeeded(KEYS.notes, seedNotes);
    const now = nowIso();
    const note: Note = {
      id: generateId(),
      title: input.title,
      content: input.content,
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
    };
    const next = [note, ...notes];
    writeJson(KEYS.notes, next);
    return note;
  },

  updateNote(id: string, patch: Partial<Pick<Note, "title" | "content" | "tags">>): Note {
    const notes = ensureSeeded(KEYS.notes, seedNotes);
    const now = nowIso();
    const next = notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: now } : n));
    const updated = next.find((n) => n.id === id);
    if (!updated) throw new Error("Note not found");
    writeJson(KEYS.notes, next);
    return updated;
  },

  deleteNote(id: string): void {
    const notes = ensureSeeded(KEYS.notes, seedNotes);
    writeJson(KEYS.notes, notes.filter((n) => n.id !== id));
  },

  // Projects
  listProjects(): Project[] {
    const projects = ensureSeeded(KEYS.projects, seedProjects);
    return [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
    const projects = ensureSeeded(KEYS.projects, seedProjects);
    const now = nowIso();
    const project: Project = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    const next = [project, ...projects];
    writeJson(KEYS.projects, next);
    return project;
  },

  updateProject(id: string, patch: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Project {
    const projects = ensureSeeded(KEYS.projects, seedProjects);
    const now = nowIso();
    const next = projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p));
    const updated = next.find((p) => p.id === id);
    if (!updated) throw new Error("Project not found");
    writeJson(KEYS.projects, next);
    return updated;
  },

  deleteProject(id: string): void {
    const projects = ensureSeeded(KEYS.projects, seedProjects);
    writeJson(KEYS.projects, projects.filter((p) => p.id !== id));
  },

  // Goals
  getGoals(): GoalProfile {
    return ensureSeeded(KEYS.goals, seedGoals);
  },

  updateGoals(input: Pick<GoalProfile, "targetRoles" | "interests">): GoalProfile {
    const existing = ensureSeeded(KEYS.goals, seedGoals);
    const now = nowIso();
    const next: GoalProfile = {
      ...existing,
      targetRoles: input.targetRoles,
      interests: input.interests,
      updatedAt: now,
    };
    writeJson(KEYS.goals, next);
    return next;
  },

  // Resume
  getResume(): ResumeEntry {
    return ensureSeeded(KEYS.resume, seedResume);
  },

  saveResume(file: File): ResumeEntry {
    const now = nowIso();
    const existing = ensureSeeded(KEYS.resume, seedResume);
    const next: ResumeEntry = {
      ...existing,
      id: existing.id || generateId(),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      text: existing.text,
      updatedAt: now,
    };
    writeJson(KEYS.resume, next);
    return next;
  },

  analyzeResume(_input: unknown): ResumeAnalysis {
    return {
      score: 78,
      summary: "Solid foundation with strong project work.",
      strengths: ["Full-stack exposure", "Modern tooling"],
      gaps: ["Quantified impact", "System design depth"],
      recommendations: ["Add metrics to projects", "Highlight scalability work"],
      careerPaths: ["Backend Engineer", "Full Stack Engineer"],
      nextSteps: ["Refine project bullets", "Prepare for backend interviews"],
      explanation: "Score reflects good breadth but limited measurable outcomes.",
    };
  },

  getAiInsights(_input: unknown): AiInsightsResponse {
    const next: AiInsightsResponse = {
      generatedAt: nowIso(),
      quickStats: [
        { label: "Skills Analyzed", value: 24 },
        { label: "Recommendations", value: 8 },
        { label: "Insights Generated", value: 12 },
        { label: "Goals Tracked", value: 2 },
      ],
      insights: [
        {
          kind: "skill_gap",
          title: "Skill Gap Analysis",
          description: "Focus on system design and cloud fundamentals to level up.",
          action: "View detailed analysis",
          type: "recommendation",
        },
        {
          kind: "career_path",
          title: "Career Path Suggestion",
          description: "Your profile fits Full Stack roles; backend specialization may accelerate growth.",
          action: "Explore career paths",
          type: "insight",
        },
        {
          kind: "learning",
          title: "Learning Recommendation",
          description: "Build one cloud-deployed project with CI/CD and monitoring.",
          action: "Start learning path",
          type: "recommendation",
        },
      ],
      skillGapAnalysis: {
        targetRoles: ["Full Stack Developer"],
        strengths: ["Modern tooling", "Project experience"],
        gaps: [
          {
            skill: "System design",
            priority: "high",
            reason: "Common requirement for senior roles.",
          },
          {
            skill: "Cloud architecture",
            priority: "medium",
            reason: "Helps with deployment, scaling, and reliability.",
          },
        ],
      },
      learningRecommendations: [
        {
          title: "System Design Basics",
          why: "Improves interview performance and real-world architecture decisions.",
          steps: ["Learn key concepts", "Design 3 common systems", "Write tradeoffs"],
          timeframeWeeks: 4,
        },
      ],
      careerPathSuggestions: [
        {
          title: "Backend Engineer",
          why: "Leverage Node.js experience and deepen reliability/scaling skills.",
          nextSteps: ["Add metrics to projects", "Practice API/system design"],
        },
      ],
    };

    writeJson(KEYS.aiInsights, next);
    return next;
  },

  getLatestAiInsights(): AiInsightsResponse | null {
    try {
      const existing = localStorage.getItem(KEYS.aiInsights);
      if (!existing) return null;
      return readJson<AiInsightsResponse | null>(KEYS.aiInsights, null);
    } catch {
      return null;
    }
  },

  // Auth
  register(name: string, email: string, password: string): AuthResponse {
    const users = readJson<StoredUser[]>(KEYS.users, []);
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("Email already in use");

    const user: StoredUser = { id: generateId(), name, email, password };
    writeJson(KEYS.users, [user, ...users]);

    return {
      token: `mock-token-${user.id}`,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  login(email: string, password: string): AuthResponse {
    const users = readJson<StoredUser[]>(KEYS.users, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error("Invalid email or password");

    return {
      token: `mock-token-${user.id}`,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },
};
