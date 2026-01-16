import { env } from "@/lib/env";
import { getAuthToken } from "@/services/authToken";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessageFromData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const maybe = (data as { message?: unknown }).message;
  return typeof maybe === "string" ? maybe : null;
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!env.apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not set");
  }

  const url = joinUrl(env.apiBaseUrl, path);
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = options.token === undefined ? getAuthToken() : options.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await safeJson(response);

  if (!response.ok) {
    const message = errorMessageFromData(data) ?? `Request failed (${response.status})`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
