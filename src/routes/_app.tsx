import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProactiveListener } from "@/components/proactive-listener";
import { ThemeSync } from "@/components/theme-sync";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listConversations } from "@/lib/aurelia/api";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-void text-cream">
        <div className="text-center">
          <div className="relative mx-auto mb-4 size-16">
            <span className="halo-ring absolute inset-[-20%] rounded-full border border-gold/40" />
            <img src="/aurelia-avatar.jpg" alt="" className="size-16 rounded-full object-cover" />
          </div>
          <p className="font-display text-2xl text-gold">Aurelia</p>
        </div>
      </main>
    );
  }

  if (!user) return <RedirectToSignIn />;

  const unread = (conversations.data ?? []).some((c) => c.unread);

  return (
    <>
      <ThemeSync />
      <ProactiveListener />
      <AppShell unreadChat={unread}>
        <Outlet />
      </AppShell>
    </>
  );
}
