import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink-900 outline-none transition focus:border-accent-500",
        className
      )}
      {...props}
    />
  );
}
