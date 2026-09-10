import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-void hover:opacity-90",
        ghost:
          "bg-transparent text-cream hover:bg-surface-2",
        outline:
          "border border-line bg-transparent text-cream hover:border-gold/50 hover:text-gold-soft",
        danger:
          "bg-danger/15 text-danger hover:bg-danger/25",
        goldline:
          "border border-gold/40 text-gold hover:bg-gold/10",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-11 px-4 text-sm rounded-lg",
        lg: "h-12 px-5 text-base rounded-lg",
        icon: "size-11 rounded-lg",
        pill: "h-10 px-4 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
