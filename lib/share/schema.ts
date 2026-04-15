import { DRINKING_HABITS } from "@/config/filters/drinking";
import { POPULATION_GROUPS } from "@/config/filters/ethnicity";
import { HEIGHT_PRESETS } from "@/config/filters/height";
import { LOOKS_PRESETS } from "@/config/filters/looks";
import { GEO_ORDER } from "@/lib/constants";
import type {
  EducationFilterKey,
  GeographyKey,
  IncomeFilterKey,
  LanguageFilterKey,
  LooksPresetKey,
  MaritalFilterKey,
  SexKey
} from "@/lib/types";

export const SHARE_STATE_VERSION = 1;

export const SEX_SHARE_VALUES: SexKey[] = ["all", "men", "women"];
export const MARITAL_SHARE_VALUES: MaritalFilterKey[] = [
  "all",
  "not_married_not_common_law",
  "never_married",
  "separated_divorced",
  "widowed"
];
export const EDUCATION_SHARE_VALUES: EducationFilterKey[] = [
  "all",
  "high_school_or_less",
  "college_trades",
  "bachelors_plus",
  "masters_plus",
  "professional_degree",
  "doctorate"
];
export const INCOME_SHARE_VALUES: IncomeFilterKey[] = [
  "all",
  "50k_plus",
  "80k_plus",
  "100k_plus",
  "150k_plus"
];
export const LANGUAGE_SHARE_VALUES: LanguageFilterKey[] = [
  "all",
  "english",
  "french",
  "bilingual"
];
export const LOOKS_SHARE_VALUES: LooksPresetKey[] = [
  "any",
  ...LOOKS_PRESETS.map((preset) => preset.id),
  "custom"
] as LooksPresetKey[];

export const GEOGRAPHY_INDEX = new Map<GeographyKey, number>(
  GEO_ORDER.map((value, index) => [value, index])
);
export const POPULATION_GROUP_INDEX = new Map(
  POPULATION_GROUPS.map((group, index) => [group.key, index])
);
export const DRINKING_HABIT_INDEX = new Map(
  DRINKING_HABITS.map((habit, index) => [habit.key, index])
);
export const HEIGHT_PRESET_INDEX = new Map(
  HEIGHT_PRESETS.map((preset, index) => [preset.id, index])
);

export interface CompactShareStateV1 {
  v: 1;
  g?: number;
  a?: [number, number];
  s?: number;
  m?: number;
  e?: number;
  i?: number;
  l?: number;
  p?: number[];
  d?: number[];
  h?: {
    u?: 1;
    p?: number[];
    c?: Array<[number, number?]>;
  };
  o?: [number, number?];
  t?: 0;
  x?: Array<[string, number, string?]>;
}
