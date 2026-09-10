import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/chat-view";

export const Route = createFileRoute("/_app/")({
  validateSearch: (search: Record<string, unknown>): { c?: string } => ({
    c: typeof search.c === "string" ? search.c : undefined,
  }),
  component: ChatPage,
});

function ChatPage() {
  const { c } = Route.useSearch();
  return <ChatView conversationId={c} />;
}
