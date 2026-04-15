import * as React from "react";

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "observed" | "estimated" | "assumption" | "neutral";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "observed" && "bg-accent-50 text-accent-700 ring-1 ring-accent-200/70",
        tone === "estimated" && "bg-gold-100 text-gold-500 ring-1 ring-gold-300/60",
        tone === "assumption" && "bg-ink-900 text-white ring-2 ring-ink-700 shadow-soft",
        tone === "neutral" && "bg-sand-100 text-ink-700 ring-1 ring-black/5",
        className
      )}
      {...props}
    />
  );
}
