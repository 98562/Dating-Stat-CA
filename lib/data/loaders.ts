import { readFile } from "node:fs/promises";
import path from "node:path";

import comparisonPlaces from "@/data/normalized/comparison-places.json";
import drinkingRiskSurvey from "@/data/normalized/drinking-risk-cchs-2023.json";
import manualAssumptionDefinitions from "@/data/normalized/manual-assumptions.json";
import populationEstimatesFile from "@/data/normalized/latest-population-estimates.json";
import { POPULATION_GROUPS } from "@/config/filters/ethnicity";
import { GEO_ORDER, SOURCE_CATALOG, STATCAN_LABEL_TO_GEO } from "@/lib/constants";
import { parseCsv } from "@/lib/data/csv";
import type {
  AgeBucket,
  ManualAssumptionDefinition,
  NormalizedDataset,
  PopulationGroupKey,
  SexKey
} from "@/lib/types";

const MARITAL_AGE_BUCKETS: AgeBucket[] = [
  { id: "15-19", label: "15 to 19 years", min: 15, max: 19 },
  { id: "20-24", label: "20 to 24 years", min: 20, max: 24 },
  { id: "25-29", label: "25 to 29 years", min: 25, max: 29 },
  { id: "30-34", label: "30 to 34 years", min: 30, max: 34 },
  { id: "35-39", label: "35 to 39 years", min: 35, max: 39 },
  { id: "40-44", label: "40 to 44 years", min: 40, max: 44 },
  { id: "45-49", label: "45 to 49 years", min: 45, max: 49 },
  { id: "50-54", label: "50 to 54 years", min: 50, max: 54 },
  { id: "55-59", label: "55 to 59 years", min: 55, max: 59 },
  { id: "60-64", label: "60 to 64 years", min: 60, max: 64 },
  { id: "65-69", label: "65 to 69 years", min: 65, max: 69 },
  { id: "70-74", label: "70 to 74 years", min: 70, max: 74 },
  { id: "75-79", label: "75 to 79 years", min: 75, max: 79 },
  { id: "80-84", label: "80 to 84 years", min: 80, max: 84 },
  { id: "85-plus", label: "85 years and over", min: 85, max: null }
];

const EDUCATION_AGE_KEYS = [
  "Total - Age",
  "15 to 24 years",
  "25 to 34 years",
  "35 to 44 years",
  "45 to 54 years",
  "55 to 64 years",
  "65 to 74 years",
  "75 years and over"
] as const;

const INCOME_AGE_KEYS = [
  "Total - Age",
  "15 to 24 years",
  "25 to 34 years",
  "35 to 44 years",
  "45 to 54 years",
  "55 to 64 years",
  "65 to 74 years",
  "75 years and over"
] as const;

const LANGUAGE_AGE_KEYS = [
  "Total - Age",
  "15 to 19 years",
  "20 to 24 years",
  "25 to 44 years",
  "45 to 64 years",
  "65 to 74 years",
  "75 years and over"
] as const;

const ETHNICITY_AGE_KEYS = [
  "Total - Age",
  "15 years and over",
  "15 to 19 years",
  "20 to 24 years",
  "25 to 34 years",
  "35 to 44 years",
  "45 to 54 years",
  "55 to 64 years",
  "65 to 74 years",
  "75 years and over"
] as const;

function createNestedCountRecord<K1 extends string, K2 extends string>(
  primary: readonly K1[],
  secondary: readonly K2[]
) {
  return Object.fromEntries(
    primary.map((first) => [
      first,
      Object.fromEntries(secondary.map((second) => [second, 0]))
    ])
  ) as Record<K1, Record<K2, number>>;
}

function createMaritalTemplate() {
  return {
    "Total - Marital status": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    ),
    "Not married and not living common-law": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    ),
    "Not married and not living common law - Never married": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    ),
    "Not married and not living common law - Separated": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    ),
    "Not married and not living common law - Divorced": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    ),
    "Not married and not living common law - Widowed": Object.fromEntries(
      MARITAL_AGE_BUCKETS.map((bucket) => [bucket.id, 0])
    )
  };
}

