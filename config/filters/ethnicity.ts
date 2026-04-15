import type { PopulationGroupKey } from "@/lib/types";

export interface PopulationGroupDefinition {
  key: PopulationGroupKey;
  label: string;
  sourceColumn: string;
}

export const POPULATION_GROUP_FILTER_LABEL = "Population group";

export const POPULATION_GROUPS: PopulationGroupDefinition[] = [
  {
    key: "not_a_visible_minority",
    label: "Not a visible minority",
    sourceColumn: "Not a visible minority"
  },
  { key: "south_asian", label: "South Asian", sourceColumn: "South Asian" },
  { key: "chinese", label: "Chinese", sourceColumn: "Chinese" },
  { key: "black", label: "Black", sourceColumn: "Black" },
  { key: "filipino", label: "Filipino", sourceColumn: "Filipino" },
  { key: "arab", label: "Arab", sourceColumn: "Arab" },
  { key: "latin_american", label: "Latin American", sourceColumn: "Latin American" },
  { key: "southeast_asian", label: "Southeast Asian", sourceColumn: "Southeast Asian" },
  { key: "west_asian", label: "West Asian", sourceColumn: "West Asian" },
  { key: "korean", label: "Korean", sourceColumn: "Korean" },
  { key: "japanese", label: "Japanese", sourceColumn: "Japanese" },
  {
    key: "visible_minority_nie",
    label: "Visible minority, n.i.e.",
    sourceColumn: "Visible minority, n.i.e."
  },
  {
    key: "multiple_visible_minorities",
    label: "Multiple visible minorities",
    sourceColumn: "Multiple visible minorities"
  }
];

export const POPULATION_GROUP_OPTIONS = Object.fromEntries(
  POPULATION_GROUPS.map((group) => [group.key, group])
) as Record<string, PopulationGroupDefinition>;

export const ETHNICITY_AGE_BANDS = [
  { key: "15 to 19 years", min: 15, max: 19 },
  { key: "20 to 24 years", min: 20, max: 24 },
  { key: "25 to 34 years", min: 25, max: 34 },
  { key: "35 to 44 years", min: 35, max: 44 },
  { key: "45 to 54 years", min: 45, max: 54 },
  { key: "55 to 64 years", min: 55, max: 64 },
  { key: "65 to 74 years", min: 65, max: 74 },
  { key: "75 years and over", min: 75, max: null }
] as const;
