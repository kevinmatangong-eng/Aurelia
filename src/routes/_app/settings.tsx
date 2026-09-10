import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/settings-view";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return <SettingsView />;
}
