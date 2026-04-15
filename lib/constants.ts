import type {
  CalculatorFilters,
  Citation,
  GeographyKey,
  SexKey
} from "@/lib/types";
import { productConfig } from "@/config/product";

export const GEO_ORDER: GeographyKey[] = [
  "canada",
  "nl",
  "pe",
  "ns",
  "nb",
  "qc",
  "on",
  "mb",
  "sk",
  "ab",
  "bc",
  "yt",
  "nt",
  "nu"
];

export const GEO_LABELS: Record<GeographyKey, string> = {
  canada: "Canada",
  nl: "Newfoundland and Labrador",
  pe: "Prince Edward Island",
  ns: "Nova Scotia",
  nb: "New Brunswick",
  qc: "Quebec",
  on: "Ontario",
  mb: "Manitoba",
  sk: "Saskatchewan",
  ab: "Alberta",
  bc: "British Columbia",
  yt: "Yukon",
  nt: "Northwest Territories",
  nu: "Nunavut"
};

export const GEO_TO_STATCAN_LABEL: Record<GeographyKey, string> = {
  canada: "Canada",
  nl: "Newfoundland and Labrador",
  pe: "Prince Edward Island",
  ns: "Nova Scotia",
  nb: "New Brunswick",
  qc: "Quebec",
  on: "Ontario",
  mb: "Manitoba",
  sk: "Saskatchewan",
  ab: "Alberta",
  bc: "British Columbia",
  yt: "Yukon",
  nt: "Northwest Territories",
  nu: "Nunavut"
};

export const STATCAN_LABEL_TO_GEO = Object.fromEntries(
  Object.entries(GEO_TO_STATCAN_LABEL).map(([key, value]) => [value, key])
) as Record<string, GeographyKey>;

export const SEX_LABELS: Record<SexKey, string> = {
  all: "Choose one first",
  men: "Men+",
  women: "Women+"
};

export const DEFAULT_FILTERS: CalculatorFilters = {
  geography: "canada",
  ageRange: { min: Math.max(productConfig.minimumAge, 25), max: 34 },
  sex: "all",
  maritalStatus: "not_married_not_common_law",
  education: "bachelors_plus",
  income: "80k_plus",
  language: "english",
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
  adultOnly: true,
  manualAssumptions: []
};

export const SOURCE_CATALOG: Record<string, Citation> = {
  population: {
    id: "population-estimates-2026-q1",
    title: "Canada's population estimates, fourth quarter 2025",
    url: "https://www150.statcan.gc.ca/n1/daily-quotidien/260318/dq260318b-eng.htm",
    yearLabel: "1 January 2026 estimate",
    note: "Latest quarterly population estimate used as the live starting population.",
    tableId: "17-10-0009-01"
  },
  marital: {
    id: "9810012901",
    title:
      "Marital status, age group and gender: Canada, provinces and territories, census divisions, census subdivisions and dissemination areas",
    url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810012901",
    yearLabel: "2021 Census",
    note: "Population aged 15 years and over, 100% data. Used for age, sex/gender, and relationship-status proxy steps.",
    tableId: "98-10-0129-01"
  },
  education: {
    id: "9810038401",
    title:
      "Highest certificate, diploma or degree by age group and gender: Canada, provinces and territories",
    url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810038401",
    yearLabel: "2021 Census",
    note: "Population aged 15 years and over in private households. Education shares come from 25% sample census data.",
    tableId: "98-10-0384-01"
  },
  income: {
    id: "9810006401",
    title:
      "Total income groups by age and gender: Canada, provinces and territories, census metropolitan areas and census agglomerations with parts",
    url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810006401",
    yearLabel: "2021 Census / 2020 income year",
    note: "Income uses the Census income reference year 2020, which is older than the live 2026 population estimate.",
    tableId: "98-10-0064-01"
  },
  language: {
    id: "9810022201",
    title: "Knowledge of official languages by age: Canada, provinces and territories",
    url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810022201",
    yearLabel: "2021 Census",
    note: "Language filter uses official-language knowledge categories rather than app usage or preference.",
    tableId: "98-10-0222-01"
  },
  ethnicity: {
    id: "9810035101",
    title: "Visible minority by gender and age: Canada, provinces and territories",
    url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810035101",
    yearLabel: "2021 Census",
    note: "Population-group filter uses official 2021 Census visible minority categories for persons in private households. Multi-select combines selected categories using union logic.",
    tableId: "98-10-0351-01"
  },
  drinking: {
    id: "cchs-alcohol-risk-2023",
    title:
      "Risk level from alcohol consumption of Canadians aged 18 and older, by gender, age group and province, 2023",
    url: "https://www150.statcan.gc.ca/n1/daily-quotidien/241002/t001a-eng.htm",
    yearLabel: "2023 Canadian Community Health Survey",
    note: "Drinking-habits shares use self-reported alcohol-use risk categories from the 2023 Canadian Community Health Survey. They are survey-based estimates, not census counts, and may underreport true consumption.",
    tableId: "The Daily, Table 1"
  },
  height: {
    id: "chms-height-table-22",
    title: "Measured standing height, by age and sex, household population, Canada, 2009 to 2011",
    url: "https://www150.statcan.gc.ca/n1/pub/82-626-x/2013001/t023-eng.htm",
    yearLabel: "Canadian Health Measures Survey, Cycle 2",
    note: "Height uses measured standing-height percentiles from an official Canadian health survey. The calculator estimates surviving shares by interpolating across published percentiles.",
    tableId: "Table 22"
  },
  manual: {
    id: "manual-assumptions",
    title: "User-entered manual assumption",
    url: "https://www.statcan.gc.ca/en/start",
    yearLabel: "User input",
    note: "Not census-backed. This is a deliberate assumption slider applied after the statistical filters.",
    tableId: undefined
  }
};
