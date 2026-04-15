import {
  DRINKING_AGE_BANDS,
  DRINKING_FILTER_LABEL,
  DRINKING_FILTER_NOTE,
  DRINKING_HABIT_OPTIONS
} from "@/config/filters/drinking";
import { ETHNICITY_AGE_BANDS } from "@/config/filters/ethnicity";
import { HEIGHT_PERCENTILE_MODELS, HEIGHT_PRESET_MAP, type HeightPercentileModel } from "@/config/filters/height";
import { LOOKS_FILTER_LABEL, LOOKS_PRESET_MAP } from "@/config/filters/looks";
import { applyAssumptionShareStep } from "@/lib/calculation/steps/applyAssumptionShareStep";
import { applyEstimatedCategoricalUnionStep } from "@/lib/calculation/steps/applyEstimatedCategoricalUnionStep";
import { applyEstimatedRangeUnionStep } from "@/lib/calculation/steps/applyEstimatedRangeUnionStep";
import { applyObservedCategoricalUnionStep } from "@/lib/calculation/steps/applyObservedCategoricalUnionStep";
import { normalizeRanges } from "@/lib/calculation/utils/normalizeRanges";
import {
  formatDrinkingSelection,
  formatHeightSelection,
  formatLooksSelection,
  formatPopulationGroupSelection
} from "@/lib/format";
import { getStrictnessLevel } from "@/lib/strictness";
import type {
  AgeBucket,
  CalculationResult,
  CalculationStep,
  CalculatorFilters,
  ComparisonPlace,
  DrinkingRiskBucket,
  FilterDimension,
  GeographyKey,
  MaritalFilterKey,
  NormalizedDataset,
  PopulationGroupKey,
  SexKey,
  SourceType
} from "@/lib/types";

interface PublishedAgeBand {
  key: string;
  min: number;
  max: number | null;
}

const AGE_DIMENSIONS: FilterDimension[] = ["geography"];
const SEX_DIMENSIONS: FilterDimension[] = ["geography", "age"];
const POPULATION_GROUP_DIMENSIONS: FilterDimension[] = ["geography", "age", "sex"];
const MARITAL_DIMENSIONS: FilterDimension[] = ["geography", "age", "sex"];
const EDUCATION_DIMENSIONS: FilterDimension[] = ["geography", "age", "sex"];
const INCOME_DIMENSIONS: FilterDimension[] = ["geography", "age", "sex"];
const LANGUAGE_DIMENSIONS: FilterDimension[] = ["geography", "age"];
const DRINKING_DIMENSIONS: FilterDimension[] = ["geography", "age", "sex"];
const HEIGHT_DIMENSIONS: FilterDimension[] = ["age", "sex"];

const EDUCATION_AGE_BANDS: PublishedAgeBand[] = [
  { key: "15 to 24 years", min: 15, max: 24 },
  { key: "25 to 34 years", min: 25, max: 34 },
  { key: "35 to 44 years", min: 35, max: 44 },
  { key: "45 to 54 years", min: 45, max: 54 },
  { key: "55 to 64 years", min: 55, max: 64 },
  { key: "65 to 74 years", min: 65, max: 74 },
  { key: "75 years and over", min: 75, max: null }
];

const LANGUAGE_AGE_BANDS: PublishedAgeBand[] = [
  { key: "15 to 19 years", min: 15, max: 19 },
  { key: "20 to 24 years", min: 20, max: 24 },
  { key: "25 to 44 years", min: 25, max: 44 },
  { key: "45 to 64 years", min: 45, max: 64 },
  { key: "65 to 74 years", min: 65, max: 74 },
  { key: "75 years and over", min: 75, max: null }
];

function roundPopulation(value: number) {
  return Math.max(0, value);
}

function ageBucketOverlap(bucket: AgeBucket, min: number, max: number) {
  const bucketMax = bucket.max ?? 100;
  const overlap = Math.max(0, Math.min(bucketMax, max) - Math.max(bucket.min, min) + 1);
  const width = bucket.max === null ? 16 : bucketMax - bucket.min + 1;
  return overlap / width;
}

function publishedBandOverlap(band: PublishedAgeBand, min: number, max: number) {
  const bandMax = band.max ?? 100;
  return Math.max(0, Math.min(bandMax, max) - Math.max(band.min, min) + 1);
}

function publishedBandWidth(band: PublishedAgeBand) {
  const bandMax = band.max ?? 100;
  return bandMax - band.min + 1;
}

