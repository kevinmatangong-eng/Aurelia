import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import {
  runProactiveCheck,
  saveSettings,
  wipeConversations,
  wipeMemories,
  getSettings,
} from "@/lib/aurelia/api";
import type { ProactiveFrequency, ThemeName, UserSettings } from "@/lib/aurelia/types";
import { PageHeader } from "./app-shell";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { Switch } from "./ui/switch";

export function SettingsView() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const settings = query.data;

  const save = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => saveSettings({ data: patch }),
    onSuccess: async (next) => {
      qc.setQueryData(["settings"], next);
    },
  });

  const patch = (partial: Partial<UserSettings>) => {
    if (!settings) return;
    save.mutate(partial);
  };

  const consider = useMutation({
    mutationFn: () => runProactiveCheck({ data: { force: true, sessionMinutes: 5 } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const wipeM = useMutation({
    mutationFn: () => wipeMemories(),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });
  const wipeC = useMutation({
    mutationFn: () => wipeConversations(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["conversations"] });
      await qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  if (!settings) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader title="Settings" />
        <div className="p-6 text-sm text-muted">Loading your preferences…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" subtitle="You remain in control" />
      <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-5">
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim">Account</h2>
          <div className="rounded-xl border border-line bg-surface px-3 py-3">
            <UserButton />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim">Mind</h2>
          <div className="space-y-4 rounded-xl border border-line bg-surface p-4">
            <Row
              title="Memory"
              hint="She may store what you tell her, organized by category."
            >
              <Switch
                checked={settings.memoryEnabled}
                onCheckedChange={(v) => patch({ memoryEnabled: v })}
              />
            </Row>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Personality intensity</Label>
                <span className="text-xs tabular-nums text-gold">{settings.personalityIntensity}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.personalityIntensity}
                onChange={(e) => patch({ personalityIntensity: Number(e.target.value) })}
                className="w-full accent-gold"
              />
              <p className="mt-1 text-xs text-muted">Reserved at the left. Literary and teasing at the right.</p>
            </div>
            <div>
              <Label>Model</Label>
              <p className="mt-1 text-sm text-cream">{settings.model}</p>
              <p className="mt-1 text-xs text-muted">
                Thinking runs on the server. Keys never live in the app.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim">
            Proactive presence
          </h2>
          <div className="space-y-4 rounded-xl border border-line bg-surface p-4">
            <Row title="Let her reach out" hint="Only when she judges it worthwhile.">
              <Switch
                checked={settings.proactiveEnabled}
                onCheckedChange={(v) => patch({ proactiveEnabled: v })}
              />
            </Row>
            <Row title="Notifications" hint="Browser notifications when a thread begins without you.">
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(v) => patch({ notificationsEnabled: v })}
              />
            </Row>
            <Row title="Notification sound" hint="Reserved for devices that honor it.">
              <Switch
                checked={settings.notificationSound}
                onCheckedChange={(v) => patch({ notificationSound: v })}
              />
            </Row>
            <div>
              <Label htmlFor="freq">How often she may consider it</Label>
              <select
                id="freq"
                className="mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm"
                value={settings.proactiveFrequency}
                onChange={(e) => patch({ proactiveFrequency: e.target.value as ProactiveFrequency })}
              >
                <option value="quiet">Quiet — at most once a day</option>
                <option value="thoughtful">Thoughtful — a few times, if earned</option>
                <option value="present">Present — more willing, still not noisy</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qh-s">Quiet hours start</Label>
                <Input
                  id="qh-s"
                  type="time"
                  className="mt-1"
                  value={settings.quietHoursStart}
                  onChange={(e) => patch({ quietHoursStart: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="qh-e">Quiet hours end</Label>
                <Input
                  id="qh-e"
                  type="time"
                  className="mt-1"
                  value={settings.quietHoursEnd}
                  onChange={(e) => patch({ quietHoursEnd: e.target.value })}
                />
              </div>
            </div>
            <Row
              title="Important during quiet hours"
              hint="Only high-priority reasons (a due reminder you asked her to protect)."
            >
              <Switch
                checked={settings.allowImportantDuringQuiet}
                onCheckedChange={(v) => patch({ allowImportantDuringQuiet: v })}
              />
            </Row>
            <Button
              variant="goldline"
              className="w-full"
              disabled={consider.isPending}
              onClick={() => consider.mutate()}
            >
              {consider.isPending
                ? "She is considering…"
                : consider.data?.contacted
                  ? "She reached out — open Chat"
                  : consider.data
                    ? "She chose silence"
                    : "Invite her attention"}
            </Button>
            <p className="text-xs text-muted">
              She still decides. This only asks whether there is a reason now — it is not a command to speak.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim">Appearance</h2>
          <div className="rounded-xl border border-line bg-surface p-4">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              className="mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm"
              value={settings.theme}
              onChange={(e) => patch({ theme: e.target.value as ThemeName })}
            >
              <option value="void">Void</option>
              <option value="dawn">Dawn</option>
            </select>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-danger">Danger</h2>
          <div className="space-y-2 rounded-xl border border-line bg-surface p-4">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                if (window.confirm("Delete every memory she holds?")) wipeM.mutate();
              }}
            >
              Delete all memories
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                if (window.confirm("Delete every conversation?")) wipeC.mutate();
              }}
            >
              Delete all conversations
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-cream">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      {children}
    </div>
  );
}
