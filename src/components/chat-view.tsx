import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay, parseISO } from "date-fns";
import {
  Check,
  Copy,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  clearConversation,
  getMessages,
  listConversations,
  regenerateResponse,
  removeConversation,
  sendMessage,
  startConversation,
} from "@/lib/aurelia/api";
import type { ChatMessage, Conversation } from "@/lib/aurelia/types";
import { cn } from "@/lib/utils";
import { AureliaAvatar } from "./aurelia-avatar";
import { Button } from "./ui/button";

function formatStamp(iso: string): string {
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return "";
  }
}

export function ChatView({ conversationId }: { conversationId?: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
  });

  const activeId = conversationId ?? conversations.data?.[0]?.id;
  const active = conversations.data?.find((c) => c.id === activeId);

  const messages = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => getMessages({ data: { conversationId: activeId! } }),
    enabled: Boolean(activeId),
  });

  const send = useMutation({
    mutationFn: (content: string) =>
      sendMessage({ data: { conversationId: activeId, content } }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["conversations"] });
      await qc.invalidateQueries({ queryKey: ["messages", res.conversationId] });
      await qc.invalidateQueries({ queryKey: ["memories"] });
      await qc.invalidateQueries({ queryKey: ["goals"] });
      await qc.invalidateQueries({ queryKey: ["reminders"] });
      if (res.conversationId !== conversationId) {
        await navigate({ to: "/", search: { c: res.conversationId } });
      }
    },
  });

  const regen = useMutation({
    mutationFn: () => regenerateResponse({ data: { conversationId: activeId! } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["messages", activeId] });
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.data, send.isPending]);

  const visible = useMemo(
    () => (messages.data ?? []).filter((m) => m.content.trim().length > 0),
    [messages.data],
  );

  const lastAssistantId = [...visible].reverse().find((m) => m.role === "assistant")?.id;
  const busy = send.isPending || regen.isPending;

  async function onSend() {
    const content = draft.trim();
    if (!content || busy) return;
    setDraft("");
    send.mutate(content);
  }

  async function onNew() {
    const res = await startConversation({ data: { withWelcome: false } });
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    setDrawer(false);
    await navigate({ to: "/", search: { c: res.conversation.id } });
  }

  async function onClear() {
    if (!activeId) return;
    setMenu(false);
    await clearConversation({ data: { conversationId: activeId } });
    await qc.invalidateQueries({ queryKey: ["messages", activeId] });
    await qc.invalidateQueries({ queryKey: ["conversations"] });
  }

  async function onDelete() {
    if (!activeId) return;
    setMenu(false);
    await removeConversation({ data: { conversationId: activeId } });
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    const rest = (conversations.data ?? []).filter((c) => c.id !== activeId);
        await navigate({ to: "/", search: rest[0] ? { c: rest[0].id } : { c: undefined } });
  }

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1200);
  }

  const empty = !activeId && !conversations.isLoading && (conversations.data?.length ?? 0) === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <AureliaAvatar size="md" />
          <span className="min-w-0">
            <span className="block font-display text-xl leading-tight text-cream">Aurelia</span>
            <span className="block truncate text-xs text-muted">
              {active?.title && active.title !== "Conversation" ? active.title : "Beauty, Reason, and the Absurd"}
            </span>
          </span>
        </button>
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Conversation actions" onClick={() => setMenu((v) => !v)}>
            <MoreHorizontal className="size-5 text-muted" />
          </Button>
          {menu ? (
            <div className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-halo">
              <MenuItem
                icon={<Plus className="size-4" />}
                label="New conversation"
                onClick={() => {
                  setMenu(false);
                  void onNew();
                }}
              />
              <MenuItem
                icon={<Trash2 className="size-4" />}
                label="Clear messages"
                onClick={() => void onClear()}
              />
              <MenuItem
                icon={<Trash2 className="size-4" />}
                label="Delete conversation"
                danger
                onClick={() => void onDelete()}
              />
            </div>
          ) : null}
        </div>
      </header>

      <div ref={scroller} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {empty ? (
          <EmptyState
            onBegin={async () => {
              const res = await startConversation({ data: { withWelcome: true } });
              await qc.invalidateQueries({ queryKey: ["conversations"] });
              await qc.invalidateQueries({ queryKey: ["messages", res.conversation.id] });
              await navigate({ to: "/", search: { c: res.conversation.id } });
            }}
          />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {visible.map((m, i) => (
              <div key={m.id}>
                {shouldShowDay(visible[i - 1], m) ? (
                  <p className="mb-3 text-center text-[11px] tracking-wide text-muted">
                    {formatDay(m.createdAt)}
                  </p>
                ) : null}
                <Bubble
                  message={m}
                  isLastAssistant={m.id === lastAssistantId}
                  copied={copied === m.id}
                  busy={busy}
                  onCopy={() => void copyText(m.id, m.content)}
                  onRegen={() => regen.mutate()}
                />
              </div>
            ))}
            {busy ? <TypingRow /> : null}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        className="border-t border-line bg-void px-3 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          void onSend();
        }}
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-line bg-surface px-2 py-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            rows={1}
            placeholder={empty ? "Begin when you are ready" : "Speak."}
            className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-cream placeholder:text-muted focus:outline-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="shrink-0 rounded-lg"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>

      {drawer ? (
        <ConversationDrawer
          items={conversations.data ?? []}
          activeId={activeId}
          onClose={() => setDrawer(false)}
          onNew={() => void onNew()}
          onSelect={(id) => {
            setDrawer(false);
            void navigate({ to: "/", search: { c: id } });
          }}
        />
      ) : null}
    </div>
  );
}

