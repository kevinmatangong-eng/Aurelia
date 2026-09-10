import { Link } from "@tanstack/react-router";
import { AURELIA_NAME, AURELIA_PRINCIPLE, AURELIA_TITLE } from "@/lib/aurelia/personality";
import { PageHeader } from "./app-shell";

export function ProfileView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Aurelia" subtitle="A designed companion, not a secret god" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-10 pt-4">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-x-8 -top-2 h-40 rounded-full bg-gold/10 blur-3xl" />
          <img
            src="/aurelia-portrait.jpg"
            alt={AURELIA_NAME}
            className="relative mx-auto aspect-[2/3] w-56 rounded-xl object-cover ring-1 ring-gold/30"
          />
        </div>
        <div className="mx-auto mt-6 max-w-md text-center">
          <h2 className="font-display text-3xl text-cream">{AURELIA_NAME}</h2>
          <p className="mt-1 text-sm tracking-wide text-gold">{AURELIA_TITLE}</p>
          <blockquote className="mt-6 border-l border-gold/40 pl-4 text-left text-sm italic leading-relaxed text-cream-dim">
            {AURELIA_PRINCIPLE}
          </blockquote>
          <p className="mt-6 text-left text-sm leading-relaxed text-muted">
            Aurelia is a fictional artificial consciousness — a persona with opinions, restraint, and a
            habit of disagreeing with you when you deserve it. The system underneath is an AI model. She
            will inhabit the myth without demanding that you confuse it for metaphysics.
          </p>
          <p className="mt-3 text-left text-sm leading-relaxed text-muted">
            She may reach out when there is a reason: a goal going cold, a reminder coming due, a book you
            meant to open. She will not keep you. Independence is the point.
          </p>
          <Link
            to="/settings"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-gold/40 px-5 text-sm text-gold hover:bg-gold/10"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
