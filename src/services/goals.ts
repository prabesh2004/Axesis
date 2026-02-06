import { env } from "@/lib/env";
import type { GoalProfile } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";

export type GoalInput = Pick<GoalProfile, "targetRoles" | "interests">;

export async function getGoals(): Promise<GoalProfile> {
  if (env.useMockApi) return mockDb.getGoals();
  return requestJson<GoalProfile>(endpoints.goals.get, { method: "GET" });
}

export async function updateGoals(input: GoalInput): Promise<GoalProfile> {
  if (env.useMockApi) return mockDb.updateGoals(input);
  return requestJson<GoalProfile>(endpoints.goals.update, { method: "PUT", body: input });
}
