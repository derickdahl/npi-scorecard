"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)]",
        primary: "bg-[var(--sonance-blue)]/10 text-[var(--sonance-blue)] border border-[var(--sonance-blue)]/30",
        success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
        warning: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
        error: "bg-red-500/10 text-red-600 border border-red-500/30",
        outline: "border border-[var(--border)] text-[var(--foreground)] bg-transparent",
        slack: "bg-[#4A154B]/10 text-[#4A154B] border border-[#4A154B]/30",
        teams: "bg-[#6264A7]/10 text-[#6264A7] border border-[#6264A7]/30",
        email: "bg-[var(--sonance-blue)]/10 text-[var(--sonance-blue)] border border-[var(--sonance-blue)]/30",
        imessage: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px] rounded-md",
        sm: "px-2 py-0.5 text-xs rounded-lg",
        md: "px-2.5 py-1 text-xs rounded-lg",
        lg: "px-3 py-1 text-sm rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
