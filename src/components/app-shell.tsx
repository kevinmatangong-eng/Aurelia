import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock, MessageCircle, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Chat", icon: MessageCircle },
  { to: "/memory", label: "Memory", icon: Sparkles },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/reminders", label: "Reminders", icon: Clock },
  { to: "/profile", label: "Aurelia", icon: BookOpen },
] as const;

export function AppShell({
  children,
  unreadChat = false,
}: {
  children: ReactNode;
  unreadChat?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-void text-cream">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <nav
        className="sticky bottom-0 z-30 border-t border-line bg-void/95 backdrop-blur-md"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <ul className="grid grid-cols-5 px-1 pt-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide",
                    active ? "text-gold" : "text-muted hover:text-cream-dim",
                  )}
                >
                  <span className="relative">
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                    {item.to === "/" && unreadChat ? (
                      <span className="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-gold" />
                    ) : null}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-medium leading-tight text-cream">{title}</h1>
        {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
      </div>
      {trailing}
    </header>
  );
}
