import { cn } from "@/lib/utils";

export function AureliaAvatar({
  size = "md",
  halo = true,
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  halo?: boolean;
  className?: string;
}) {
  const dim = {
    sm: "size-8",
    md: "size-10",
    lg: "size-16",
    xl: "size-28",
  }[size];

  return (
    <span className={cn("relative inline-grid place-items-center", dim, className)}>
      {halo ? (
        <span
          aria-hidden
          className="halo-ring pointer-events-none absolute inset-[-22%] rounded-full border border-gold/35"
        />
      ) : null}
      <img
        src="/aurelia-avatar.jpg"
        alt=""
        className="relative size-full rounded-full object-cover ring-1 ring-gold/30"
      />
    </span>
  );
}
