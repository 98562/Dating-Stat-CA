"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

import { DesktopCalculatorLayout } from "@/components/calculator/desktop-calculator-layout";
import type { FilterPanelProps } from "@/components/calculator/filter-panel";
import { MobileCalculatorLayout } from "@/components/calculator/mobile-calculator-layout";
import type { ResultsPanelProps } from "@/components/calculator/results-panel";
import { SourceBadge } from "@/components/calculator/source-badge";
import { featureFlags } from "@/config/features";
import { productConfig } from "@/config/product";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { calculateProbability } from "@/lib/calculator";
import { encodeFilters } from "@/lib/filter-query";
import { buildCustomManualAssumption } from "@/lib/manual-assumptions";
import { PRESETS } from "@/config/presets";
import type { CalculatorFilters, NormalizedDataset } from "@/lib/types";
import type { ViewportMode } from "@/lib/request-device";

interface CalculatorShellProps {
  dataset: NormalizedDataset;
  initialFilters: CalculatorFilters;
  initialViewportMode: ViewportMode;
  mode?: "preview" | "full";
}

export function CalculatorShell({
  dataset,
  initialFilters,
  initialViewportMode,
  mode = "full"
}: CalculatorShellProps) {
  const pathname = usePathname();
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [activePresetId, setActivePresetId] = useState("");
  const [viewportMode, setViewportMode] = useState<ViewportMode>(initialViewportMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewportMode = () => {
      setViewportMode(mediaQuery.matches ? "desktop" : "mobile");
    };

    syncViewportMode();
    mediaQuery.addEventListener("change", syncViewportMode);

    return () => {
      mediaQuery.removeEventListener("change", syncViewportMode);
    };
  }, []);

  useEffect(() => {
    setFilters(initialFilters);
    setActivePresetId("");
  }, [initialFilters]);

  useEffect(() => {
    if (pathname.startsWith("/s/")) {
      return;
    }
    const query = encodeFilters(filters);
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(window.history.state, "", nextUrl);
    window.dispatchEvent(new CustomEvent("calculator:filters-sync"));
  }, [filters, pathname]);

  const result = useMemo(() => calculateProbability(dataset, filters), [dataset, filters]);

  const setField = <K extends keyof CalculatorFilters>(
    key: K,
    value: CalculatorFilters[K]
  ) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const updateAge = (key: "min" | "max", value: number) => {
    setActivePresetId("");
    setFilters((current) => {
      const next = {
        ...current.ageRange,
        [key]: Math.max(productConfig.minimumAge, value)
      };

      return {
        ...current,
        ageRange: {
          min: Math.min(next.min, next.max),
          max: Math.max(next.min, next.max)
        }
      };
    });
  };

  const toggleAssumption = (id: string, enabled: boolean) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      manualAssumptions: current.manualAssumptions.map((assumption) =>
        assumption.id === id ? { ...assumption, enabled } : assumption
      )
    }));
  };

  const setAssumptionShare = (id: string, share: number) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      manualAssumptions: current.manualAssumptions.map((assumption) =>
        assumption.id === id ? { ...assumption, share } : assumption
      )
    }));
  };

  const togglePopulationGroup = (group: CalculatorFilters["populationGroups"][number]) => {
    setActivePresetId("");
    setFilters((current) => {
      const exists = current.populationGroups.includes(group);
      return {
        ...current,
        populationGroups: exists
          ? current.populationGroups.filter((item) => item !== group)
          : [...current.populationGroups, group]
      };
    });
  };

  const toggleDrinkingHabit = (habit: CalculatorFilters["drinkingHabits"][number]) => {
    setActivePresetId("");
    setFilters((current) => {
      const exists = current.drinkingHabits.includes(habit);
      return {
        ...current,
        drinkingHabits: exists
          ? current.drinkingHabits.filter((item) => item !== habit)
          : [...current.drinkingHabits, habit]
      };
    });
  };

  const setHeightDisplayUnit = (displayUnit: CalculatorFilters["heightPreference"]["displayUnit"]) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      heightPreference: {
        ...current.heightPreference,
        displayUnit
      }
    }));
  };

  const toggleHeightPreset = (presetId: string) => {
    setActivePresetId("");
    setFilters((current) => {
      const exists = current.heightPreference.presetIds.includes(presetId);

      return {
        ...current,
        heightPreference: {
          ...current.heightPreference,
          presetIds: exists
            ? current.heightPreference.presetIds.filter((item) => item !== presetId)
            : [...current.heightPreference.presetIds, presetId]
        }
      };
    });
  };

  const addHeightRange = (minCm: number, maxCm: number | null) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      heightPreference: {
        ...current.heightPreference,
        customRanges: [...current.heightPreference.customRanges, { minCm, maxCm }]
      }
    }));
  };

  const removeHeightRange = (index: number) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      heightPreference: {
        ...current.heightPreference,
        customRanges: current.heightPreference.customRanges.filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  };

  const setLooksPreset = (preset: CalculatorFilters["looksPreference"]["preset"]) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      looksPreference: {
        ...current.looksPreference,
        preset
      }
    }));
  };

  const setLooksCustomShare = (customShare: number) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      looksPreference: {
        ...current.looksPreference,
        customShare
      }
    }));
  };

  const handlePreset = (presetId: string) => {
    if (!presetId) {
      setActivePresetId("");
      return;
    }

    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setFilters((current) => ({
      ...current,
      ...preset.build(),
      sex: current.sex,
      manualAssumptions: current.manualAssumptions.map((assumption) => ({
        ...assumption,
        enabled: false,
        share: assumption.defaultShare
      }))
    }));
  };

  const addCustomAssumption = (label: string) => {
    setActivePresetId("");
    setFilters((current) => {
      const nextAssumption = buildCustomManualAssumption(current.manualAssumptions, label);

      if (!nextAssumption) {
        return current;
      }

      return {
        ...current,
        manualAssumptions: [...current.manualAssumptions, nextAssumption]
      };
    });
  };

  const removeCustomAssumption = (id: string) => {
    setActivePresetId("");
    setFilters((current) => ({
      ...current,
      manualAssumptions: current.manualAssumptions.filter((assumption) => assumption.id !== id)
    }));
  };

  const filterPanelProps: FilterPanelProps = {
    filters,
    activePresetId,
    showManualAssumptions: mode === "full" && featureFlags.manualAssumptionsEnabled,
    mode,
    onPreset: handlePreset,
    onFieldChange: setField,
    onAgeChange: updateAge,
    onTogglePopulationGroup: togglePopulationGroup,
    onToggleDrinkingHabit: toggleDrinkingHabit,
    onHeightDisplayUnitChange: setHeightDisplayUnit,
    onToggleHeightPreset: toggleHeightPreset,
    onAddHeightRange: addHeightRange,
    onRemoveHeightRange: removeHeightRange,
    onLooksPresetChange: setLooksPreset,
    onLooksCustomShareChange: setLooksCustomShare,
    onToggleAssumption: toggleAssumption,
    onAssumptionShare: setAssumptionShare,
    onAddCustomAssumption: addCustomAssumption,
    onRemoveCustomAssumption: removeCustomAssumption
  };

  const resultsPanelProps: ResultsPanelProps = {
    dataset,
    filters,
    result,
    activePresetId,
    mode,
    onOpenMethodology: () => setMethodologyOpen(true),
    onOpenSources: () => setSourcesOpen(true)
  };

  return (
    <>
      {viewportMode === "desktop" ? (
        <DesktopCalculatorLayout
          filterPanelProps={filterPanelProps}
          resultsPanelProps={resultsPanelProps}
        />
      ) : (
        <MobileCalculatorLayout
          filterPanelProps={filterPanelProps}
          resultsPanelProps={resultsPanelProps}
        />
      )}

      <Dialog
        open={methodologyOpen}
        onOpenChange={setMethodologyOpen}
        title="How this calculator works"
        description="The short version: official data first, estimation second, invented certainty never."
      >
        <div className="space-y-6 text-sm text-ink-600">
          <Card>
            <CardHeader>
              <CardTitle>Method in plain English</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p>
                We start with the latest quarterly population estimate for your selected geography. We then apply age, sex / gender, population group, marital-status proxy, education, income, and language filters using the best available Statistics Canada tables.
              </p>
              <p>
                For simplicity, the calculator only supports age ranges {productConfig.minimumAge} and above. Older links or restored share states are safely clamped back to that range.
              </p>
              <p>
                When the exact combination exists in one public cross-tab, the step is labelled <strong>Observed</strong>. When it does not, the step is labelled <strong>Estimated</strong> and the calculator applies the closest official distribution available.
              </p>
              <p>
                Drinking habits come from Canadian health-survey alcohol-use data and are usually estimated rather than census-observed. Height is estimated from official Canadian height distributions, and attractiveness is always treated as your assumption rather than an objective national fact.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What the result is and is not</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p>
                The result estimates how many people match the selected statistical traits. It does not measure dating intent, mutual attraction, app activity, compatibility, or whether someone would enjoy your favourite restaurant.
              </p>
              <p>
                &quot;Single&quot; in public datasets often means legal marital status or household relationship status, not &quot;currently looking.&quot; That is why the interface calls this a relationship-availability proxy rather than a certainty.
              </p>
              <p>
                Income comes from the Census reference year 2020, while the population base is a January 1, 2026 estimate. That mismatch is shown so the result keeps its context.
              </p>
            </CardContent>
          </Card>
        </div>
      </Dialog>

      <Dialog
        open={sourcesOpen}
        onOpenChange={setSourcesOpen}
        title="Source notes"
        description="Each source is official; the quality question is how directly it supports the exact combination you selected."
        side="right"
      >
        <div className="space-y-4">
          {Object.values(dataset.sources).map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{source.title}</CardTitle>
                    <CardDescription>{source.yearLabel}</CardDescription>
                  </div>
                  <SourceBadge
                    sourceType={
                      source.id === "manual-assumptions"
                        ? "assumption"
                        : source.id === "chms-height-table-22" || source.id === "cchs-alcohol-risk-2023"
                          ? "estimated"
                          : "observed"
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
                <p>{source.note}</p>
                {source.tableId ? (
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
                    Table {source.tableId}
                  </p>
                ) : null}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent-700"
                >
                  Open source
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
          <Separator />
          <p className="text-sm text-ink-500">
            Most tabular sources live under <code>data/raw</code>, while lighter normalized survey mappings live under <code>data/normalized</code>. The app pulls both into the same filter pipeline so future source swaps do not require a UI rewrite.
          </p>
        </div>
      </Dialog>
    </>
  );
}
