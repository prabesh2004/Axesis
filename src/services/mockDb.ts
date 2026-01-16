import type { AuthResponse, AuthUser, Note, Project } from "@/types/models";
import { generateId, readJson, writeJson } from "@/services/storage";

const KEYS = {
  notes: "axesis.notes.v1",
  projects: "axesis.projects.v1",
  users: "axesis.users.v1",
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
