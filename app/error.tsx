"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="max-w-md rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Calculation hiccup
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink-900">
          The dashboard lost its train of thought
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          Something went wrong while loading the calculator data. Try again, and if it
          persists there may be a temporary issue with the source files.
        </p>
        <Button className="mt-6" onClick={reset}>
          Retry
        </Button>
      </div>
    </div>
  );
}
