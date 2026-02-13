import { getAuthToken } from "@/services/authToken";

type JwtPayload = {
  sub?: unknown;
  [key: string]: unknown;
};

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

export function getJwtPayload(token: string | null = getAuthToken()): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json) as unknown;
    if (!payload || typeof payload !== "object") return null;
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const payload = getJwtPayload();
  const sub = payload?.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
}
