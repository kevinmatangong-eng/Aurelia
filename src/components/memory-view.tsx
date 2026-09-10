import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { listMemories, removeMemory, saveMemory } from "@/lib/aurelia/api";
import { MEMORY_CATEGORIES, type Memory, type MemoryCategory } from "@/lib/aurelia/types";
import { PageHeader } from "./app-shell";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";

const LABELS: Record<MemoryCategory, string> = {
  interest: "Interests",
  goal: "Aspirations",
  preference: "Preferences",
  fact: "Facts",
  project: "Projects",
  book: "Books",
  subject: "Subjects",
  person: "People",
  date: "Dates",
  habit: "Habits",
  other: "Other",
};

export function MemoryView() {
  const qc = useQueryClient();
  const memories = useQuery({ queryKey: ["memories"], queryFn: () => listMemories() });
  const [editing, setEditing] = useState<Partial<Memory> | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<MemoryCategory, Memory[]>();
    for (const m of memories.data ?? []) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return map;
  }, [memories.data]);

  const save = useMutation({
    mutationFn: (input: { id?: string; category: MemoryCategory; key: string; value: string }) =>
      saveMemory({ data: input }),
    onSuccess: async () => {
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeMemory({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Memory"
        subtitle="Organized, not dumped into every thought"
        trailing={
          <Button size="icon" variant="ghost" aria-label="Add memory" onClick={() => setEditing({ category: "fact", key: "", value: "" })}>
            <Plus className="size-5" />
          </Button>
        }
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {(memories.data?.length ?? 0) === 0 && !editing ? (
          <p className="mx-auto max-w-sm pt-10 text-center text-sm text-muted">
            She will keep what matters — interests, books, subjects, the people you mention — here. You can also write it yourself.
          </p>
        ) : null}

        {MEMORY_CATEGORIES.filter((c) => grouped.has(c)).map((cat) => (
          <section key={cat} className="mb-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gold-dim">{LABELS[cat]}</h2>
            <ul className="space-y-2">
              {grouped.get(cat)!.map((m) => (
                <li key={m.id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gold-soft">{m.key}</p>
                      <p className="mt-1 text-sm text-cream-dim">{m.value}</p>
                    </div>
                    <button
                      type="button"
                      className="text-muted hover:text-cream"
                      aria-label="Edit"
                      onClick={() => setEditing(m)}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="text-muted hover:text-danger"
                      aria-label="Delete"
                      onClick={() => remove.mutate(m.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {editing ? (
        <Editor
          draft={editing}
          saving={save.isPending}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            if (!d.key?.trim() || !d.value?.trim()) return;
            save.mutate({
              id: d.id,
              category: (d.category as MemoryCategory) || "other",
              key: d.key.trim(),
              value: d.value.trim(),
            });
          }}
          onChange={setEditing}
        />
      ) : null}
    </div>
  );
}

function Editor({
  draft,
  saving,
  onClose,
  onSave,
  onChange,
}: {
  draft: Partial<Memory>;
  saving: boolean;
  onClose: () => void;
  onSave: (d: Partial<Memory>) => void;
  onChange: (d: Partial<Memory>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-void/70 sm:place-items-center">
      <form
        className="w-full max-w-md rounded-t-xl border border-line bg-surface p-4 sm:rounded-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl">{draft.id ? "Edit memory" : "New memory"}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5 text-muted" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="mem-cat">Category</Label>
            <select
              id="mem-cat"
              value={draft.category ?? "fact"}
              onChange={(e) => onChange({ ...draft, category: e.target.value as MemoryCategory })}
              className="mt-1 h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm text-cream"
            >
              {MEMORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="mem-key">Key</Label>
            <Input
              id="mem-key"
              className="mt-1"
              value={draft.key ?? ""}
              onChange={(e) => onChange({ ...draft, key: e.target.value })}
              placeholder="philosophy"
            />
          </div>
          <div>
            <Label htmlFor="mem-val">Value</Label>
            <Textarea
              id="mem-val"
              className="mt-1 min-h-24"
              value={draft.value ?? ""}
              onChange={(e) => onChange({ ...draft, value: e.target.value })}
              placeholder="Interested in Camus, absurdism, Nietzsche"
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
