"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import { DRINKING_FILTER_HELPER_TEXT, DRINKING_HABITS } from "@/config/filters/drinking";
import { POPULATION_GROUPS } from "@/config/filters/ethnicity";
import { HEIGHT_PRESETS } from "@/config/filters/height";
import { LOOKS_PRESETS } from "@/config/filters/looks";
import { productConfig } from "@/config/product";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  formatDrinkingSelection,
  formatHeightSelection,
  formatLooksSelection,
  formatPopulationGroupSelection
} from "@/lib/format";
import { GEO_LABELS } from "@/lib/constants";
import {
  getCustomManualAssumptions,
  MAX_CUSTOM_MANUAL_ASSUMPTIONS
} from "@/lib/manual-assumptions";
import { PRESETS } from "@/config/presets";
import { normalizeRanges } from "@/lib/calculation/utils/normalizeRanges";
import type { CalculatorFilters, GeographyKey } from "@/lib/types";
import { formatHeightRange } from "@/lib/units/height";
import { cn } from "@/lib/utils";

export interface FilterPanelProps {
  filters: CalculatorFilters;
  activePresetId: string;
  showManualAssumptions: boolean;
  mode?: "preview" | "full";
  showQuickSetup?: boolean;
  showAdvancedSections?: boolean;
  defaultOpenDisclosures?: boolean;
  hidePanelHeader?: boolean;
  cardClassName?: string;
  contentClassName?: string;
  panelTitle?: string;
  panelDescription?: string;
  onPreset: (presetId: string) => void;
  onFieldChange: <K extends keyof CalculatorFilters>(
    key: K,
    value: CalculatorFilters[K]
  ) => void;
  onAgeChange: (key: "min" | "max", value: number) => void;
  onTogglePopulationGroup: (group: CalculatorFilters["populationGroups"][number]) => void;
  onToggleDrinkingHabit: (habit: CalculatorFilters["drinkingHabits"][number]) => void;
  onHeightDisplayUnitChange: (value: CalculatorFilters["heightPreference"]["displayUnit"]) => void;
  onToggleHeightPreset: (presetId: string) => void;
  onAddHeightRange: (minCm: number, maxCm: number | null) => void;
  onRemoveHeightRange: (index: number) => void;
  onLooksPresetChange: (preset: CalculatorFilters["looksPreference"]["preset"]) => void;
  onLooksCustomShareChange: (share: number) => void;
  onToggleAssumption: (id: string, enabled: boolean) => void;
  onAssumptionShare: (id: string, share: number) => void;
  onAddCustomAssumption: (label: string) => void;
  onRemoveCustomAssumption: (id: string) => void;
}

