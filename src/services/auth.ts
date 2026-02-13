import { env } from "@/lib/env";
import type { AuthResponse } from "@/types/models";
import { endpoints } from "@/services/endpoints";
import { requestJson } from "@/services/http";
import { mockDb } from "@/services/mockDb";

export async function register(input: { name: string; email: string; password: string }): Promise<AuthResponse> {
  if (env.useMockApi) {
    return mockDb.register(input.name, input.email, input.password);
  }

  return requestJson<AuthResponse>(endpoints.auth.register, {
    method: "POST",
    body: input,
  });
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  if (env.useMockApi) {
    return mockDb.login(input.email, input.password);
  }

  return requestJson<AuthResponse>(endpoints.auth.login, {
    method: "POST",
    body: input,
  });
}

export async function googleLogin(input: { credential: string }): Promise<AuthResponse> {
  if (env.useMockApi) {
    // Minimal mock behavior: treat it as a login.
    return mockDb.login("mock@example.com", "password");
  }

  return requestJson<AuthResponse>(endpoints.auth.google, {
    method: "POST",
    body: input,
  });
}
