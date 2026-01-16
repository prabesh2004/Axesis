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
