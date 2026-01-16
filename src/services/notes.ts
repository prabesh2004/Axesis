import { env } from "@/lib/env";
import type { Note } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";

export async function listNotes(): Promise<Note[]> {
  if (env.useMockApi) return mockDb.listNotes();
  return requestJson<Note[]>(endpoints.notes.list, { method: "GET" });
}

export async function createNote(input: Pick<Note, "title" | "content" | "tags">): Promise<Note> {
  if (env.useMockApi) return mockDb.createNote(input);
  return requestJson<Note>(endpoints.notes.create, { method: "POST", body: input });
}

export async function updateNote(id: string, patch: Partial<Pick<Note, "title" | "content" | "tags">>): Promise<Note> {
  if (env.useMockApi) return mockDb.updateNote(id, patch);
  return requestJson<Note>(endpoints.notes.update(id), { method: "PUT", body: patch });
}

export async function deleteNote(id: string): Promise<void> {
  if (env.useMockApi) {
    mockDb.deleteNote(id);
    return;
  }
  await requestJson<unknown>(endpoints.notes.delete(id), { method: "DELETE" });
}
