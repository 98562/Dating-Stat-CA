import { DEFAULT_FILTERS } from "@/lib/constants";
import { toBase64Url } from "@/lib/share/codec";
import {
  CompactShareStateV1,
  DRINKING_HABIT_INDEX,
  EDUCATION_SHARE_VALUES,
  GEOGRAPHY_INDEX,
  HEIGHT_PRESET_INDEX,
  INCOME_SHARE_VALUES,
  LANGUAGE_SHARE_VALUES,
  LOOKS_SHARE_VALUES,
  MARITAL_SHARE_VALUES,
  POPULATION_GROUP_INDEX,
  SEX_SHARE_VALUES,
  SHARE_STATE_VERSION
} from "@/lib/share/schema";
import type { CalculatorFilters } from "@/lib/types";

export function encodeShareState(filters: CalculatorFilters) {
  const state: CompactShareStateV1 = {
    v: SHARE_STATE_VERSION
  };

  if (filters.geography !== DEFAULT_FILTERS.geography) {
    state.g = GEOGRAPHY_INDEX.get(filters.geography);
  }

  if (
    filters.ageRange.min !== DEFAULT_FILTERS.ageRange.min ||
    filters.ageRange.max !== DEFAULT_FILTERS.ageRange.max
  ) {
    state.a = [filters.ageRange.min, filters.ageRange.max];
  }

  if (filters.sex !== DEFAULT_FILTERS.sex) {
    state.s = SEX_SHARE_VALUES.indexOf(filters.sex);
  }

  if (filters.maritalStatus !== DEFAULT_FILTERS.maritalStatus) {
    state.m = MARITAL_SHARE_VALUES.indexOf(filters.maritalStatus);
  }

  if (filters.education !== DEFAULT_FILTERS.education) {
    state.e = EDUCATION_SHARE_VALUES.indexOf(filters.education);
  }

  if (filters.income !== DEFAULT_FILTERS.income) {
    state.i = INCOME_SHARE_VALUES.indexOf(filters.income);
  }

  if (filters.language !== DEFAULT_FILTERS.language) {
    state.l = LANGUAGE_SHARE_VALUES.indexOf(filters.language);
  }

  if (filters.populationGroups.length) {
    state.p = filters.populationGroups
      .map((group) => POPULATION_GROUP_INDEX.get(group))
      .filter((value): value is number => value !== undefined);
  }

  if (filters.drinkingHabits.length) {
    state.d = filters.drinkingHabits
      .map((habit) => DRINKING_HABIT_INDEX.get(habit))
      .filter((value): value is number => value !== undefined);
  }

  if (
    filters.heightPreference.displayUnit !== DEFAULT_FILTERS.heightPreference.displayUnit ||
    filters.heightPreference.presetIds.length ||
    filters.heightPreference.customRanges.length
  ) {
    state.h = {};

    if (filters.heightPreference.displayUnit === "imperial") {
      state.h.u = 1;
    }

    if (filters.heightPreference.presetIds.length) {
      state.h.p = filters.heightPreference.presetIds
        .map((presetId) => HEIGHT_PRESET_INDEX.get(presetId))
        .filter((value): value is number => value !== undefined);
    }

    if (filters.heightPreference.customRanges.length) {
      state.h.c = filters.heightPreference.customRanges.map((range) =>
        range.maxCm === null ? [range.minCm] : [range.minCm, range.maxCm]
      );
    }
  }

  if (
    filters.looksPreference.preset !== DEFAULT_FILTERS.looksPreference.preset ||
    filters.looksPreference.customShare !== DEFAULT_FILTERS.looksPreference.customShare
  ) {
    const presetIndex = LOOKS_SHARE_VALUES.indexOf(filters.looksPreference.preset);
    state.o =
      filters.looksPreference.preset === "custom"
        ? [presetIndex, Math.round(filters.looksPreference.customShare * 1000)]
        : [presetIndex];
  }

  const activeAssumptions = filters.manualAssumptions
    .filter((assumption) => assumption.enabled)
    .map((assumption) =>
      assumption.isCustom
        ? ([assumption.id, Math.round(assumption.share * 1000), assumption.label] as [
            string,
            number,
            string
          ])
        : ([assumption.id, Math.round(assumption.share * 1000)] as [string, number])
    );

  if (activeAssumptions.length) {
    state.x = activeAssumptions;
  }

  return toBase64Url(JSON.stringify(state));
}
