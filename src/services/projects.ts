import { env } from "@/lib/env";
import type { Project } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";

export async function listProjects(): Promise<Project[]> {
  if (env.useMockApi) return mockDb.listProjects();
  return requestJson<Project[]>(endpoints.projects.list, { method: "GET" });
}

export async function createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  if (env.useMockApi) return mockDb.createProject(input);
  return requestJson<Project>(endpoints.projects.create, { method: "POST", body: input });
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
): Promise<Project> {
  if (env.useMockApi) return mockDb.updateProject(id, patch);
  return requestJson<Project>(endpoints.projects.update(id), { method: "PUT", body: patch });
}

export async function deleteProject(id: string): Promise<void> {
  if (env.useMockApi) {
    mockDb.deleteProject(id);
    return;
  }
  await requestJson<unknown>(endpoints.projects.delete(id), { method: "DELETE" });
}
