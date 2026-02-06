import { env } from "@/lib/env";
import type { AiInsightsResponse, GoalProfile, ResumeAnalysis } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";

export type AnalyzeResumeInput = {
  resumeText: string;
  notes?: string;
  projects?: string;
  goals?: Pick<GoalProfile, "targetRoles" | "interests">;
};

export async function analyzeResume(input: AnalyzeResumeInput): Promise<ResumeAnalysis> {
  if (env.useMockApi) return mockDb.analyzeResume(input);
  return requestJson<ResumeAnalysis>(endpoints.ai.analyzeResume, { method: "POST", body: input });
}

export type AiInsightsInput = {
  resumeText: string;
  notes?: string;
  projects?: string;
  goals?: Pick<GoalProfile, "targetRoles" | "interests">;
};

export async function getAiInsights(input: AiInsightsInput): Promise<AiInsightsResponse> {
  if (env.useMockApi) return mockDb.getAiInsights(input);
  return requestJson<AiInsightsResponse>(endpoints.ai.insights, { method: "POST", body: input });
}

export async function getLatestAiInsights(): Promise<AiInsightsResponse | null> {
  if (env.useMockApi) return mockDb.getLatestAiInsights();
  try {
    return await requestJson<AiInsightsResponse>(endpoints.ai.insightsLatest, { method: "GET" });
  } catch {
    return null;
  }
}
