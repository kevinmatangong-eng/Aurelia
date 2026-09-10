import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSettings } from "@/lib/aurelia/api";

export function ThemeSync() {
  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
    staleTime: 30_000,
  });

  useEffect(() => {
    const theme = settings.data?.theme === "dawn" ? "dawn" : "void";
    document.documentElement.dataset.theme = theme;
  }, [settings.data?.theme]);

  return null;
}
