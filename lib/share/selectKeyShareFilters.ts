import { DRINKING_HABIT_OPTIONS } from "@/config/filters/drinking";
import { POPULATION_GROUP_OPTIONS } from "@/config/filters/ethnicity";
import { HEIGHT_PRESET_MAP } from "@/config/filters/height";
import { LOOKS_PRESET_MAP } from "@/config/filters/looks";
import { GEO_LABELS, SEX_LABELS } from "@/lib/constants";
import { formatHeightRange } from "@/lib/units/height";
import type { CalculatorFilters } from "@/lib/types";

function getMaritalSummary(value: CalculatorFilters["maritalStatus"]) {
  switch (value) {
    case "not_married_not_common_law":
      return "not married / not common-law";
    case "never_married":
      return "never married";
    case "separated_divorced":
      return "separated or divorced";
    case "widowed":
      return "widowed";
    default:
      return null;
  }
}

function getEducationSummary(value: CalculatorFilters["education"]) {
  switch (value) {
    case "bachelors_plus":
      return "bachelor's+";
    case "masters_plus":
      return "master's+";
    case "professional_degree":
      return "professional degree";
    case "doctorate":
      return "doctorate";
    case "college_trades":
      return "college / trades";
    case "high_school_or_less":
      return "high school or less";
    default:
      return null;
  }
}

function getIncomeSummary(value: CalculatorFilters["income"]) {
  switch (value) {
    case "50k_plus":
      return "income over $50k";
    case "80k_plus":
      return "income over $80k";
    case "100k_plus":
      return "income over $100k";
    case "150k_plus":
      return "income over $150k";
    default:
      return null;
  }
}

function getLanguageSummary(value: CalculatorFilters["language"]) {
  switch (value) {
    case "english":
      return "English";
    case "french":
      return "French";
    case "bilingual":
      return "English and French";
    default:
      return null;
  }
}

function getPopulationGroupSummary(filters: CalculatorFilters) {
  if (!filters.populationGroups.length) {
    return null;
  }

  const labels = filters.populationGroups
    .slice(0, 2)
    .map((key) => POPULATION_GROUP_OPTIONS[key]?.label ?? key);

  return labels.length < filters.populationGroups.length
    ? `${labels.join(" + ")} + more`
    : labels.join(" + ");
}

function getDrinkingSummary(filters: CalculatorFilters) {
  if (!filters.drinkingHabits.length) {
    return null;
  }

  const labels = filters.drinkingHabits
    .slice(0, 2)
    .map((key) => DRINKING_HABIT_OPTIONS[key]?.label ?? key);

  return labels.length < filters.drinkingHabits.length
    ? `${labels.join(" + ")} + more`
    : labels.join(" + ");
}

function getHeightSummary(filters: CalculatorFilters) {
  const parts = [
    ...filters.heightPreference.presetIds
      .slice(0, 2)
      .map((id) => HEIGHT_PRESET_MAP[id]?.label ?? id),
    ...filters.heightPreference.customRanges
      .slice(0, 1)
      .map((range) => formatHeightRange(range, "cm"))
  ];

  if (!parts.length) {
    return null;
  }

  const totalSelections =
    filters.heightPreference.presetIds.length + filters.heightPreference.customRanges.length;

  return parts.length < totalSelections ? `${parts.join(" + ")} + more` : parts.join(" + ");
}

function getLooksSummary(filters: CalculatorFilters) {
  if (filters.looksPreference.preset === "any") {
    return null;
  }

  if (filters.looksPreference.preset === "custom") {
    return `top ${Math.round(filters.looksPreference.customShare * 100)}%`;
  }

  return LOOKS_PRESET_MAP[filters.looksPreference.preset]?.label ?? null;
}

export function selectKeyShareFilters(
  filters: CalculatorFilters,
  maxItems = 4
) {
  const items: string[] = [];

  items.push(`${filters.ageRange.min}-${filters.ageRange.max}`);

  if (filters.sex !== "all") {
    items.push(SEX_LABELS[filters.sex]);
  }

  const optionalItems = [
    getMaritalSummary(filters.maritalStatus),
    getEducationSummary(filters.education),
    getIncomeSummary(filters.income),
    getLanguageSummary(filters.language),
    getPopulationGroupSummary(filters),
    getDrinkingSummary(filters),
    getHeightSummary(filters),
    getLooksSummary(filters),
    filters.manualAssumptions.some((assumption) => assumption.enabled)
      ? "manual assumptions"
      : null
  ].filter((value): value is string => Boolean(value));

  for (const item of optionalItems) {
    if (items.length >= maxItems) {
      break;
    }
    items.push(item);
  }

  if (!items.length) {
    return [GEO_LABELS[filters.geography]];
  }

  return items.slice(0, maxItems);
}
