"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface DisclosureProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Disclosure({
  title,
  description,
  defaultOpen = false,
  children,
  className
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-[28px] border border-black/5 bg-white", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <p className="font-medium text-ink-900">{title}</p>
          {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? <div className="border-t border-black/5 px-5 py-4">{children}</div> : null}
    </div>
  );
}
