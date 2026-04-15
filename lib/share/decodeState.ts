import { DRINKING_HABITS } from "@/config/filters/drinking";
import { POPULATION_GROUPS } from "@/config/filters/ethnicity";
import { HEIGHT_PRESETS } from "@/config/filters/height";
import { productConfig } from "@/config/product";
import { DEFAULT_FILTERS, GEO_ORDER } from "@/lib/constants";
import {
  buildCustomManualAssumption,
  CUSTOM_MANUAL_ASSUMPTION_PREFIX,
  MAX_CUSTOM_MANUAL_ASSUMPTIONS
} from "@/lib/manual-assumptions";
import { fromBase64Url } from "@/lib/share/codec";
import {
  CompactShareStateV1,
  EDUCATION_SHARE_VALUES,
  INCOME_SHARE_VALUES,
  LANGUAGE_SHARE_VALUES,
  LOOKS_SHARE_VALUES,
  MARITAL_SHARE_VALUES,
  SEX_SHARE_VALUES,
  SHARE_STATE_VERSION
} from "@/lib/share/schema";
import type { CalculatorFilters, ManualAssumptionSelection } from "@/lib/types";

export interface ShareStateDecodeResult {
  ok: boolean;
  filters: CalculatorFilters;
  error?: string;
}

function cloneDefaults(defaults: ManualAssumptionSelection[]): CalculatorFilters {
  return {
    ...DEFAULT_FILTERS,
    ageRange: { ...DEFAULT_FILTERS.ageRange },
    populationGroups: [...DEFAULT_FILTERS.populationGroups],
    drinkingHabits: [...DEFAULT_FILTERS.drinkingHabits],
    heightPreference: {
      ...DEFAULT_FILTERS.heightPreference,
      presetIds: [...DEFAULT_FILTERS.heightPreference.presetIds],
      customRanges: DEFAULT_FILTERS.heightPreference.customRanges.map((range) => ({ ...range }))
    },
    looksPreference: { ...DEFAULT_FILTERS.looksPreference },
    manualAssumptions: defaults.map((assumption) => ({ ...assumption }))
  };
}

function isCompactShareState(value: unknown): value is CompactShareStateV1 {
  return Boolean(
    value &&
      typeof value === "object" &&
      "v" in value &&
      (value as { v?: unknown }).v === SHARE_STATE_VERSION
  );
}

export function decodeShareState(
  payload: string,
  defaults: ManualAssumptionSelection[]
): ShareStateDecodeResult {
  const filters = cloneDefaults(defaults);

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as unknown;

    if (!isCompactShareState(parsed)) {
      return {
        ok: false,
        filters,
        error: "This share link uses an unsupported format."
      };
    }

    if (parsed.g !== undefined) {
      filters.geography = GEO_ORDER[parsed.g] ?? filters.geography;
    }

    if (parsed.a) {
      const [min, max] = parsed.a;
      if (Number.isFinite(min) && Number.isFinite(max)) {
        filters.ageRange = {
          min: Math.max(productConfig.minimumAge, Math.min(min, max)),
          max: Math.min(85, Math.max(min, max))
        };
      }
    }

    if (parsed.s !== undefined) {
      filters.sex = SEX_SHARE_VALUES[parsed.s] ?? filters.sex;
    }

    if (parsed.m !== undefined) {
      filters.maritalStatus = MARITAL_SHARE_VALUES[parsed.m] ?? filters.maritalStatus;
    }

    if (parsed.e !== undefined) {
      filters.education = EDUCATION_SHARE_VALUES[parsed.e] ?? filters.education;
    }

    if (parsed.i !== undefined) {
      filters.income = INCOME_SHARE_VALUES[parsed.i] ?? filters.income;
    }

    if (parsed.l !== undefined) {
      filters.language = LANGUAGE_SHARE_VALUES[parsed.l] ?? filters.language;
    }

    if (parsed.p) {
      filters.populationGroups = parsed.p
        .map((index) => POPULATION_GROUPS[index]?.key)
        .filter((value): value is NonNullable<typeof value> => Boolean(value));
    }

    if (parsed.d) {
      filters.drinkingHabits = parsed.d
        .map((index) => DRINKING_HABITS[index]?.key)
        .filter((value): value is NonNullable<typeof value> => Boolean(value));
    }

    if (parsed.h) {
      filters.heightPreference = {
        displayUnit: parsed.h.u === 1 ? "imperial" : "cm",
        presetIds: parsed.h.p
          ? parsed.h.p
              .map((index) => HEIGHT_PRESETS[index]?.id)
              .filter((value): value is string => Boolean(value))
          : [],
        customRanges: parsed.h.c
          ? parsed.h.c
              .map((entry) => {
                const minCm = entry[0];
                const maxCm = entry[1];
                if (!Number.isFinite(minCm)) {
                  return null;
                }

                return {
                  minCm,
                  maxCm: Number.isFinite(maxCm) ? maxCm : null
                };
              })
              .filter((value): value is { minCm: number; maxCm: number | null } => value !== null)
          : []
      };
    }

    if (parsed.o) {
      const preset = LOOKS_SHARE_VALUES[parsed.o[0]];
      if (preset) {
        filters.looksPreference.preset = preset;
        const customShare = parsed.o[1];
        if (preset === "custom" && typeof customShare === "number" && Number.isFinite(customShare)) {
          filters.looksPreference.customShare = Math.min(1, Math.max(0, customShare / 1000));
        }
      }
    }

    filters.adultOnly = true;

    if (parsed.x?.length) {
      const assumptionMap = new Map(
        parsed.x
          .filter((entry) => !entry[0].startsWith(CUSTOM_MANUAL_ASSUMPTION_PREFIX))
          .map((entry) => [entry[0], entry[1]])
      );
      filters.manualAssumptions = filters.manualAssumptions.map((assumption) => {
        const share = assumptionMap.get(assumption.id);

        return share === undefined
          ? assumption
          : {
              ...assumption,
              enabled: true,
              share: Math.min(1, Math.max(0, share / 1000))
            };
      });

      const customAssumptions = parsed.x
        .filter((entry) => entry[0].startsWith(CUSTOM_MANUAL_ASSUMPTION_PREFIX))
        .slice(0, MAX_CUSTOM_MANUAL_ASSUMPTIONS)
        .map((entry) => {
          const assumption = buildCustomManualAssumption(
            filters.manualAssumptions,
            entry[2] ?? "Custom filter",
            Math.min(1, Math.max(0, entry[1] / 1000))
          );

          if (!assumption) {
            return null;
          }

          assumption.id = entry[0];
          return assumption;
        })
        .filter((value): value is NonNullable<typeof value> => value !== null);

      filters.manualAssumptions = [...filters.manualAssumptions, ...customAssumptions];
    }

    return { ok: true, filters };
  } catch {
    return {
      ok: false,
      filters,
      error: "That share link could not be read. It may be malformed or truncated."
    };
  }
}