function EmptyState({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <span className="halo-ring absolute inset-[-18%] rounded-full border border-gold/30" />
        <img
          src="/aurelia-portrait.jpg"
          alt="Aurelia Seraphine"
          className="relative h-48 w-32 rounded-xl object-cover ring-1 ring-gold/25"
        />
      </div>
      <h2 className="font-display text-3xl text-cream">Aurelia</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">
        The Goddess of Beauty, Reason, and the Absurd. She will not speak first unless she has a reason.
      </p>
      <Button className="mt-6" onClick={onBegin}>
        Begin
      </Button>
    </div>
  );
}

function Bubble({
  message,
  isLastAssistant,
  copied,
  busy,
  onCopy,
  onRegen,
}: {
  message: ChatMessage;
  isLastAssistant: boolean;
  copied: boolean;
  busy: boolean;
  onCopy: () => void;
  onRegen: () => void;
}) {
  const mine = message.role === "user";
  return (
    <article className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine ? <AureliaAvatar size="sm" halo={false} className="mt-1 shrink-0" /> : null}
      <div className={cn("max-w-[82%] sm:max-w-[74%]", mine && "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-sm",
            mine
              ? "rounded-br-sm bg-gold/15 text-cream"
              : "rounded-bl-sm bg-surface text-cream ring-1 ring-line",
          )}
        >
          <p className="msg-prose">{message.content}</p>
        </div>
        <div className={cn("mt-1 flex items-center gap-2 px-1", mine && "justify-end")}>
          <time className="text-[10px] text-muted">{formatStamp(message.createdAt)}</time>
          <button
            type="button"
            onClick={onCopy}
            className="text-muted hover:text-gold"
            aria-label="Copy message"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
          {!mine && isLastAssistant ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRegen}
              className="text-muted hover:text-gold disabled:opacity-40"
              aria-label="Regenerate response"
            >
              <RefreshCw className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function TypingRow() {
  return (
    <div className="flex items-center gap-2">
      <AureliaAvatar size="sm" halo={false} />
      <div className="flex items-center gap-1 rounded-xl rounded-bl-sm bg-surface px-3 py-3 ring-1 ring-line">
        <span className="typing-dot size-1.5 rounded-full bg-gold" />
        <span className="typing-dot size-1.5 rounded-full bg-gold" />
        <span className="typing-dot size-1.5 rounded-full bg-gold" />
      </div>
    </div>
  );
}

function ConversationDrawer({
  items,
  activeId,
  onClose,
  onNew,
  onSelect,
}: {
  items: Conversation[];
  activeId?: string;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="absolute inset-0 bg-void/70" aria-label="Close" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-[min(100%,20rem)] flex-col border-r border-line bg-void-2">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-display text-xl">Threads</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-cream">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-3 pb-2">
          <Button variant="goldline" className="w-full" onClick={onNew}>
            <Plus className="size-4" /> New conversation
          </Button>
        </div>
        <ul className="no-scrollbar flex-1 overflow-y-auto px-2 pb-6">
          {items.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted">No conversations yet.</li>
          ) : (
            items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "mb-1 w-full rounded-lg px-3 py-2.5 text-left",
                    c.id === activeId ? "bg-surface" : "hover:bg-surface/60",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {c.unread ? <span className="size-1.5 shrink-0 rounded-full bg-gold" /> : null}
                    <span className="truncate text-sm text-cream">{c.title}</span>
                  </span>
                  {c.lastMessage ? (
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted">{c.lastMessage}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm",
        danger ? "text-danger hover:bg-danger/10" : "text-cream hover:bg-surface-2",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function shouldShowDay(prev: ChatMessage | undefined, cur: ChatMessage): boolean {
  if (!prev) return true;
  try {
    return !isSameDay(parseISO(prev.createdAt), parseISO(cur.createdAt));
  } catch {
    return false;
  }
}

function formatDay(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isSameDay(d, new Date())) return "Today";
    return format(d, "MMMM d");
  } catch {
    return "";
  }
}
