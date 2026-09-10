import { createFileRoute } from "@tanstack/react-router";
import { RemindersView } from "@/components/reminders-view";

export const Route = createFileRoute("/_app/reminders")({
  component: RemindersPage,
});

function RemindersPage() {
  return <RemindersView />;
}
