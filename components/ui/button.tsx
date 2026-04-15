import * as React from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost";
}

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "bg-ink-900 text-white shadow-soft hover:bg-ink-700",
        variant === "secondary" &&
          "bg-white text-ink-900 ring-1 ring-black/10 hover:bg-sand-50",
        variant === "ghost" && "text-ink-700 hover:bg-white/70",
        className
      )}
      {...props}
    />
  );
}
