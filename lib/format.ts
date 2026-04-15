import { DRINKING_HABIT_OPTIONS } from "@/config/filters/drinking";
import { POPULATION_GROUP_OPTIONS } from "@/config/filters/ethnicity";
import { LOOKS_PRESET_MAP } from "@/config/filters/looks";
import { strictnessScale } from "@/config/copy/strictness";
import type { HeightRange } from "@/config/filters/height";
import { formatHeightRange, type HeightDisplayUnit } from "@/lib/units/height";
import type {
  ComparisonPlace,
  DrinkingHabitKey,
  LooksPreference,
  PopulationGroupKey,
  SourceType,
  StrictnessLevel
} from "@/lib/types";

export function formatPeople(value: number) {
  if (value < 1) {
    return "fewer than 1 person";
  }

  if (value < 10) {
    return `${value.toFixed(1)} people`;
  }

  return `${Math.round(value).toLocaleString("en-CA")} people`;
}

export function formatInteger(value: number) {
  return Math.round(value).toLocaleString("en-CA");
}

export function formatPercent(value: number) {
  const percentage = value * 100;

  if (percentage >= 10) {
    return `${percentage.toFixed(1)}%`;
  }

  if (percentage >= 1) {
    return `${percentage.toFixed(2)}%`;
  }

  return `${percentage.toFixed(3)}%`;
}

export function formatOneInX(value: number | null) {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return "effectively off the grid";
  }

  return `about 1 in ${Math.round(value).toLocaleString("en-CA")}`;
}

export function formatSourceType(sourceType: SourceType) {
  if (sourceType === "observed") {
    return "Observed";
  }

  if (sourceType === "estimated") {
    return "Estimated";
  }

  return "Assumption";
}

export function formatSourceTypeSupport(sourceType: SourceType) {
  if (sourceType === "observed") {
    return "Based on published data";
  }

  if (sourceType === "estimated") {
    return "Derived from available data";
  }

  return "Chosen by you";
}

export function formatStrictness(level: StrictnessLevel) {
  return strictnessScale.find((tier) => tier.level === level)?.label ?? "Selective";
}

export function describeComparison(place: ComparisonPlace, ratio: number) {
  if (ratio >= 0.95 && ratio <= 1.05) {
    return `roughly the population of ${place.label}`;
  }

  if (ratio < 1) {
    return `about ${(ratio * 100).toFixed(0)}% of ${place.label}`;
  }

  return `about ${ratio.toFixed(1)} times ${place.label}`;
}

export function formatPopulationGroupSelection(selected: PopulationGroupKey[]) {
  if (!selected.length) return "Any / no preference";

  return selected
    .map((key) => POPULATION_GROUP_OPTIONS[key]?.label ?? key)
    .join(", ");
}

export function formatDrinkingSelection(selected: DrinkingHabitKey[]) {
  if (!selected.length) return "Any / no preference";

  return selected
    .map((key) => DRINKING_HABIT_OPTIONS[key]?.label ?? key)
    .join(", ");
}

export function formatHeightSelection(
  ranges: HeightRange[],
  unit: HeightDisplayUnit
) {
  if (!ranges.length) return "Any / no preference";

  return ranges.map((range) => formatHeightRange(range, unit)).join(", ");
}

export function formatLooksSelection(looksPreference: LooksPreference) {
  if (looksPreference.preset === "any") return "Any / no preference";
  if (looksPreference.preset === "custom") {
    return `top ${Math.round(looksPreference.customShare * 100)}%`;
  }

  return LOOKS_PRESET_MAP[looksPreference.preset]?.label ?? "Custom assumption";
}
