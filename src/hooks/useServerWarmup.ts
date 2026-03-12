import { useEffect, useRef } from "react";
import { env } from "@/lib/env";
import { toast } from "@/components/ui/sonner";

/**
 * Pings the backend /health endpoint on mount and every KEEP_ALIVE_MS milliseconds.
 *
 * Why: Render's free tier spins the server down after ~15 min of inactivity.
 * The first request after a cold start can take 30–90 s, making login appear broken.
 * This hook:
 *  1. Pings /health immediately so the server starts warming up before the user clicks login.
 *  2. Shows a friendly "Server is waking up..." toast if the ping takes > SLOW_THRESHOLD_MS.
 *  3. Keeps pinging every 13 min while the tab is open, preventing future cold starts.
 */

const KEEP_ALIVE_MS = 13 * 60 * 1000; // 13 minutes
const SLOW_THRESHOLD_MS = 3_500; // show toast if server takes this long to respond

export function useServerWarmup() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // Only run against the real backend.
    if (env.useMockApi) return;
    if (!env.apiBaseUrl) return;

    const ping = async () => {
      const url = `${env.apiBaseUrl.replace(/\/$/, "")}/health`;

      const slowTimer = setTimeout(() => {
        toastIdRef.current = toast.loading("Server is waking up, please wait…", {
          description: "Render spins down free-tier servers after inactivity. First load may take ~60 s.",
          duration: 120_000,
        });
      }, SLOW_THRESHOLD_MS);

      try {
        await fetch(url, { method: "GET", signal: AbortSignal.timeout(90_000) });
      } catch {
        // Ignore — server may still be starting.
      } finally {
        clearTimeout(slowTimer);
        if (toastIdRef.current !== null) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
      }
    };

    // Fire once immediately so the server warms up as soon as the app loads.
    void ping();

    // Keep pinging periodically so the server never goes cold while the tab is open.
    intervalRef.current = setInterval(() => void ping(), KEEP_ALIVE_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (toastIdRef.current !== null) toast.dismiss(toastIdRef.current);
    };
  }, []);
}
