import { env } from "@/lib/env";
import type { ResumeEntry } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";
import { getAuthToken } from "@/services/authToken";

export async function getLatestResume(): Promise<ResumeEntry> {
  if (env.useMockApi) return mockDb.getResume();
  return requestJson<ResumeEntry>(endpoints.resume.latest, { method: "GET" });
}

export async function uploadResume(file: File): Promise<ResumeEntry> {
  if (env.useMockApi) return mockDb.saveResume(file);

  if (!env.apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }

  const url = `${env.apiBaseUrl.replace(/\/$/, "")}${endpoints.resume.upload}`;
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: form,
    headers: {
      Accept: "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && data.message) || `Upload failed (${response.status})`;
    throw new Error(message);
  }

  return data as ResumeEntry;
}