function publishedBandShare(band: PublishedAgeBand, min: number, max: number) {
  return publishedBandOverlap(band, min, max) / publishedBandWidth(band);
}

function isWholeBucketSelection(dataset: NormalizedDataset, min: number, max: number) {
  return dataset.ageBuckets.every((bucket) => {
    const overlap = ageBucketOverlap(bucket, min, max);
    return overlap === 0 || overlap === 1;
  });
}

function sumAgeCounts(
  ageMap: Record<string, number>,
  dataset: NormalizedDataset,
  min: number,
  max: number
) {
  let total = 0;

  for (const bucket of dataset.ageBuckets) {
    const overlap = ageBucketOverlap(bucket, min, max);
    total += (ageMap[bucket.id] ?? 0) * overlap;
  }

  return total;
}

function classifyStep(
  supported: FilterDimension[],
  prior: FilterDimension[],
  ageExact: boolean
) {
  const omittedConditioning = prior.filter((dimension) => !supported.includes(dimension));

  let sourceType: SourceType = omittedConditioning.length > 0 ? "estimated" : "observed";
  if (!ageExact) sourceType = "estimated";

  return {
    sourceType,
    omittedConditioning,
    conditioningUsed: prior.filter((dimension) => supported.includes(dimension))
  };
}

function getMaritalLabel(filter: MaritalFilterKey) {
  switch (filter) {
    case "not_married_not_common_law":
      return "Not married / not common-law";
    case "never_married":
      return "Never married";
    case "separated_divorced":
      return "Separated or divorced";
    case "widowed":
      return "Widowed";
    default:
      return "All legal relationship statuses";
  }
}

function getSexLabel(sex: SexKey) {
  if (sex === "men") return "Men+";
  if (sex === "women") return "Women+";
  return "All available categories";
}

function getAgeBandSelection(
  range: CalculatorFilters["ageRange"],
  bands: readonly PublishedAgeBand[]
) {
  const selectedBands = bands.filter(
    (band) => publishedBandOverlap(band, range.min, range.max) > 0
  );

  const exact =
    selectedBands.length > 0 &&
    selectedBands.every(
      (band) => publishedBandOverlap(band, range.min, range.max) === publishedBandWidth(band)
    );

  return {
    bands: selectedBands,
    exact
  };
}

function getAgeWeightMap(
  dataset: NormalizedDataset,
  geo: GeographyKey,
  sex: SexKey,
  range: CalculatorFilters["ageRange"],
  bands: readonly PublishedAgeBand[]
) {
  const ageMap = dataset.maritalAgeGender[geo][sex]["Total - Marital status"];
  const totalSelected = sumAgeCounts(ageMap, dataset, range.min, range.max);

  return bands.map((band) => {
    const inBand = sumAgeCounts(
      ageMap,
      dataset,
      Math.max(range.min, band.min),
      Math.min(range.max, band.max ?? 100)
    );

    return {
      key: band.key,
      weight: totalSelected === 0 ? 0 : inBand / totalSelected
    };
  });
}

function getWeightedShare(
  weights: Array<{ key: string; weight: number }>,
  buckets: Record<string, Record<string, number>>,
  bucketKey: string
) {
  let share = 0;

  for (const band of weights) {
    const bucket = buckets[band.key];
    if (!bucket || bucket.total === 0 || band.weight === 0) {
      continue;
    }

    share += band.weight * ((bucket[bucketKey] ?? 0) / bucket.total);
  }

  return share;
}