function createDatasetTemplate() {
  const maritalAgeGender = {} as NormalizedDataset["maritalAgeGender"];
  const educationAgeGender = {} as NormalizedDataset["educationAgeGender"];
  const incomeAgeGender = {} as NormalizedDataset["incomeAgeGender"];
  const ethnicityAgeGender = {} as NormalizedDataset["ethnicityAgeGender"];
  const languageAge = {} as NormalizedDataset["languageAge"];

  for (const geo of GEO_ORDER) {
    maritalAgeGender[geo] = {
      all: createMaritalTemplate(),
      men: createMaritalTemplate(),
      women: createMaritalTemplate()
    };

    educationAgeGender[geo] = {
      all: createNestedCountRecord(EDUCATION_AGE_KEYS, [
        "high_school_or_less",
        "college_trades",
        "bachelors_plus",
        "masters_plus",
        "professional_degree",
        "doctorate",
        "total"
      ]),
      men: createNestedCountRecord(EDUCATION_AGE_KEYS, [
        "high_school_or_less",
        "college_trades",
        "bachelors_plus",
        "masters_plus",
        "professional_degree",
        "doctorate",
        "total"
      ]),
      women: createNestedCountRecord(EDUCATION_AGE_KEYS, [
        "high_school_or_less",
        "college_trades",
        "bachelors_plus",
        "masters_plus",
        "professional_degree",
        "doctorate",
        "total"
      ])
    };

    incomeAgeGender[geo] = {
      all: createNestedCountRecord(INCOME_AGE_KEYS, [
        "total",
        "50k_plus",
        "80k_plus",
        "100k_plus",
        "150k_plus"
      ]),
      men: createNestedCountRecord(INCOME_AGE_KEYS, [
        "total",
        "50k_plus",
        "80k_plus",
        "100k_plus",
        "150k_plus"
      ]),
      women: createNestedCountRecord(INCOME_AGE_KEYS, [
        "total",
        "50k_plus",
        "80k_plus",
        "100k_plus",
        "150k_plus"
      ])
    };

    ethnicityAgeGender[geo] = {
      all: createNestedCountRecord(
        ETHNICITY_AGE_KEYS,
        ["total", ...POPULATION_GROUPS.map((group) => group.key)] as ["total", ...PopulationGroupKey[]]
      ),
      men: createNestedCountRecord(
        ETHNICITY_AGE_KEYS,
        ["total", ...POPULATION_GROUPS.map((group) => group.key)] as ["total", ...PopulationGroupKey[]]
      ),
      women: createNestedCountRecord(
        ETHNICITY_AGE_KEYS,
        ["total", ...POPULATION_GROUPS.map((group) => group.key)] as ["total", ...PopulationGroupKey[]]
      )
    };

    languageAge[geo] = createNestedCountRecord(LANGUAGE_AGE_KEYS, [
      "total",
      "english",
      "french",
      "bilingual"
    ]);
  }

  return {
    maritalAgeGender,
    educationAgeGender,
    incomeAgeGender,
    ethnicityAgeGender,
    languageAge
  };
}

