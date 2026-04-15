"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRESETS } from "@/config/presets";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { encodeFilters } from "@/lib/filter-query";
import { useLiveCalculatorLocation } from "@/lib/use-live-calculator-location";

export function FeaturedPresets() {
  const router = useRouter();
  const { query } = useLiveCalculatorLocation();
  const selectedSex = useMemo(() => {
    const value = new URLSearchParams(query).get("sex");
    return value === "men" || value === "women" ? value : "all";
  }, [query]);
  const presetsLocked = selectedSex === "all";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PRESETS.map((preset) => (
        <Card key={preset.id} className="h-full border-black/5 bg-white/95">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              Preset profile
            </p>
            <CardTitle>{preset.label}</CardTitle>
            <CardDescription>{preset.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 pt-0">
            <button
              type="button"
              disabled={presetsLocked}
              onClick={() => {
                const nextQuery = encodeFilters({
                  ...DEFAULT_FILTERS,
                  ...preset.build(),
                  sex: selectedSex,
                  manualAssumptions: []
                });
                router.push(`/?${nextQuery}`);
              }}
              className="text-sm font-medium text-accent-700 disabled:cursor-not-allowed disabled:text-ink-400"
            >
              {presetsLocked ? "Select Men+ or Women+ above" : "Apply this preset"}
            </button>
            <span className="text-xs text-ink-400">
              {presetsLocked ? "Presets inherit that target" : "Keeps current target"}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
