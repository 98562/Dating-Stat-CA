import { PRESETS } from "@/config/presets";
import { calculateProbability } from "@/lib/calculator";
import type { CalculationResult, CalculatorFilters, GeographyKey, NormalizedDataset } from "@/lib/types";

export interface ScenarioComparison {
  id: string;
  title: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  leftResult: CalculationResult;
  rightResult: CalculationResult;
  note: string;
}

function cloneFilters(filters: CalculatorFilters): CalculatorFilters {
  return {
    ...filters,
    ageRange: { ...filters.ageRange },
    populationGroups: [...filters.populationGroups],
    drinkingHabits: [...filters.drinkingHabits],
    heightPreference: {
      ...filters.heightPreference,
      presetIds: [...filters.heightPreference.presetIds],
      customRanges: filters.heightPreference.customRanges.map((range) => ({ ...range }))
    },
    looksPreference: { ...filters.looksPreference },
    manualAssumptions: filters.manualAssumptions.map((assumption) => ({ ...assumption }))
  };
}

function broadenEducation(value: CalculatorFilters["education"]) {
  switch (value) {
    case "doctorate":
    case "professional_degree":
    case "masters_plus":
      return "bachelors_plus";
    case "bachelors_plus":
    case "college_trades":
    case "high_school_or_less":
      return "all";
    default:
      return value;
  }
}

function broadenIncome(value: CalculatorFilters["income"]) {
  switch (value) {
    case "150k_plus":
      return "100k_plus";
    case "100k_plus":
      return "80k_plus";
    case "80k_plus":
      return "50k_plus";
    case "50k_plus":
      return "all";
    default:
      return value;
  }
}

function broadenLanguage(
  value: CalculatorFilters["language"],
  geography: GeographyKey,
  strength: "light" | "full"
) {
  if (strength === "full") {
    return "all";
  }

  if (value !== "bilingual") {
    return value;
  }

  return geography === "qc" ? "french" : "english";
}

function clearHeight(filters: CalculatorFilters) {
  filters.heightPreference = {
    ...filters.heightPreference,
    presetIds: [],
    customRanges: []
  };
}

function clearAssumptions(filters: CalculatorFilters) {
  filters.looksPreference = {
    ...filters.looksPreference,
    preset: "any"
  };
  filters.manualAssumptions = filters.manualAssumptions.map((assumption) => ({
    ...assumption,
    enabled: false,
    share: assumption.defaultShare
  }));
}

function buildRelaxedFilters(filters: CalculatorFilters) {
  const relaxed = cloneFilters(filters);
  const minFloor = relaxed.adultOnly ? 18 : 15;

  relaxed.ageRange = {
    min: Math.max(minFloor, relaxed.ageRange.min - 4),
    max: Math.min(85, relaxed.ageRange.max + 4)
  };
  relaxed.education = broadenEducation(relaxed.education);
  relaxed.income = broadenIncome(relaxed.income);
  relaxed.language = broadenLanguage(relaxed.language, relaxed.geography, "full");
  relaxed.populationGroups = [];
  relaxed.drinkingHabits = [];
  clearHeight(relaxed);
  clearAssumptions(relaxed);

  return relaxed;
}

function buildRealisticFilters(filters: CalculatorFilters) {
  const realistic = cloneFilters(filters);

  realistic.income = broadenIncome(realistic.income);
  realistic.language = broadenLanguage(realistic.language, realistic.geography, "light");
  clearHeight(realistic);
  clearAssumptions(realistic);

  return realistic;
}

function buildWithoutHeightFilters(filters: CalculatorFilters) {
  const withoutHeight = cloneFilters(filters);
  clearHeight(withoutHeight);
  return withoutHeight;
}

function buildGeographyVariant(filters: CalculatorFilters, geography: GeographyKey) {
  const variant = cloneFilters(filters);
  variant.geography = geography;
  return variant;
}

