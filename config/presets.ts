import type { CalculatorFilters, GeographyKey } from "@/lib/types";

export interface PresetDefinition {
  id: string;
  label: string;
  description: string;
  build: () => Partial<CalculatorFilters>;
}

function base(geography: GeographyKey): Partial<CalculatorFilters> {
  return {
    geography,
    adultOnly: true,
    populationGroups: [],
    drinkingHabits: [],
    heightPreference: {
      presetIds: [],
      customRanges: [],
      displayUnit: "cm"
    },
    looksPreference: {
      preset: "any",
      customShare: 0.1
    },
    manualAssumptions: []
  };
}

export const PRESETS: PresetDefinition[] = [
  {
    id: "not-that-picky",
    label: "Not That Picky",
    description: "A broad adult filter with a basic availability check and not much else.",
    build: () => ({
      ...base("canada"),
      ageRange: { min: 24, max: 39 },
      maritalStatus: "not_married_not_common_law",
      education: "all",
      income: "all",
      language: "all"
    })
  },
  {
    id: "broad-and-practical",
    label: "Broad and Practical",
    description: "A little structure, still plenty of room for real life to intervene.",
    build: () => ({
      ...base("canada"),
      ageRange: { min: 25, max: 38 },
      maritalStatus: "not_married_not_common_law",
      education: "bachelors_plus",
      income: "all",
      language: "english"
    })
  },
  {
    id: "urban-professional",
    label: "Urban Professional",
    description: "City-filtered, career-aware, but not yet deep into spreadsheet territory.",
    build: () => ({
      ...base("on"),
      ageRange: { min: 27, max: 38 },
      maritalStatus: "not_married_not_common_law",
      education: "bachelors_plus",
      income: "80k_plus",
      language: "english"
    })
  },
  {
    id: "academically-inclined",
    label: "Academically Inclined",
    description: "Graduate-school energy, with a little room left for normality.",
    build: () => ({
      ...base("qc"),
      ageRange: { min: 28, max: 40 },
      maritalStatus: "not_married_not_common_law",
      education: "masters_plus",
      income: "50k_plus",
      language: "french"
    })
  },
  {
    id: "quietly-selective",
    label: "Quietly Selective",
    description: "Not dramatic, just steadily specific.",
    build: () => ({
      ...base("bc"),
      ageRange: { min: 27, max: 34 },
      maritalStatus: "never_married",
      education: "bachelors_plus",
      income: "50k_plus",
      language: "english",
      drinkingHabits: ["no_past_week_drinks", "one_to_two_weekly_drinks"]
    })
  },
  {
    id: "height-matters",
    label: "Height Matters",
    description: "A clear example of how one extra preference can change the picture quickly.",
    build: () => ({
      ...base("canada"),
      ageRange: { min: 26, max: 38 },
      maritalStatus: "not_married_not_common_law",
      education: "all",
      income: "all",
      language: "all",
      heightPreference: {
        presetIds: ["178_plus"],
        customRanges: [],
        displayUnit: "cm"
      }
    })
  },
  {
    id: "toronto-filtering-effect",
    label: "Toronto Filtering Effect",
    description: "When geography, education, language, and salary all start voting at once.",
    build: () => ({
      ...base("on"),
      ageRange: { min: 26, max: 33 },
      maritalStatus: "not_married_not_common_law",
      education: "masters_plus",
      income: "100k_plus",
      language: "bilingual"
    })
  },
  {
    id: "highly-curated",
    label: "Highly Curated",
    description: "Specific enough that the app begins to gently raise an eyebrow.",
    build: () => ({
      ...base("canada"),
      ageRange: { min: 27, max: 32 },
      maritalStatus: "never_married",
      education: "masters_plus",
      income: "100k_plus",
      language: "bilingual",
      drinkingHabits: ["no_past_week_drinks"],
      heightPreference: {
        presetIds: ["170_plus"],
        customRanges: [],
        displayUnit: "cm"
      },
      looksPreference: {
        preset: "selective",
        customShare: 0.1
      }
    })
  }
];
