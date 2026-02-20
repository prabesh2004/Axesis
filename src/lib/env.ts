const isDev = import.meta.env.DEV;

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? (isDev ? "http://localhost:3000" : "");

const useMockDefault = isDev ? "true" : "false";
const useMockApi = ((import.meta.env.VITE_USE_MOCK_API as string | undefined) ?? useMockDefault) === "true";

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";

export const env = {
  apiBaseUrl,
  useMockApi,
  googleClientId,
} as const;
