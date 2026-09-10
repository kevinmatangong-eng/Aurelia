import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { listReminders, removeReminder, saveReminder, toggleReminder } from "@/lib/aurelia/api";
import { cn } from "@/lib/utils";
import { PageHeader } from "./app-shell";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";

export function RemindersView() {
  const qc = useQueryClient();
  const reminders = useQuery({ queryKey: ["reminders"], queryFn: () => listReminders() });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");

  const save = useMutation({
    mutationFn: () =>
      saveReminder({
        data: {
          title: title.trim(),
          notes,
          dueAt: due ? new Date(due).toISOString() : null,
        },
      }),
    onSuccess: async () => {
      setOpen(false);
      setTitle("");
      setNotes("");
      setDue("");
      await qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  const toggle = useMutation({
    mutationFn: (input: { id: string; completed: boolean }) => toggleReminder({ data: input }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeReminder({ data: { id } }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Reminders"
        subtitle="Things that should not slip"
        trailing={
          <Button size="icon" variant="ghost" aria-label="Add reminder" onClick={() => setOpen(true)}>
            <Plus className="size-5" />
          </Button>
        }
      />
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {(reminders.data?.length ?? 0) === 0 && !open ? (
          <p className="mx-auto max-w-sm pt-10 text-center text-sm text-muted">
            Camus tonight. Derivatives before bed. A letter you meant to send. She can hold the time.
          </p>
        ) : null}
        {(reminders.data ?? []).map((r) => (
          <article
            key={r.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-line bg-surface p-3",
              r.completed && "opacity-50",
            )}
          >
            <input
              type="checkbox"
              checked={r.completed}
              onChange={(e) => toggle.mutate({ id: r.id, completed: e.target.checked })}
              className="mt-1 size-5 accent-gold"
              aria-label={r.completed ? "Mark incomplete" : "Mark complete"}
            />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm text-cream", r.completed && "line-through")}>{r.title}</p>
              {r.notes ? <p className="mt-0.5 text-sm text-muted">{r.notes}</p> : null}
              {r.dueAt ? (
                <p className="mt-1 text-[11px] text-gold-dim">{new Date(r.dueAt).toLocaleString()}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-muted hover:text-danger"
              aria-label="Delete reminder"
              onClick={() => remove.mutate(r.id)}
            >
              <Trash2 className="size-4" />
            </button>
          </article>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center">
          <form
            className="w-full max-w-md space-y-3 rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              save.mutate();
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">New reminder</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-5 text-muted" />
              </button>
            </div>
            <div>
              <Label htmlFor="rem-title">Title</Label>
              <Input id="rem-title" className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rem-notes">Notes</Label>
              <Textarea id="rem-notes" className="mt-1 min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rem-due">Due</Label>
              <Input
                id="rem-due"
                type="datetime-local"
                className="mt-1"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
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
