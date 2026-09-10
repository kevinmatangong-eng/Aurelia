import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getSettings, pingActivity, runProactiveCheck } from "@/lib/aurelia/api";

const SESSION_KEY = "aurelia.sessionStart";

function sessionMinutes(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const start = raw ? Number(raw) : Date.now();
    if (!raw) sessionStorage.setItem(SESSION_KEY, String(start));
    return Math.max(0, Math.round((Date.now() - start) / 60_000));
  } catch {
    return 0;
  }
}

export function ProactiveListener() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const lastEval = useRef(0);
  const hiddenAt = useRef<number | null>(null);

  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
    staleTime: 20_000,
  });

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, String(Date.now()));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    void pingActivity({ data: { timezone: tz } }).then(() => {
      void qc.invalidateQueries({ queryKey: ["settings"] });
    });
    const ping = window.setInterval(() => {
      void pingActivity({ data: { timezone: tz } });
    }, 120_000);
    return () => window.clearInterval(ping);
  }, [qc]);

  useEffect(() => {
    if (!settings.data?.notificationsEnabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [settings.data?.notificationsEnabled]);

  useEffect(() => {
    if (!settings.data?.proactiveEnabled) return;

    const maybeEvaluate = async (forceGapMs: number) => {
      const now = Date.now();
      if (now - lastEval.current < forceGapMs) return;
      lastEval.current = now;
      try {
        const result = await runProactiveCheck({
          data: { sessionMinutes: sessionMinutes() },
        });
        if (!result.contacted || !result.event) return;
        await qc.invalidateQueries({ queryKey: ["conversations"] });
        const title = result.event.notificationTitle || "Aurelia";
        const body = result.event.message;
        if (
          settings.data?.notificationsEnabled &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          document.visibilityState !== "visible"
        ) {
          const n = new Notification(title, {
            body,
            icon: "/aurelia-avatar.jpg",
            tag: "aurelia-proactive",
          });
          n.onclick = () => {
            window.focus();
            if (result.conversationId) {
              void navigate({ to: "/", search: { c: result.conversationId } });
            }
            n.close();
          };
        }
        if (result.conversationId && document.visibilityState === "visible") {
          /* stay put; unread badge on Chat will appear */
        }
      } catch {
        /* stay silent */
      }
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }
      const away = hiddenAt.current ? Date.now() - hiddenAt.current : 0;
      hiddenAt.current = null;
      if (away > 10 * 60_000) void maybeEvaluate(8 * 60_000);
    };

    document.addEventListener("visibilitychange", onVis);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void maybeEvaluate(12 * 60_000);
    }, 12 * 60_000);

    const boot = window.setTimeout(() => {
      void maybeEvaluate(20 * 60_000);
    }, 25_000);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(interval);
      window.clearTimeout(boot);
    };
  }, [navigate, qc, settings.data?.proactiveEnabled, settings.data?.notificationsEnabled]);

  return null;
}
