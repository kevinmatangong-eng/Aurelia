import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-line bg-void-2 px-3 text-sm text-cream placeholder:text-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-line bg-void-2 px-3 py-2.5 text-sm text-cream placeholder:text-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium tracking-wide text-muted", className)}
      {...props}
    />
  );
}
