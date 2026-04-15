export type SourceType = "observed" | "estimated" | "assumption";

export type GeographyKey =
  | "canada"
  | "nl"
  | "pe"
  | "ns"
  | "nb"
  | "qc"
  | "on"
  | "mb"
  | "sk"
  | "ab"
  | "bc"
  | "yt"
  | "nt"
  | "nu";

export type SexKey = "all" | "men" | "women";

export type MaritalFilterKey =
  | "all"
  | "not_married_not_common_law"
  | "never_married"
  | "separated_divorced"
  | "widowed";

export type EducationFilterKey =
  | "all"
  | "high_school_or_less"
  | "college_trades"
  | "bachelors_plus"
  | "masters_plus"
  | "professional_degree"
  | "doctorate";

export type IncomeFilterKey =
  | "all"
  | "50k_plus"
  | "80k_plus"
  | "100k_plus"
  | "150k_plus";

export type LanguageFilterKey =
  | "all"
  | "english"
  | "french"
  | "bilingual";

export type PopulationGroupKey =
  | "south_asian"
  | "chinese"
  | "black"
  | "filipino"
  | "arab"
  | "latin_american"
  | "southeast_asian"
  | "west_asian"
  | "korean"
  | "japanese"
  | "visible_minority_nie"
  | "multiple_visible_minorities"
  | "not_a_visible_minority";

export type DrinkingHabitKey =
  | "no_past_week_drinks"
  | "one_to_two_weekly_drinks"
  | "three_to_six_weekly_drinks"
  | "seven_plus_weekly_drinks"
  | "avoids_heavy_drinking";

export type DrinkingRiskBucket =
  | "no_risk"
  | "low_risk"
  | "moderate_risk"
  | "high_risk";

export type DrinkingDistribution = Record<DrinkingRiskBucket, number>;

export interface HeightRangeSelection {
  minCm: number;
  maxCm: number | null;
}

export type HeightDisplayUnit = "cm" | "imperial";

export interface HeightPreference {
  presetIds: string[];
  customRanges: HeightRangeSelection[];
  displayUnit: HeightDisplayUnit;
}

export type LooksPresetKey =
  | "any"
  | "broad"
  | "selective"
  | "very_selective"
  | "extremely_selective"
  | "custom";

export interface LooksPreference {
  preset: LooksPresetKey;
  customShare: number;
}

export type FilterDimension =
  | "geography"
  | "age"
  | "sex"
  | "maritalStatus"
  | "education"
  | "income"
  | "language"
  | "populationGroup"
  | "drinking"
  | "height"
  | "looks";

export type StrictnessLevel =
  | "broad"
  | "selective"
  | "quite_selective"
  | "narrow"
  | "very_narrow";

export interface Citation {
  id: string;
  title: string;
  url: string;
  yearLabel: string;
  note: string;
  tableId?: string;
}

export interface PopulationEstimate {
  label: string;
  population: number;
}

export interface ComparisonPlace {
  label: string;
  population: number;
  source: string;
}

export interface ManualAssumptionDefinition {
  id: string;
  label: string;
  description: string;
  defaultShare: number;
}

export interface ManualAssumptionSelection extends ManualAssumptionDefinition {
  enabled: boolean;
  share: number;
  isCustom?: boolean;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface CalculatorFilters {
  geography: GeographyKey;
  ageRange: AgeRange;
  sex: SexKey;
  maritalStatus: MaritalFilterKey;
  education: EducationFilterKey;
  income: IncomeFilterKey;
  language: LanguageFilterKey;
  populationGroups: PopulationGroupKey[];
  drinkingHabits: DrinkingHabitKey[];
  heightPreference: HeightPreference;
  looksPreference: LooksPreference;
  adultOnly: boolean;
  manualAssumptions: ManualAssumptionSelection[];
}

export interface AgeBucket {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export interface CountBucket {
  label: string;
  count: number;
}

export interface DatasetSourceCatalog {
  population: Citation;
  marital: Citation;
  education: Citation;
  income: Citation;
  language: Citation;
  ethnicity: Citation;
  drinking: Citation;
  height: Citation;
  manual: Citation;
}

export interface NormalizedDataset {
  generatedLabel: string;
  populationEstimates: Record<GeographyKey, PopulationEstimate>;
  ageBuckets: AgeBucket[];
  comparisonPlaces: ComparisonPlace[];
  manualAssumptions: ManualAssumptionDefinition[];
  sources: DatasetSourceCatalog;
  maritalAgeGender: Record<
    GeographyKey,
    Record<SexKey, Record<string, Record<string, number>>>
  >;
  educationAgeGender: Record<
    GeographyKey,
    Record<SexKey, Record<string, Record<string, number>>>
  >;
  incomeAgeGender: Record<
    GeographyKey,
    Record<SexKey, Record<string, Record<string, number>>>
  >;
  ethnicityAgeGender: Record<
    GeographyKey,
    Record<SexKey, Record<string, Record<PopulationGroupKey, number> & { total: number }>>
  >;
  drinkingRisk: {
    canada: DrinkingDistribution;
    geography: Partial<Record<GeographyKey, DrinkingDistribution>>;
    sex: Record<SexKey, DrinkingDistribution>;
    age: Record<string, DrinkingDistribution>;
  };
  languageAge: Record<
    GeographyKey,
    Record<string, Record<string, number>>
  >;
}

export interface CalculationStep {
  id: string;
  label: string;
  filterValue: string;
  sourceType: SourceType;
  citation: Citation;
  denominator: number;
  share: number;
  numeratorShare?: number;
  priorPopulation: number;
  remainingPopulation: number;
  explanation: string;
  note?: string;
  derivation?: string;
  confidenceLevel?: "high" | "medium" | "low";
  selectedValues?: string[];
  conditioningUsed: FilterDimension[];
  omittedConditioning: FilterDimension[];
}

export interface CalculationResult {
  relevantPopulation: number;
  finalPopulation: number;
  oneInX: number | null;
  strictness: StrictnessLevel;
  steps: CalculationStep[];
  quality: SourceType;
  explanation: string;
  comparison: {
    place: ComparisonPlace;
    ratio: number;
  } | null;
}