function toNumber(value: string | undefined) {
  const numeric = Number((value ?? "0").replaceAll(",", "").trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeLabel(value: string | undefined) {
  return (value ?? "")
    .replaceAll("\u2019", "'")
    .replaceAll("\u2018", "'")
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replaceAll("\u2014", "-")
    .replaceAll("\u2013", "-")
    .trim();
}

function readColumn(row: Record<string, string>, key: string) {
  if (row[key] !== undefined) {
    return row[key];
  }

  const fallbackKey = Object.keys(row).find((candidate) => candidate === `${key}_2` || candidate.startsWith(`${key}_`));
  return fallbackKey ? row[fallbackKey] : undefined;
}

function readVisibleMinorityColumn(
  row: Record<string, string>,
  label: string
) {
  const exactPrefix = `Visible minority (15):${label}[`;
  const key = Object.keys(row).find((candidate) => candidate.startsWith(exactPrefix));
  return key ? row[key] : undefined;
}

function mapGender(label: string | undefined): SexKey | null {
  const normalized = normalizeLabel(label);
  if (normalized === "Total - Gender" || normalized === "Total - Sex") return "all";
  if (normalized === "Men+" || normalized === "Male") return "men";
  if (normalized === "Women+" || normalized === "Female") return "women";
  return null;
}

function mapEducationBand(label: string | undefined) {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;
  if (normalized === "Total - Highest certificate, diploma or degree") return "total";
  if (
    normalized === "No certificate, diploma or degree" ||
    normalized === "High (secondary) school diploma or equivalency certificate"
  ) {
    return "high_school_or_less";
  }
  if (
    normalized === "Apprenticeship or trades certificate or diploma" ||
    normalized === "Apprenticeship certificate" ||
    normalized === "Non-apprenticeship trades certificate or diploma" ||
    normalized === "College, CEGEP or other non-university certificate or diploma" ||
    normalized === "University certificate or diploma below bachelor level"
  ) {
    return "college_trades";
  }
  if (normalized === "Bachelor's degree or higher") {
    return "bachelors_plus";
  }
  if (
    normalized === "Master's degree" ||
    normalized === "University certificate or diploma above bachelor level"
  ) {
    return "masters_plus";
  }
  if (normalized === "Degree in medicine, dentistry, veterinary medicine or optometry") {
    return "professional_degree";
  }
  if (normalized === "Earned doctorate") {
    return "doctorate";
  }
  return null;
}

function sumIntoTarget<T extends Record<string, number>>(
  target: T,
  key: keyof T,
  value: number
) {
  target[key] = ((target[key] ?? 0) + value) as T[keyof T];
}

async function loadFile(relativePath: string) {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

let cachedDataset: Promise<NormalizedDataset> | null = null;

export async function loadNormalizedDataset(): Promise<NormalizedDataset> {
  if (cachedDataset) return cachedDataset;

  cachedDataset = (async () => {
    const datasetTemplate = createDatasetTemplate();

    const [maritalCsv, educationCsv, incomeCsv, ethnicityCsv, languageCsv] = await Promise.all([
      loadFile("data/raw/98100128-eng/98100128.csv"),
      loadFile("data/raw/98100384-eng/98100384.csv"),
      loadFile("data/raw/98100064-eng/98100064.csv"),
      loadFile("data/raw/98100351-eng/98100351.csv"),
      loadFile("data/raw/98100222-eng/98100222.csv")
    ]);

    const maritalRows = await parseCsv<Record<string, string>>(maritalCsv);
    const educationRows = await parseCsv<Record<string, string>>(educationCsv);
    const incomeRows = await parseCsv<Record<string, string>>(incomeCsv);
    const ethnicityRows = await parseCsv<Record<string, string>>(ethnicityCsv);
    const languageRows = await parseCsv<Record<string, string>>(languageCsv);

    for (const row of maritalRows) {
      const geo = STATCAN_LABEL_TO_GEO[normalizeLabel(readColumn(row, "GEO"))];
      const gender = mapGender(readColumn(row, "Gender (3a)"));
      const maritalStatus = normalizeLabel(readColumn(row, "Marital status (13)"));

      if (!geo || !gender || !datasetTemplate.maritalAgeGender[geo][gender][maritalStatus]) {
        continue;
      }

      for (let index = 0; index < MARITAL_AGE_BUCKETS.length; index += 1) {
        const bucket = MARITAL_AGE_BUCKETS[index];
        const column = `Age (16):${bucket.label}[${index + 2}]`;
        datasetTemplate.maritalAgeGender[geo][gender][maritalStatus][bucket.id] = toNumber(
          readColumn(row, column)
        );
      }
    }

    for (const row of educationRows) {
      const geo = STATCAN_LABEL_TO_GEO[normalizeLabel(readColumn(row, "GEO"))];
      const gender = mapGender(readColumn(row, "Gender (3a)"));
      const ageKey = normalizeLabel(readColumn(row, "Age (15A)")) as (typeof EDUCATION_AGE_KEYS)[number];
      const band = mapEducationBand(readColumn(row, "Highest certificate, diploma or degree (15)"));

      if (!geo || !gender || !EDUCATION_AGE_KEYS.includes(ageKey) || !band) continue;
      if (normalizeLabel(readColumn(row, "Statistics (2A)")) !== "Count") continue;

      const count = toNumber(readColumn(row, "Census year (4):2021[1]"));

      if (band === "total") {
        datasetTemplate.educationAgeGender[geo][gender][ageKey].total = count;
        continue;
      }

      sumIntoTarget(datasetTemplate.educationAgeGender[geo][gender][ageKey], band, count);

      if (band === "professional_degree" || band === "doctorate") {
        sumIntoTarget(
          datasetTemplate.educationAgeGender[geo][gender][ageKey],
          "masters_plus",
          count
        );
      }
    }

    for (const row of incomeRows) {
      const geo = STATCAN_LABEL_TO_GEO[normalizeLabel(readColumn(row, "GEO"))];
      const gender = mapGender(readColumn(row, "Gender (3a)"));
      const ageKey = normalizeLabel(readColumn(row, "Age (11)")) as (typeof INCOME_AGE_KEYS)[number];
      const group = normalizeLabel(readColumn(row, "Total income groups (24)"));
      const count = toNumber(readColumn(row, "Year (2):2020[1]"));

      if (!geo || !gender || !INCOME_AGE_KEYS.includes(ageKey)) continue;

      if (group === "Total - Total income") {
        datasetTemplate.incomeAgeGender[geo][gender][ageKey].total = count;
        continue;
      }

      if (
        group.startsWith("Median") ||
        group.startsWith("Percentage") ||
        group === "With total income" ||
        group === "Without total income"
      ) {
        continue;
      }

      const numbers =
        group.match(/\d[\d,]*/g)?.map((item) => Number(item.replaceAll(",", ""))) ?? [];
      const lower = numbers[0] ?? 0;

      if (lower >= 50000) datasetTemplate.incomeAgeGender[geo][gender][ageKey]["50k_plus"] += count;
      if (lower >= 80000) datasetTemplate.incomeAgeGender[geo][gender][ageKey]["80k_plus"] += count;
      if (lower >= 100000)
        datasetTemplate.incomeAgeGender[geo][gender][ageKey]["100k_plus"] += count;
      if (lower >= 150000)
        datasetTemplate.incomeAgeGender[geo][gender][ageKey]["150k_plus"] += count;
    }

    for (const row of ethnicityRows) {
      const geo = STATCAN_LABEL_TO_GEO[normalizeLabel(readColumn(row, "GEO"))];
      const gender = mapGender(readColumn(row, "Gender (3)"));
      const ageKey = normalizeLabel(readColumn(row, "Age (15C)")) as (typeof ETHNICITY_AGE_KEYS)[number];
      const statistic = normalizeLabel(readColumn(row, "Statistics (2)"));

      if (!geo || !gender || !ETHNICITY_AGE_KEYS.includes(ageKey)) continue;
      if (statistic !== "2021 Counts") continue;

      datasetTemplate.ethnicityAgeGender[geo][gender][ageKey].total = toNumber(
        readColumn(row, "Visible minority (15):Total - Visible minority[1]")
      );

      for (const group of POPULATION_GROUPS) {
        datasetTemplate.ethnicityAgeGender[geo][gender][ageKey][group.key] = toNumber(
          readVisibleMinorityColumn(row, group.sourceColumn)
        );
      }
    }

    for (const row of languageRows) {
      const geo = STATCAN_LABEL_TO_GEO[normalizeLabel(readColumn(row, "GEO"))];
      const ageKey = normalizeLabel(readColumn(row, "Age (13B)")) as (typeof LANGUAGE_AGE_KEYS)[number];
      const knowledge = normalizeLabel(readColumn(row, "Knowledge of official languages (5)"));
      const count = toNumber(readColumn(row, "Statistics (6A):2021 Counts[1]"));

      if (!geo || !LANGUAGE_AGE_KEYS.includes(ageKey)) continue;

      if (knowledge === "Total - Knowledge of official languages") {
        datasetTemplate.languageAge[geo][ageKey].total = count;
      }

      if (knowledge === "English only") {
        datasetTemplate.languageAge[geo][ageKey].english += count;
      }

      if (knowledge === "French only") {
        datasetTemplate.languageAge[geo][ageKey].french += count;
      }

      if (knowledge === "English and French") {
        datasetTemplate.languageAge[geo][ageKey].bilingual += count;
        datasetTemplate.languageAge[geo][ageKey].english += count;
        datasetTemplate.languageAge[geo][ageKey].french += count;
      }
    }

    return {
      generatedLabel: `${populationEstimatesFile.referenceDate} data snapshot`,
      populationEstimates: populationEstimatesFile.estimates,
      ageBuckets: MARITAL_AGE_BUCKETS,
      comparisonPlaces,
      manualAssumptions: manualAssumptionDefinitions as ManualAssumptionDefinition[],
      sources: {
        population: SOURCE_CATALOG.population,
        marital: SOURCE_CATALOG.marital,
        education: SOURCE_CATALOG.education,
        income: SOURCE_CATALOG.income,
        ethnicity: SOURCE_CATALOG.ethnicity,
        drinking: SOURCE_CATALOG.drinking,
        height: SOURCE_CATALOG.height,
        language: SOURCE_CATALOG.language,
        manual: SOURCE_CATALOG.manual
      },
      maritalAgeGender: datasetTemplate.maritalAgeGender,
      educationAgeGender: datasetTemplate.educationAgeGender,
      incomeAgeGender: datasetTemplate.incomeAgeGender,
      ethnicityAgeGender: datasetTemplate.ethnicityAgeGender,
      drinkingRisk: drinkingRiskSurvey,
      languageAge: datasetTemplate.languageAge
    };
  })();

  return cachedDataset;
}

export function buildManualAssumptions() {
  return manualAssumptionDefinitions.map((definition) => ({
    ...definition,
    enabled: false,
    share: definition.defaultShare,
    isCustom: false
  }));
}
