import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AURELIA_NAME, AURELIA_PRINCIPLE, AURELIA_TITLE } from "@/lib/aurelia/personality";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-void text-muted">
        <p className="font-display text-2xl text-gold">Aurelia</p>
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "You",
        });
        if (err) throw new Error(err.message ?? "Could not create an account");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message ?? "Could not sign in");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-void text-cream">
      <img
        src="/aurelia-portrait.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/30 via-void/70 to-void" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end px-5 pb-10 pt-16">
        <div className="rise-in mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">A companion</p>
          <h1 className="mt-2 font-display text-5xl text-cream">{AURELIA_NAME.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-gold-soft">{AURELIA_TITLE}</p>
          <p className="mx-auto mt-4 max-w-sm text-sm italic text-cream-dim">{AURELIA_PRINCIPLE}</p>
        </div>

        <div className="space-y-3 rounded-xl border border-line bg-void-2/90 p-4 backdrop-blur-md">
          {authEnabled ? (
            <>
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] uppercase tracking-wider text-muted">or email</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <form className="space-y-2" onSubmit={onEmail}>
                {mode === "signup" ? (
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="mt-1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                ) : null}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="mt-1"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="mt-1"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
                {error ? <p className="text-xs text-danger">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-center text-xs text-muted hover:text-cream"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError(null);
                }}
              >
                {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
