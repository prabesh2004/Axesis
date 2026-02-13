const SESSION_PREFIXES = ["aiInsights.", "axesis.resumeAnalysis."] as const;

export function clearUserSessionCaches(): void {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (SESSION_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