function buildPresetFilters(
  sourceFilters: CalculatorFilters,
  presetId: string
): CalculatorFilters | null {
  const preset = PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    return null;
  }

  const next = cloneFilters(sourceFilters);
  const built = preset.build();

  return {
    ...next,
    ...built,
    sex: sourceFilters.sex,
    manualAssumptions: sourceFilters.manualAssumptions.map((assumption) => ({
      ...assumption,
      enabled: false,
      share: assumption.defaultShare
    }))
  };
}

export function buildScenarioComparisons(
  dataset: NormalizedDataset,
  filters: CalculatorFilters
): ScenarioComparison[] {
  const current = calculateProbability(dataset, filters);
  const relaxed = calculateProbability(dataset, buildRelaxedFilters(filters));
  const realistic = calculateProbability(dataset, buildRealisticFilters(filters));
  const withoutHeight = calculateProbability(dataset, buildWithoutHeightFilters(filters));
  const torontoProxy = calculateProbability(dataset, buildGeographyVariant(filters, "on"));
  const canada = calculateProbability(dataset, buildGeographyVariant(filters, "canada"));
  const hasHeightPreference =
    filters.heightPreference.presetIds.length > 0 || filters.heightPreference.customRanges.length > 0;

  return [
    {
      id: "relaxed",
      title: "Current standards vs relaxed standards",
      description: "A nearby version that widens age and clears some of the narrower extras.",
      leftLabel: "Current",
      rightLabel: "Relaxed",
      leftResult: current,
      rightResult: relaxed,
      note:
        "Relaxed keeps the same target group and geography, but opens the age range slightly and removes some of the more narrowing optional filters."
    },
    {
      id: "realistic",
      title: "Realistic vs ideal",
      description: "A more grounded version beside your current ideal stack.",
      leftLabel: "Realistic",
      rightLabel: "Ideal",
      leftResult: realistic,
      rightResult: current,
      note:
        "Realistic strips out assumption-heavy steps and height, then softens a couple of stricter demographic filters. Ideal is your current stack."
    },
    {
      id: "height",
      title: "With height filter vs without",
      description: "Useful for seeing whether height is doing quiet damage or dramatic damage.",
      leftLabel: hasHeightPreference ? "With height" : "Current",
      rightLabel: "Without height",
      leftResult: current,
      rightResult: withoutHeight,
      note: hasHeightPreference
        ? "Height is estimated from measured-height distributions, so this comparison is especially useful as perspective rather than literal arithmetic."
        : "No height filter is active right now, so these two sides should stay the same."
    },
    {
      id: "toronto",
      title: "Toronto vs Canada",
      description: "A rough urban concentration check, using the nearest geography we actually have.",
      leftLabel: "Ontario proxy",
      rightLabel: "Canada",
      leftResult: torontoProxy,
      rightResult: canada,
      note:
        "This app does not yet load Toronto CMA data directly, so Ontario is used as the closest available proxy for the Toronto-side comparison."
    }
  ];
}

export function buildPresetScenarioComparison(
  dataset: NormalizedDataset,
  filters: CalculatorFilters,
  leftPresetId: string,
  rightPresetId: string
): ScenarioComparison | null {
  const leftFilters = buildPresetFilters(filters, leftPresetId);
  const rightFilters = buildPresetFilters(filters, rightPresetId);
  const leftPreset = PRESETS.find((item) => item.id === leftPresetId);
  const rightPreset = PRESETS.find((item) => item.id === rightPresetId);

  if (!leftFilters || !rightFilters || !leftPreset || !rightPreset) {
    return null;
  }

  return {
    id: "preset",
    title: "Preset A vs Preset B",
    description: "A direct preset-to-preset view using the same selected target sex.",
    leftLabel: leftPreset.label,
    rightLabel: rightPreset.label,
    leftResult: calculateProbability(dataset, leftFilters),
    rightResult: calculateProbability(dataset, rightFilters),
    note:
      "Preset comparison keeps your current 'Interested in' choice and resets optional assumptions so the presets are easier to compare on their own terms."
  };
}
