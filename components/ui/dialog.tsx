"use client";

import * as React from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  side?: "center" | "right";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "center"
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-ink-900/40 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative max-h-full overflow-auto rounded-[28px] bg-white shadow-card",
          side === "center" &&
            "m-auto w-full max-w-3xl",
          side === "right" &&
            "ml-auto h-full w-full max-w-xl"
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/5 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-ink-500 transition hover:bg-sand-50 hover:text-ink-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