function inverseStandardNormal(probability: number) {
  // Acklam-style rational approximation, sufficient for a percentile-backed estimate.
  const p = Math.min(1 - 1e-12, Math.max(1e-12, probability));
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;

  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  if (p > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  const q = p - 0.5;
  const r = q * q;
  return (
    (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

function erf(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-x * x);

  return sign * y;
}

function estimateHeightDistribution(model: HeightPercentileModel) {
  const percentileMap = new Map(
    model.percentiles.map((item) => [item.percentile, item.valueCm])
  );
  const median = percentileMap.get(50) ?? model.percentiles[Math.floor(model.percentiles.length / 2)]?.valueCm ?? 170;
  const sigmaCandidates: number[] = [];
  const percentilePairs: Array<[number, number]> = [
    [25, 75],
    [10, 90],
    [5, 95]
  ];

  for (const [lowerPercentile, upperPercentile] of percentilePairs) {
    const lower = percentileMap.get(lowerPercentile);
    const upper = percentileMap.get(upperPercentile);
    if (lower === undefined || upper === undefined || upper <= lower) continue;

    const zLower = inverseStandardNormal(lowerPercentile / 100);
    const zUpper = inverseStandardNormal(upperPercentile / 100);
    const sigma = (upper - lower) / (zUpper - zLower);
    if (Number.isFinite(sigma) && sigma > 0) {
      sigmaCandidates.push(sigma);
    }
  }

  const sigma =
    sigmaCandidates.length > 0
      ? sigmaCandidates.reduce((sum, value) => sum + value, 0) / sigmaCandidates.length
      : 6.5;

  return {
    mean: median,
    sigma
  };
}

function estimateHeightCdf(cm: number, model: HeightPercentileModel) {
  const distribution = estimateHeightDistribution(model);
  const z = (cm - distribution.mean) / (distribution.sigma * Math.SQRT2);
  return Math.min(1, Math.max(0, 0.5 * (1 + erf(z))));
}

function estimateRangeShare(
  range: { minCm: number; maxCm: number | null },
  model: HeightPercentileModel
) {
  const lower = estimateHeightCdf(range.minCm, model);
  const upper = range.maxCm === null ? 1 : estimateHeightCdf(range.maxCm, model);
  return Math.max(0, upper - lower);
}

function getHeightShare(
  dataset: NormalizedDataset,
  filters: CalculatorFilters,
  geo: GeographyKey,
  sex: SexKey
) {
  const normalizedRanges = normalizeRanges([
    ...filters.heightPreference.presetIds
      .map((presetId) => HEIGHT_PRESET_MAP[presetId]?.range)
      .filter((range): range is { minCm: number; maxCm: number | null } => Boolean(range)),
    ...filters.heightPreference.customRanges
  ]);

  if (!normalizedRanges.length) {
    return {
      share: 1,
      normalizedRanges
    };
  }

  const models = HEIGHT_PERCENTILE_MODELS[sex];
  const weights = getAgeWeightMap(
    dataset,
    geo,
    sex,
    filters.ageRange,
    models.map((model) => ({
      key: model.ageBand,
      min: model.min,
      max: model.max
    }))
  );

  let share = 0;
  for (const weight of weights) {
    if (weight.weight === 0) continue;

    const model = models.find((item) => item.ageBand === weight.key);
    if (!model) continue;

    const bandShare = normalizedRanges.reduce(
      (sum, range) => sum + estimateRangeShare(range, model),
      0
    );
    share += weight.weight * Math.min(1, bandShare);
  }

  return {
    share: Math.min(1, share),
    normalizedRanges
  };
}

function getLooksShare(filters: CalculatorFilters) {
  if (filters.looksPreference.preset === "any") return null;
  if (filters.looksPreference.preset === "custom") {
    return Math.min(1, Math.max(0, filters.looksPreference.customShare));
  }

  return LOOKS_PRESET_MAP[filters.looksPreference.preset]?.share ?? null;
}

function getEducationLabel(key: CalculatorFilters["education"]) {
  switch (key) {
    case "high_school_or_less":
      return "High school or less";
    case "college_trades":
      return "College / trades / below-bachelor certificates";
    case "bachelors_plus":
      return "Bachelor's degree or higher";
    case "masters_plus":
      return "Master's or higher";
    case "professional_degree":
      return "Professional degree";
    case "doctorate":
      return "Doctorate";
    default:
      return "All education levels";
  }
}

function getIncomeLabel(key: CalculatorFilters["income"]) {
  switch (key) {
    case "50k_plus":
      return "Income over $50,000";
    case "80k_plus":
      return "Income over $80,000";
    case "100k_plus":
      return "Income over $100,000";
    case "150k_plus":
      return "Income over $150,000";
    default:
      return "All income bands";
  }
}

function getLanguageLabel(key: CalculatorFilters["language"]) {
  switch (key) {
    case "english":
      return "Can speak English";
    case "french":
      return "Can speak French";
    case "bilingual":
      return "English and French";
    default:
      return "All official-language profiles";
  }
}

function normalizeDrinkingDistribution(distribution: Record<DrinkingRiskBucket, number>) {
  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return {
      no_risk: 0,
      low_risk: 0,
      moderate_risk: 0,
      high_risk: 0
    } satisfies Record<DrinkingRiskBucket, number>;
  }

  return {
    no_risk: distribution.no_risk / total,
    low_risk: distribution.low_risk / total,
    moderate_risk: distribution.moderate_risk / total,
    high_risk: distribution.high_risk / total
  } satisfies Record<DrinkingRiskBucket, number>;
}

function getWeightedDrinkingAgeDistribution(filters: CalculatorFilters, dataset: NormalizedDataset) {
  const eligibleMin = Math.max(18, filters.ageRange.min);
  const eligibleMax = filters.ageRange.max;

  if (eligibleMax < 18) {
    return null;
  }

  const selectedBands = DRINKING_AGE_BANDS.filter(
    (band) => publishedBandOverlap(band, eligibleMin, eligibleMax) > 0
  );

  if (!selectedBands.length) {
    return null;
  }

  const widths = selectedBands.map((band) => publishedBandOverlap(band, eligibleMin, eligibleMax));
  const totalWidth = widths.reduce((sum, value) => sum + value, 0);

  if (totalWidth <= 0) {
    return null;
  }

  const distribution = {
    no_risk: 0,
    low_risk: 0,
    moderate_risk: 0,
    high_risk: 0
  } satisfies Record<DrinkingRiskBucket, number>;

  selectedBands.forEach((band, index) => {
    const weight = widths[index] / totalWidth;
    const ageDistribution = dataset.drinkingRisk.age[band.key];
    if (!ageDistribution) return;

    distribution.no_risk += ageDistribution.no_risk * weight;
    distribution.low_risk += ageDistribution.low_risk * weight;
    distribution.moderate_risk += ageDistribution.moderate_risk * weight;
    distribution.high_risk += ageDistribution.high_risk * weight;
  });

  return normalizeDrinkingDistribution(distribution);
}

function getDrinkingShare(dataset: NormalizedDataset, filters: CalculatorFilters, geo: GeographyKey) {
  if (!filters.drinkingHabits.length) {
    return null;
  }

  const geographyDistribution =
    dataset.drinkingRisk.geography[geo] ?? dataset.drinkingRisk.canada;
  const canadaDistribution = dataset.drinkingRisk.canada;
  const sexDistribution = dataset.drinkingRisk.sex[filters.sex === "all" ? "all" : filters.sex];
  const ageDistribution = getWeightedDrinkingAgeDistribution(filters, dataset);

  if (!sexDistribution || !ageDistribution) {
    return {
      share: 0,
      selectedBuckets: [] as DrinkingRiskBucket[],
      note:
        "This survey source covers adults aged 18 and older, so a selection entirely below 18 cannot be modeled here.",
      derivation:
        "No overlapping adult survey age band was available for the selected drinking-habits filter."
    };
  }

  const base = geographyDistribution;
  const adjusted = {
    no_risk:
      base.no_risk *
      (sexDistribution.no_risk / canadaDistribution.no_risk) *
      (ageDistribution.no_risk / canadaDistribution.no_risk),
    low_risk:
      base.low_risk *
      (sexDistribution.low_risk / canadaDistribution.low_risk) *
      (ageDistribution.low_risk / canadaDistribution.low_risk),
    moderate_risk:
      base.moderate_risk *
      (sexDistribution.moderate_risk / canadaDistribution.moderate_risk) *
      (ageDistribution.moderate_risk / canadaDistribution.moderate_risk),
    high_risk:
      base.high_risk *
      (sexDistribution.high_risk / canadaDistribution.high_risk) *
      (ageDistribution.high_risk / canadaDistribution.high_risk)
  } satisfies Record<DrinkingRiskBucket, number>;

  const normalized = normalizeDrinkingDistribution(adjusted);
  const selectedBuckets = Array.from(
    new Set(
      filters.drinkingHabits.flatMap((habit) => DRINKING_HABIT_OPTIONS[habit]?.sourceBuckets ?? [])
    )
  ) as DrinkingRiskBucket[];

  const share = selectedBuckets.reduce((sum, bucket) => sum + normalized[bucket], 0);
  const territoryFallback =
    geo === "yt" || geo === "nt" || geo === "nu"
      ? "Territories fall back to the Canada-wide survey distribution because this source only publishes Canada and provincial totals."
      : null;

  return {
    share: Math.min(1, Math.max(0, share)),
    selectedBuckets,
    note:
      territoryFallback ??
      "This filter uses self-reported alcohol-use survey data. Self-reported drinking can understate actual consumption.",
    derivation:
      "Province totals are adjusted with Canada-wide age and sex patterns because the public survey table does not publish a full province-by-age-by-sex cross-tab."
  };
}

function getComparison(
  places: ComparisonPlace[],
  population: number
): CalculationResult["comparison"] {
  if (population <= 0) return null;

  let closest = places[0] ?? null;
  let distance = Number.POSITIVE_INFINITY;

  for (const place of places) {
    const currentDistance = Math.abs(place.population - population);
    if (currentDistance < distance) {
      distance = currentDistance;
      closest = place;
    }
  }

  if (!closest) return null;

  return {
    place: closest,
    ratio: population / closest.population
  };
}

function buildOverallExplanation(steps: CalculationStep[]) {
  const estimatedCount = steps.filter((step) => step.sourceType === "estimated").length;
  const assumptionCount = steps.filter((step) => step.sourceType === "assumption").length;

  if (assumptionCount > 0) {
    return "Some parts come from data, some from approximation, and some from choices you supplied yourself. The app labels each one rather than pretending they are all equally solid.";
  }

  if (estimatedCount > 0) {
    return "This result blends direct Canadian data with reasonable estimation where the public tables run out. Useful for perspective, not absolute precision.";
  }

  return "This result stays unusually close to directly published Canadian data, at least by the standards of this tool.";
}

export function calculateProbability(
  dataset: NormalizedDataset,
  filters: CalculatorFilters
): CalculationResult {
  const geo = filters.geography as GeographyKey;
  const startingPopulation = dataset.populationEstimates[geo].population;
  const steps: CalculationStep[] = [];
  let currentPopulation = startingPopulation;
  const appliedDimensions: FilterDimension[] = ["geography"];

  const ageExact = isWholeBucketSelection(dataset, filters.ageRange.min, filters.ageRange.max);
  const totalAgeMap = dataset.maritalAgeGender[geo].all["Total - Marital status"];
  const ageCount = sumAgeCounts(totalAgeMap, dataset, filters.ageRange.min, filters.ageRange.max);
  const total15Plus = Object.values(totalAgeMap).reduce((sum, value) => sum + value, 0);
  const ageShare = total15Plus === 0 ? 0 : ageCount / total15Plus;
  const ageClassification = classifyStep(AGE_DIMENSIONS, appliedDimensions, ageExact);

  steps.push({
    id: "age",
    label: "Age",
    filterValue: `${filters.ageRange.min}-${filters.ageRange.max}`,
    sourceType: ageClassification.sourceType,
    citation: dataset.sources.marital,
    denominator: startingPopulation,
    share: ageShare,
    priorPopulation: startingPopulation,
    remainingPopulation: roundPopulation(startingPopulation * ageShare),
    explanation:
      ageClassification.sourceType === "observed"
        ? "Age share comes directly from the 2021 Census age-by-gender marital-status table, rebased to the latest 2026 population estimate."
        : "Age share uses published age buckets from the 2021 Census and interpolates partial age bins when your selected range cuts through a published bracket.",
    conditioningUsed: ageClassification.conditioningUsed,
    omittedConditioning: ageClassification.omittedConditioning
  });

  currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
  appliedDimensions.push("age");

  if (filters.sex !== "all") {
    const sexAgeMap = dataset.maritalAgeGender[geo][filters.sex]["Total - Marital status"];
    const sexCount = sumAgeCounts(sexAgeMap, dataset, filters.ageRange.min, filters.ageRange.max);
    const totalCount = sumAgeCounts(totalAgeMap, dataset, filters.ageRange.min, filters.ageRange.max);
    const sexShare = totalCount === 0 ? 0 : sexCount / totalCount;
    const sexClassification = classifyStep(SEX_DIMENSIONS, appliedDimensions, ageExact);

    steps.push({
      id: "sex",
      label: "Sex / gender category",
      filterValue: getSexLabel(filters.sex),
      sourceType: sexClassification.sourceType,
      citation: dataset.sources.marital,
      denominator: currentPopulation,
      share: sexShare,
      priorPopulation: currentPopulation,
      remainingPopulation: roundPopulation(currentPopulation * sexShare),
      explanation:
        sexClassification.sourceType === "observed"
          ? "This share is observed directly within the selected age range and geography using the 2021 Census table."
          : "This share is estimated because the selected age range requires partial-bin interpolation.",
      conditioningUsed: sexClassification.conditioningUsed,
      omittedConditioning: sexClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("sex");
  }

  if (filters.populationGroups.length) {
    const genderKey = filters.sex === "all" ? "all" : filters.sex;
    const ethnicitySelection = getAgeBandSelection(filters.ageRange, ETHNICITY_AGE_BANDS);
    const ethnicityClassification = classifyStep(
      POPULATION_GROUP_DIMENSIONS,
      appliedDimensions,
      ethnicitySelection.exact
    );
    const countsByValue = {} as Record<PopulationGroupKey, number>;
    let denominatorCount = 0;

    for (const group of filters.populationGroups) {
      countsByValue[group] = 0;
    }

    for (const band of ethnicitySelection.bands) {
      const overlapShare = publishedBandShare(
        band,
        filters.ageRange.min,
        filters.ageRange.max
      );
      const bucket = dataset.ethnicityAgeGender[geo][genderKey][band.key];
      denominatorCount += (bucket?.total ?? 0) * overlapShare;

      for (const group of filters.populationGroups) {
        countsByValue[group] += (bucket?.[group] ?? 0) * overlapShare;
      }
    }

    const ethnicityStep = applyObservedCategoricalUnionStep({
      id: "population_group",
      label: "Population group",
      selectedValues: filters.populationGroups,
      selectedLabels: formatPopulationGroupSelection(filters.populationGroups).split(", "),
      countsByValue,
      denominatorCount,
      currentPopulation,
      sourceType: ethnicityClassification.sourceType,
      citation: dataset.sources.ethnicity,
      explanation:
        ethnicityClassification.sourceType === "observed"
          ? "Observed directly from the official 2021 Census population-group table. Multi-select uses match-any-selected-category logic."
          : "Estimated by summing the selected official population-group categories across the nearest age bands. Partial age-band cuts require interpolation.",
      note:
        "These categories follow the official source variable. Selecting more than one category means match any selected category.",
      derivation:
        ethnicityClassification.sourceType === "observed"
          ? "Union of mutually exclusive official categories."
          : "Union of official categories with partial age-band interpolation.",
      confidenceLevel: ethnicityClassification.sourceType === "observed" ? "high" : "medium"
    });

    steps.push({
      ...ethnicityStep,
      conditioningUsed: ethnicityClassification.conditioningUsed,
      omittedConditioning: ethnicityClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("populationGroup");
  }

  if (filters.maritalStatus !== "all") {
    const genderKey = filters.sex === "all" ? "all" : filters.sex;
    const maritalMap = dataset.maritalAgeGender[geo][genderKey];
    const numeratorKey =
      filters.maritalStatus === "not_married_not_common_law"
        ? "Not married and not living common-law"
        : filters.maritalStatus === "never_married"
          ? "Not married and not living common law - Never married"
          : filters.maritalStatus === "widowed"
            ? "Not married and not living common law - Widowed"
            : "Total - Marital status";

    let numerator = 0;

    if (filters.maritalStatus === "separated_divorced") {
      numerator =
        sumAgeCounts(
          maritalMap["Not married and not living common law - Separated"],
          dataset,
          filters.ageRange.min,
          filters.ageRange.max
        ) +
        sumAgeCounts(
          maritalMap["Not married and not living common law - Divorced"],
          dataset,
          filters.ageRange.min,
          filters.ageRange.max
        );
    } else {
      numerator = sumAgeCounts(
        maritalMap[numeratorKey],
        dataset,
        filters.ageRange.min,
        filters.ageRange.max
      );
    }

    const denominator = sumAgeCounts(
      maritalMap["Total - Marital status"],
      dataset,
      filters.ageRange.min,
      filters.ageRange.max
    );

    const maritalShare = denominator === 0 ? 0 : numerator / denominator;
    const maritalClassification = classifyStep(MARITAL_DIMENSIONS, appliedDimensions, ageExact);

    steps.push({
      id: "marital",
      label: "Relationship availability proxy",
      filterValue: getMaritalLabel(filters.maritalStatus),
      sourceType: maritalClassification.sourceType,
      citation: dataset.sources.marital,
      denominator: currentPopulation,
      share: maritalShare,
      priorPopulation: currentPopulation,
      remainingPopulation: roundPopulation(currentPopulation * maritalShare),
      explanation:
        maritalClassification.sourceType === "observed"
          ? "Observed directly from the census marital-status cross-tab for the selected geography, age, and sex category."
          : "Estimated from the same marital-status table, with partial age-bin interpolation applied where needed.",
      conditioningUsed: maritalClassification.conditioningUsed,
      omittedConditioning: maritalClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("maritalStatus");
  }

  if (filters.education !== "all") {
    const genderKey = filters.sex === "all" ? "all" : filters.sex;
    const educationAgeSelection = getAgeBandSelection(filters.ageRange, EDUCATION_AGE_BANDS);
    const educationWeights = getAgeWeightMap(
      dataset,
      geo,
      genderKey,
      filters.ageRange,
      educationAgeSelection.bands
    );
    const educationShare = getWeightedShare(
      educationWeights,
      dataset.educationAgeGender[geo][genderKey],
      filters.education
    );
    const educationClassification = classifyStep(
      EDUCATION_DIMENSIONS,
      appliedDimensions,
      educationAgeSelection.exact
    );

    steps.push({
      id: "education",
      label: "Education",
      filterValue: getEducationLabel(filters.education),
      sourceType: educationClassification.sourceType,
      citation: dataset.sources.education,
      denominator: currentPopulation,
      share: educationShare,
      priorPopulation: currentPopulation,
      remainingPopulation: roundPopulation(currentPopulation * educationShare),
      explanation:
        educationClassification.sourceType === "observed"
          ? `Observed directly using the ${educationAgeSelection.bands[0]?.key.toLowerCase()} education distribution in the 2021 Census sample table.`
          : "Estimated by blending the nearest official education age bands across your selected range. Public data do not jointly publish education with every earlier filter.",
      conditioningUsed: educationClassification.conditioningUsed,
      omittedConditioning: educationClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("education");
  }

  if (filters.income !== "all") {
    const genderKey = filters.sex === "all" ? "all" : filters.sex;
    const incomeAgeSelection = getAgeBandSelection(filters.ageRange, EDUCATION_AGE_BANDS);
    const incomeWeights = getAgeWeightMap(
      dataset,
      geo,
      genderKey,
      filters.ageRange,
      incomeAgeSelection.bands
    );
    const incomeShare = getWeightedShare(
      incomeWeights,
      dataset.incomeAgeGender[geo][genderKey],
      filters.income
    );
    const incomeClassification = classifyStep(
      INCOME_DIMENSIONS,
      appliedDimensions,
      incomeAgeSelection.exact
    );

    steps.push({
      id: "income",
      label: "Income",
      filterValue: getIncomeLabel(filters.income),
      sourceType: incomeClassification.sourceType,
      citation: dataset.sources.income,
      denominator: currentPopulation,
      share: incomeShare,
      priorPopulation: currentPopulation,
      remainingPopulation: roundPopulation(currentPopulation * incomeShare),
      explanation:
        incomeClassification.sourceType === "observed"
          ? "Observed directly from the 2021 Census income-by-age-and-gender table, using income reference year 2020."
          : "Estimated by blending the nearest official income age bands across your selected range. Income is from the 2020 Census reference year, not the live 2026 population base.",
      conditioningUsed: incomeClassification.conditioningUsed,
      omittedConditioning: incomeClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("income");
  }

  if (filters.language !== "all") {
    const weightSex = filters.sex === "all" ? "all" : filters.sex;
    const languageAgeSelection = getAgeBandSelection(filters.ageRange, LANGUAGE_AGE_BANDS);
    const languageWeights = getAgeWeightMap(
      dataset,
      geo,
      weightSex,
      filters.ageRange,
      languageAgeSelection.bands
    );
    const languageShare = getWeightedShare(
      languageWeights,
      dataset.languageAge[geo],
      filters.language
    );
    const languageClassification = classifyStep(
      LANGUAGE_DIMENSIONS,
      appliedDimensions,
      languageAgeSelection.exact
    );

    steps.push({
      id: "language",
      label: "Language",
      filterValue: getLanguageLabel(filters.language),
      sourceType: languageClassification.sourceType,
      citation: dataset.sources.language,
      denominator: currentPopulation,
      share: languageShare,
      priorPopulation: currentPopulation,
      remainingPopulation: roundPopulation(currentPopulation * languageShare),
      explanation:
        languageClassification.sourceType === "observed"
          ? "Observed directly from the official-languages-by-age table."
          : "Estimated by blending the nearest official-language age bands across your selected range. This table is not jointly published with sex, marital status, education, or income.",
      conditioningUsed: languageClassification.conditioningUsed,
      omittedConditioning: languageClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("language");
  }

  const drinkingResult = getDrinkingShare(dataset, filters, geo);
  if (drinkingResult) {
    const drinkingClassification = classifyStep(DRINKING_DIMENSIONS, appliedDimensions, false);
    const drinkingStep = applyEstimatedCategoricalUnionStep({
      id: "drinking",
      label: DRINKING_FILTER_LABEL,
      filterValue: formatDrinkingSelection(filters.drinkingHabits),
      currentPopulation,
      share: drinkingResult.share,
      citation: dataset.sources.drinking,
      explanation:
        "Drinking habits are estimated from Canadian health-survey alcohol-use distributions. Selecting more than one option means match any selected category.",
      note: `${DRINKING_FILTER_NOTE} ${drinkingResult.note}`,
      derivation: drinkingResult.derivation,
      selectedValues: filters.drinkingHabits.map(
        (habit) => DRINKING_HABIT_OPTIONS[habit]?.label ?? habit
      ),
      confidenceLevel: "medium"
    });

    steps.push({
      ...drinkingStep,
      sourceType: drinkingClassification.sourceType,
      conditioningUsed: drinkingClassification.conditioningUsed,
      omittedConditioning: drinkingClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("drinking");
  }

  const heightModelSex = filters.sex === "all" ? "all" : filters.sex;
  const heightResult = getHeightShare(dataset, filters, geo, heightModelSex);
  if (heightResult.normalizedRanges.length) {
    const heightClassification = classifyStep(HEIGHT_DIMENSIONS, appliedDimensions, false);
    const heightStep = applyEstimatedRangeUnionStep({
      id: "height",
      label: "Height",
      filterValue: formatHeightSelection(
        heightResult.normalizedRanges,
        filters.heightPreference.displayUnit
      ),
      currentPopulation,
      share: heightResult.share,
      citation: dataset.sources.height,
      explanation:
        "Height is estimated from official Canadian measured-height percentiles by age and sex. The app unions all acceptable selected ranges before calculating the surviving share.",
      note:
        "Height is modeled statistically rather than observed in the census cross-tabs used for the rest of the funnel.",
      derivation:
        "Overlapping acceptable ranges are merged first, then estimated from an age-and-sex distribution fitted to official percentile anchors.",
      selectedValues: heightResult.normalizedRanges.map((range) =>
        formatHeightSelection([range], filters.heightPreference.displayUnit)
      ),
      confidenceLevel: "medium"
    });

    steps.push({
      ...heightStep,
      conditioningUsed: heightClassification.conditioningUsed,
      omittedConditioning: heightClassification.omittedConditioning
    });

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
    appliedDimensions.push("height");
  }

  const looksShare = getLooksShare(filters);
  if (looksShare !== null) {
    steps.push(
      applyAssumptionShareStep({
        id: "looks",
        label: LOOKS_FILTER_LABEL,
        filterValue: formatLooksSelection(filters.looksPreference),
        currentPopulation,
        share: looksShare,
        citation: dataset.sources.manual,
        explanation:
          "Attraction is subjective. This step is your assumption, not an official population fact.",
        note:
          "The calculator never treats attractiveness as a census-backed or objectively measured trait.",
        derivation:
          filters.looksPreference.preset === "custom"
            ? `Custom user-defined share of ${Math.round(looksShare * 100)}%.`
            : `Preset user-defined share of ${Math.round(looksShare * 100)}%.`,
        selectedValues: [formatLooksSelection(filters.looksPreference)]
      })
    );

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
  }

  for (const assumption of filters.manualAssumptions.filter((item) => item.enabled)) {
    steps.push(
      applyAssumptionShareStep({
        id: assumption.id,
        label: "Manual assumption",
        filterValue: assumption.label,
        currentPopulation,
        share: assumption.share,
        citation: dataset.sources.manual,
        explanation: `${assumption.label} is applied as a user-entered adjustment. Useful, honest, and very much not a published census cross-tab.`,
        note: "This slider reflects a personal assumption rather than an official dataset.",
        derivation: `Manual surviving share set to ${Math.round(assumption.share * 100)}%.`,
        selectedValues: [assumption.label]
      })
    );

    currentPopulation = steps.at(-1)?.remainingPopulation ?? currentPopulation;
  }

  const relevantPopulation = startingPopulation;
  const finalPopulation = currentPopulation;
  const shareOfRelevantPopulation = relevantPopulation === 0 ? 0 : finalPopulation / relevantPopulation;
  const quality = steps.some((step) => step.sourceType === "assumption")
    ? "assumption"
    : steps.some((step) => step.sourceType === "estimated")
      ? "estimated"
      : "observed";

  return {
    relevantPopulation,
    finalPopulation,
    oneInX: shareOfRelevantPopulation > 0 ? 1 / shareOfRelevantPopulation : null,
    strictness: getStrictnessLevel(shareOfRelevantPopulation),
    steps,
    quality,
    explanation: buildOverallExplanation(steps),
    comparison: getComparison(dataset.comparisonPlaces, finalPopulation)
  };
}
