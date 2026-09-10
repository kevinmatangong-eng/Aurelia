import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { listGoals, markGoalProgress, removeGoal, saveGoal } from "@/lib/aurelia/api";
import type { Goal, GoalCadence, GoalStatus } from "@/lib/aurelia/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "./app-shell";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";

export function GoalsView() {
  const qc = useQueryClient();
  const goals = useQuery({ queryKey: ["goals"], queryFn: () => listGoals() });
  const [editing, setEditing] = useState<Partial<Goal> | null>(null);

  const save = useMutation({
    mutationFn: (input: {
      id?: string;
      title: string;
      description?: string;
      status?: GoalStatus;
      cadence?: GoalCadence;
    }) => saveGoal({ data: input }),
    onSuccess: async () => {
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const progress = useMutation({
    mutationFn: (id: string) => markGoalProgress({ data: { id } }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeGoal({ data: { id } }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Goals"
        subtitle="What you asked her to hold you to"
        trailing={
          <Button
            size="icon"
            variant="ghost"
            aria-label="Add goal"
            onClick={() => setEditing({ title: "", description: "", status: "active", cadence: "daily" })}
          >
            <Plus className="size-5" />
          </Button>
        }
      />
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {(goals.data?.length ?? 0) === 0 && !editing ? (
          <p className="mx-auto max-w-sm pt-10 text-center text-sm text-muted">
            Tell her you want to learn physics, sleep earlier, or finish a book. She will remember — and sometimes she will ask.
          </p>
        ) : null}
        {(goals.data ?? []).map((g) => (
          <article key={g.id} className="rounded-xl border border-line bg-surface p-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => progress.mutate(g.id)}
                className="mt-0.5 grid size-10 place-items-center rounded-lg border border-gold/30 text-gold hover:bg-gold/10"
                aria-label="Note progress"
              >
                <Check className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <button type="button" className="text-left" onClick={() => setEditing(g)}>
                  <p className="text-sm font-medium text-cream">{g.title}</p>
                  {g.description ? <p className="mt-0.5 text-sm text-muted">{g.description}</p> : null}
                </button>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip>{g.status}</Chip>
                  {g.cadence !== "none" ? <Chip>{g.cadence}</Chip> : null}
                  {g.lastProgressAt ? <Chip>progress noted</Chip> : null}
                </div>
              </div>
              <button
                type="button"
                className="text-muted hover:text-danger"
                aria-label="Delete goal"
                onClick={() => remove.mutate(g.id)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center">
          <form
            className="w-full max-w-md space-y-3 rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing.title?.trim()) return;
              save.mutate({
                id: editing.id,
                title: editing.title.trim(),
                description: editing.description ?? "",
                status: editing.status ?? "active",
                cadence: editing.cadence ?? "none",
              });
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">{editing.id ? "Edit goal" : "New goal"}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X className="size-5 text-muted" />
              </button>
            </div>
            <div>
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                className="mt-1"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Study calculus for 15 minutes"
              />
            </div>
            <div>
              <Label htmlFor="goal-desc">Notes</Label>
              <Textarea
                id="goal-desc"
                className="mt-1 min-h-20"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Status</Label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm"
                  value={editing.status ?? "active"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as GoalStatus })}
                >
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="done">done</option>
                </select>
              </div>
              <div>
                <Label>Cadence</Label>
                <select
                  className="mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm"
                  value={editing.cadence ?? "none"}
                  onChange={(e) => setEditing({ ...editing, cadence: e.target.value as GoalCadence })}
                >
                  <option value="none">none</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              Save
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className={cn("rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted")}>
      {children}
    </span>
  );
}
