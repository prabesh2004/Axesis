import { env } from "@/lib/env";

const TOKEN_KEY = "axesis.auth.token";

function normalizeTokenForMode(token: string | null): string | null {
  if (!token) return null;

  // If we switched from mock mode -> real backend mode,
  // an old mock token would cause 401s forever.
  if (!env.useMockApi && token.startsWith("mock-token-")) {
    return null;
  }

  return token;
}

export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const normalized = normalizeTokenForMode(token);
    if (token && !normalized) {
      // best-effort cleanup
      localStorage.removeItem(TOKEN_KEY);
    }
    return normalized;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

