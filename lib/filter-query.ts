import { DEFAULT_FILTERS } from "@/lib/constants";
import { productConfig } from "@/config/product";
import {
  buildCustomManualAssumption,
  CUSTOM_MANUAL_ASSUMPTION_PREFIX,
  MAX_CUSTOM_MANUAL_ASSUMPTIONS
} from "@/lib/manual-assumptions";
import type {
  CalculatorFilters,
  EducationFilterKey,
  GeographyKey,
  IncomeFilterKey,
  LanguageFilterKey,
  LooksPresetKey,
  ManualAssumptionSelection,
  MaritalFilterKey,
  DrinkingHabitKey,
  PopulationGroupKey,
  SexKey
} from "@/lib/types";

function parseAssumptions(value: string | undefined, defaults: ManualAssumptionSelection[]) {
  if (!value) {
    return defaults;
  }

  const parsedEntries = value.split("|").map((entry) => entry.split("~"));
  const selected = new Map<string, number>();
  const customAssumptions: ManualAssumptionSelection[] = [];

  for (const parts of parsedEntries) {
    if (parts.length === 1 && parts[0].includes(":")) {
      const [id, shareValue] = parts[0].split(":");
      if (id) {
        selected.set(id, Number(shareValue));
      }
      continue;
    }

    if (parts[0] === "c") {
      const [, id, encodedLabel, shareValue] = parts;
      const share = Number(shareValue);
      const label = encodedLabel ? decodeURIComponent(encodedLabel) : "";
      const assumption = buildCustomManualAssumption(
        [...defaults, ...customAssumptions],
        label,
        Math.min(1, Math.max(0, share))
      );

      if (assumption) {
        assumption.id = id?.startsWith(CUSTOM_MANUAL_ASSUMPTION_PREFIX) ? id : assumption.id;
        customAssumptions.push(assumption);
      }
      continue;
    }

    const [, id, shareValue] = parts;
    if (id) {
      selected.set(id, Number(shareValue));
    }
  }

  const builtIns = defaults.map((assumption) => {
    const share = selected.get(assumption.id);
    return share === undefined
      ? assumption
      : {
          ...assumption,
          enabled: true,
          share: Math.min(1, Math.max(0, share))
        };
  });

  return [...builtIns, ...customAssumptions.slice(0, MAX_CUSTOM_MANUAL_ASSUMPTIONS)];
}

function parsePopulationGroups(value: string | undefined) {
  if (!value) return DEFAULT_FILTERS.populationGroups;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as PopulationGroupKey[];
}

function parseDrinkingHabits(value: string | undefined) {
  if (!value) return DEFAULT_FILTERS.drinkingHabits;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as DrinkingHabitKey[];
}

function parseCustomHeightRanges(value: string | undefined) {
  if (!value) return DEFAULT_FILTERS.heightPreference.customRanges;

  return value
    .split("|")
    .map((entry) => {
      const [min, max] = entry.split("-");
      const minCm = Number(min);
      const maxCm = max ? Number(max) : null;

      if (!Number.isFinite(minCm)) return null;

      return {
        minCm,
        maxCm: maxCm !== null && Number.isFinite(maxCm) ? maxCm : null
      };
    })
    .filter((value): value is { minCm: number; maxCm: number | null } => value !== null);
}

function parseHeightPresets(value: string | undefined) {
  if (!value) return DEFAULT_FILTERS.heightPreference.presetIds;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function decodeFilters(
  searchParams: Record<string, string | string[] | undefined>,
  defaults: ManualAssumptionSelection[]
): CalculatorFilters {
  const value = (key: string) => {
    const raw = searchParams[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  return {
    geography: (value("geo") as GeographyKey) ?? DEFAULT_FILTERS.geography,
    ageRange: {
      min: Math.max(productConfig.minimumAge, Number(value("min")) || DEFAULT_FILTERS.ageRange.min),
      max: Math.max(productConfig.minimumAge, Number(value("max")) || DEFAULT_FILTERS.ageRange.max)
    },
    sex: (value("sex") as SexKey) ?? DEFAULT_FILTERS.sex,
    maritalStatus:
      (value("marital") as MaritalFilterKey) ?? DEFAULT_FILTERS.maritalStatus,
    education:
      (value("education") as EducationFilterKey) ?? DEFAULT_FILTERS.education,
    income: (value("income") as IncomeFilterKey) ?? DEFAULT_FILTERS.income,
    language:
      (value("language") as LanguageFilterKey) ?? DEFAULT_FILTERS.language,
    populationGroups: parsePopulationGroups(value("pop")),
    drinkingHabits: parseDrinkingHabits(value("drinking")),
    heightPreference: {
      presetIds: parseHeightPresets(value("heightPresets")),
      customRanges: parseCustomHeightRanges(value("heightCustom")),
      displayUnit:
        value("heightUnit") === "imperial"
          ? "imperial"
          : DEFAULT_FILTERS.heightPreference.displayUnit
    },
    looksPreference: {
      preset: ((value("looks") as LooksPresetKey) ?? DEFAULT_FILTERS.looksPreference.preset),
      customShare: Math.min(
        1,
        Math.max(0, Number(value("looksShare")) || DEFAULT_FILTERS.looksPreference.customShare)
      )
    },
    adultOnly: true,
    manualAssumptions: parseAssumptions(value("assumptions"), defaults)
  };
}

export function encodeFilters(filters: CalculatorFilters) {
  const params = new URLSearchParams();
  params.set("geo", filters.geography);
  params.set("min", String(filters.ageRange.min));
  params.set("max", String(filters.ageRange.max));
  params.set("sex", filters.sex);
  params.set("marital", filters.maritalStatus);
  params.set("education", filters.education);
  params.set("income", filters.income);
  params.set("language", filters.language);
  if (filters.populationGroups.length) {
    params.set("pop", filters.populationGroups.join(","));
  }
  if (filters.drinkingHabits.length) {
    params.set("drinking", filters.drinkingHabits.join(","));
  }
  if (filters.heightPreference.presetIds.length) {
    params.set("heightPresets", filters.heightPreference.presetIds.join(","));
  }
  if (filters.heightPreference.customRanges.length) {
    params.set(
      "heightCustom",
      filters.heightPreference.customRanges
        .map((range) => `${range.minCm}-${range.maxCm ?? ""}`)
        .join("|")
    );
  }
  params.set("heightUnit", filters.heightPreference.displayUnit);
  if (filters.looksPreference.preset !== "any") {
    params.set("looks", filters.looksPreference.preset);
    if (filters.looksPreference.preset === "custom") {
      params.set("looksShare", filters.looksPreference.customShare.toFixed(2));
    }
  }
  const assumptions = filters.manualAssumptions
    .filter((item) => item.enabled)
    .map((item) =>
      item.isCustom
        ? `c~${item.id}~${encodeURIComponent(item.label)}~${item.share.toFixed(2)}`
        : `b~${item.id}~${item.share.toFixed(2)}`
    )
    .join("|");

  if (assumptions) {
    params.set("assumptions", assumptions);
  }

  return params.toString();
}