function Group({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-700">
          {title}
        </h3>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function FilterPanel({
  filters,
  activePresetId,
  showManualAssumptions,
  mode = "full",
  showQuickSetup = true,
  showAdvancedSections = true,
  defaultOpenDisclosures = false,
  hidePanelHeader = false,
  cardClassName,
  contentClassName,
  panelTitle = "Filter studio",
  panelDescription = "Start broad, tighten carefully, and let the funnel keep score.",
  onPreset,
  onFieldChange,
  onAgeChange,
  onTogglePopulationGroup,
  onToggleDrinkingHabit,
  onHeightDisplayUnitChange,
  onToggleHeightPreset,
  onAddHeightRange,
  onRemoveHeightRange,
  onLooksPresetChange,
  onLooksCustomShareChange,
  onToggleAssumption,
  onAssumptionShare,
  onAddCustomAssumption,
  onRemoveCustomAssumption
}: FilterPanelProps) {
  const isPreview = mode === "preview";
  const minimumAge = productConfig.minimumAge;
  const ageOptions = Array.from({ length: 86 - minimumAge }, (_, index) => minimumAge + index);
  const activePreset = PRESETS.find((preset) => preset.id === activePresetId);
  const [populationGroupQuery, setPopulationGroupQuery] = useState("");
  const [customHeightMin, setCustomHeightMin] = useState("");
  const [customHeightMax, setCustomHeightMax] = useState("");
  const [customAssumptionLabel, setCustomAssumptionLabel] = useState("");
  const visiblePopulationGroups = useMemo(
    () =>
      POPULATION_GROUPS.filter((group) =>
        group.label.toLowerCase().includes(populationGroupQuery.trim().toLowerCase())
      ),
    [populationGroupQuery]
  );
  const normalizedHeightRanges = normalizeRanges([
    ...filters.heightPreference.presetIds
      .map((presetId) => HEIGHT_PRESETS.find((preset) => preset.id === presetId)?.range)
      .filter((range): range is { minCm: number; maxCm: number | null } => Boolean(range)),
    ...filters.heightPreference.customRanges
  ]);
  const presetLocked = filters.sex === "all";
  const customManualAssumptions = getCustomManualAssumptions(filters.manualAssumptions);
  const remainingCustomAssumptionSlots =
    MAX_CUSTOM_MANUAL_ASSUMPTIONS - customManualAssumptions.length;

  return (
    <div className={isPreview ? "space-y-4" : "space-y-6"}>
      <Card className={cn("overflow-hidden", cardClassName)}>
        {hidePanelHeader ? null : (
          <CardHeader className="bg-gradient-to-br from-sand-50 to-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent-50 p-3 text-accent-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{panelTitle}</CardTitle>
                <CardDescription>{panelDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(isPreview ? "space-y-4" : "space-y-6", contentClassName)}>
          {showQuickSetup ? (
            <Group
              title="Quick setup"
              description={
                isPreview
                  ? "Start with the essentials. More filters stay tucked below."
                  : "Keep the first layer lean. Extra precision lives one click deeper."
              }
            >
              <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Interested in</span>
                <Select
                  value={filters.sex}
                  onChange={(event) =>
                    onFieldChange("sex", event.target.value as CalculatorFilters["sex"])
                  }
                >
                  <option value="all">Choose one first</option>
                  <option value="men">Men+</option>
                  <option value="women">Women+</option>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Preset</span>
                <Select
                  value={activePresetId}
                  onChange={(event) => onPreset(event.target.value)}
                  disabled={presetLocked}
                >
                  <option value="">Choose a preset</option>
                  {PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="rounded-3xl border border-black/5 bg-sand-50 px-4 py-3">
                <p className="text-sm font-medium text-ink-900">
                  {presetLocked
                    ? "Choose who you are filtering for first"
                    : activePreset
                      ? activePreset.label
                      : "What presets do"}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {presetLocked
                    ? "Presets inherit the current 'Interested in' selection, so they wait until that choice is explicit."
                    : activePreset
                    ? `${activePreset.description} Presets are editable starting points, not personality verdicts.`
                    : "Presets prefill a coherent bundle of filters so you can start from a recognizable profile, then adjust everything."}
                </p>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Geography</span>
                <Select
                  value={filters.geography}
                  onChange={(event) =>
                    onFieldChange("geography", event.target.value as GeographyKey)
                  }
                >
                  {Object.entries(GEO_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-700">Min age</span>
                  <Select
                    value={String(filters.ageRange.min)}
                    onChange={(event) => onAgeChange("min", Number(event.target.value))}
                  >
                    {ageOptions.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-700">Max age</span>
                  <Select
                    value={String(filters.ageRange.max)}
                    onChange={(event) => onAgeChange("max", Number(event.target.value))}
                  >
                    {ageOptions.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <p className="text-xs text-ink-500">
                Minimum selectable age is {productConfig.minimumAge}.
              </p>
              </div>
            </Group>
          ) : null}

          {showAdvancedSections && !isPreview && showManualAssumptions ? (
            <>
              {showQuickSetup ? <Separator /> : null}
              <Disclosure
                title="Optional assumptions"
                description="The calculator-only layer for preferences that are intentionally user-defined."
                defaultOpen={defaultOpenDisclosures}
              >
                <div className="space-y-4">
                  {filters.manualAssumptions.map((assumption) => (
                    <div key={assumption.id} className="rounded-3xl border border-black/5 bg-sand-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-ink-900">{assumption.label}</p>
                            {assumption.isCustom ? (
                              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500 ring-1 ring-black/10">
                                Custom
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-ink-500">{assumption.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {assumption.isCustom ? (
                            <button
                              type="button"
                              onClick={() => onRemoveCustomAssumption(assumption.id)}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-black/10"
                            >
                              Remove
                            </button>
                          ) : null}
                          <Switch
                            className="mt-0.5"
                            checked={assumption.enabled}
                            onCheckedChange={(enabled) => onToggleAssumption(assumption.id, enabled)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm text-ink-700">
                          <span>Assumed qualifying share</span>
                          <span>{Math.round(assumption.share * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(assumption.share * 100)}
                          onChange={(event) =>
                            onAssumptionShare(assumption.id, Number(event.target.value) / 100)
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-200 accent-accent-500"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-3xl border border-dashed border-black/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-ink-900">Add a custom filter</p>
                        <p className="mt-1 text-sm text-ink-500">
                          Add up to {MAX_CUSTOM_MANUAL_ASSUMPTIONS} personal assumption filters for traits the app does not model directly.
                        </p>
                      </div>
                      <span className="rounded-full bg-sand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                        {remainingCustomAssumptionSlots} left
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr),auto]">
                      <Input
                        value={customAssumptionLabel}
                        onChange={(event) => setCustomAssumptionLabel(event.target.value)}
                        placeholder="Example: okay with long distance"
                        maxLength={48}
                      />
                      <button
                        type="button"
                        disabled={
                          !customAssumptionLabel.trim() || remainingCustomAssumptionSlots <= 0
                        }
                        onClick={() => {
                          onAddCustomAssumption(customAssumptionLabel);
                          setCustomAssumptionLabel("");
                        }}
                        className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add custom filter
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-ink-500">
                      New custom filters start as assumptions with a default 50% surviving share, and you can adjust or remove them anytime.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-ink-500">
                    Religion, immigration background, and some additional ethnocultural filters are
                    held back until the supporting public data are clean enough to trust.
                  </div>
                </div>
              </Disclosure>
            </>
          ) : null}

          {showAdvancedSections && showQuickSetup ? <Separator /> : null}

          {showAdvancedSections ? (
            <Disclosure
              title={isPreview ? "More filters" : "More demographic filters"}
              description={
                isPreview
                  ? "Education, income, language, and secondary traits live here."
                  : "Education, income, language, and relationship-status filters live here."
              }
              defaultOpen={defaultOpenDisclosures}
            >
              <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Relationship availability proxy</span>
                <Select
                  value={filters.maritalStatus}
                  onChange={(event) =>
                    onFieldChange(
                      "maritalStatus",
                      event.target.value as CalculatorFilters["maritalStatus"]
                    )
                  }
                >
                  <option value="all">All legal relationship statuses</option>
                  <option value="not_married_not_common_law">Not married / not common-law</option>
                  <option value="never_married">Never married</option>
                  <option value="separated_divorced">Separated or divorced</option>
                  <option value="widowed">Widowed</option>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Education</span>
                <Select
                  value={filters.education}
                  onChange={(event) =>
                    onFieldChange(
                      "education",
                      event.target.value as CalculatorFilters["education"]
                    )
                  }
                >
                  <option value="all">All education levels</option>
                  <option value="high_school_or_less">High school or less</option>
                  <option value="college_trades">College / trades</option>
                  <option value="bachelors_plus">Bachelor&apos;s degree or higher</option>
                  <option value="masters_plus">Master&apos;s or higher</option>
                  <option value="professional_degree">Professional degree</option>
                  <option value="doctorate">Doctorate</option>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Income</span>
                <Select
                  value={filters.income}
                  onChange={(event) =>
                    onFieldChange("income", event.target.value as CalculatorFilters["income"])
                  }
                >
                  <option value="all">All income bands</option>
                  <option value="50k_plus">Over $50,000</option>
                  <option value="80k_plus">Over $80,000</option>
                  <option value="100k_plus">Over $100,000</option>
                  <option value="150k_plus">Over $150,000</option>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-700">Language</span>
                <Select
                  value={filters.language}
                  onChange={(event) =>
                    onFieldChange("language", event.target.value as CalculatorFilters["language"])
                  }
                >
                  <option value="all">All official-language profiles</option>
                  <option value="english">Can speak English</option>
                  <option value="french">Can speak French</option>
                  <option value="bilingual">English and French</option>
                </Select>
              </label>
              </div>
            </Disclosure>
          ) : null}

          {showAdvancedSections ? (
            <Disclosure
              title="Extra preferences"
              description="A mix of official population-group data, estimated height distributions, and personal assumptions."
              defaultOpen={defaultOpenDisclosures}
            >
              <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-ink-700">
                    Population group (official categories)
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    Based on official demographic source categories. Selecting more than one means match any selected category.
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    This list includes the official <span className="font-medium text-ink-700">Not a visible minority</span> category, which covers White and other non-visible-minority responses in the source variable.
                  </p>
                </div>
                <Input
                  value={populationGroupQuery}
                  onChange={(event) => setPopulationGroupQuery(event.target.value)}
                  placeholder="Search official population-group categories"
                />
                <div className="rounded-3xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600 break-words">
                  Selected: {formatPopulationGroupSelection(filters.populationGroups)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {visiblePopulationGroups.map((group) => {
                    const selected = filters.populationGroups.includes(group.key);

                    return (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => onTogglePopulationGroup(group.key)}
                        className={
                          selected
                            ? "rounded-full bg-accent-500 px-3 py-2 text-sm font-medium text-white"
                            : "rounded-full bg-white px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-black/10"
                        }
                      >
                        {group.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-ink-700">Drinking habits</p>
                  <p className="mt-1 text-xs text-ink-500">{DRINKING_FILTER_HELPER_TEXT}</p>
                </div>
                <div className="rounded-3xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600 break-words">
                  Selected: {formatDrinkingSelection(filters.drinkingHabits)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {DRINKING_HABITS.map((habit) => {
                    const selected = filters.drinkingHabits.includes(habit.key);

                    return (
                      <button
                        key={habit.key}
                        type="button"
                        onClick={() => onToggleDrinkingHabit(habit.key)}
                        className={
                          selected
                            ? "rounded-full bg-accent-500 px-3 py-2 text-sm font-medium text-white"
                            : "rounded-full bg-white px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-black/10"
                        }
                      >
                        {habit.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-ink-700">Height</p>
                    <p className="mt-1 text-xs text-ink-500">
                      Estimated from Canadian height distributions. Multiple selections mean either range is acceptable.
                    </p>
                  </div>
                  <div className="flex justify-start">
                    <div className="flex rounded-full bg-sand-100 p-1">
                      {(["cm", "imperial"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => onHeightDisplayUnitChange(unit)}
                          className={
                            filters.heightPreference.displayUnit === unit
                              ? "rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 shadow-soft"
                              : "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-500"
                          }
                        >
                          {unit === "cm" ? "Metric" : "Imperial"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600 break-words">
                  Selected: {formatHeightSelection(normalizedHeightRanges, filters.heightPreference.displayUnit)}
                </div>

                <div className="flex flex-wrap gap-2">
                  {HEIGHT_PRESETS.map((preset) => {
                    const selected = filters.heightPreference.presetIds.includes(preset.id);

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onToggleHeightPreset(preset.id)}
                        className={
                          selected
                            ? "rounded-full bg-accent-500 px-3 py-2 text-sm font-medium text-white"
                            : "rounded-full bg-white px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-black/10"
                        }
                      >
                        {formatHeightRange(preset.range, filters.heightPreference.displayUnit)}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Custom ranges
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,1fr,auto] sm:items-end">
                    <label className="space-y-2">
                      <span className="text-xs font-medium text-ink-600">Min height</span>
                      <Input
                        inputMode="numeric"
                        placeholder="Min cm"
                        value={customHeightMin}
                        onChange={(event) => setCustomHeightMin(event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-medium text-ink-600">Max height</span>
                      <Input
                        inputMode="numeric"
                        placeholder="Max cm or blank"
                        value={customHeightMax}
                        onChange={(event) => setCustomHeightMax(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const minCm = Number(customHeightMin);
                        const maxCm = customHeightMax.trim() ? Number(customHeightMax) : null;

                        if (!Number.isFinite(minCm)) return;
                        if (maxCm !== null && !Number.isFinite(maxCm)) return;

                        onAddHeightRange(minCm, maxCm);
                        setCustomHeightMin("");
                        setCustomHeightMax("");
                      }}
                      className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Add range
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    Custom ranges are stored in centimetres. The unit toggle changes display, not the underlying math.
                  </p>
                </div>
                {filters.heightPreference.customRanges.length ? (
                  <div className="flex flex-wrap gap-2">
                    {filters.heightPreference.customRanges.map((range, index) => (
                      <button
                        key={`${range.minCm}-${range.maxCm ?? "plus"}-${index}`}
                        type="button"
                        onClick={() => onRemoveHeightRange(index)}
                        className="rounded-2xl bg-gold-100 px-3 py-2 text-left text-sm font-medium text-ink-900 whitespace-normal break-words"
                      >
                        Remove {formatHeightRange(range, filters.heightPreference.displayUnit)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-ink-700">Looks / attractiveness</p>
                  <p className="mt-1 text-sm text-ink-500">
                    Attraction is subjective. This step is your assumption, not a census fact.
                  </p>
                </div>
                <Select
                  value={filters.looksPreference.preset}
                  onChange={(event) =>
                    onLooksPresetChange(
                      event.target.value as CalculatorFilters["looksPreference"]["preset"]
                    )
                  }
                >
                  <option value="any">Any / no preference</option>
                  {LOOKS_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                  <option value="custom">Custom %</option>
                </Select>
                {filters.looksPreference.preset === "custom" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-ink-700">
                      <span>Custom assumed share</span>
                      <span>{Math.round(filters.looksPreference.customShare * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={Math.round(filters.looksPreference.customShare * 100)}
                      onChange={(event) =>
                        onLooksCustomShareChange(Number(event.target.value) / 100)
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-200 accent-accent-500"
                    />
                  </div>
                ) : null}
                <div className="rounded-3xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600">
                  Selected: {formatLooksSelection(filters.looksPreference)}
                </div>
              </div>
              </div>
            </Disclosure>
          ) : null}
        </CardContent>
      </Card>

    </div>
  );
}
