import type { DrinkingHabitKey, DrinkingRiskBucket } from "@/lib/types";

export interface DrinkingHabitDefinition {
  key: DrinkingHabitKey;
  label: string;
  description: string;
  sourceBuckets: DrinkingRiskBucket[];
}

export interface DrinkingAgeBand {
  key: string;
  min: number;
  max: number | null;
}

export const DRINKING_FILTER_LABEL = "Drinking habits";

export const DRINKING_FILTER_HELPER_TEXT =
  "This filter uses survey-based alcohol-use data rather than census counts. Self-reported drinking can understate actual consumption.";

export const DRINKING_FILTER_NOTE =
  "The drinking-habits step is modeled from Canadian health-survey distributions and is usually estimated rather than directly observed.";

export const DRINKING_HABITS: DrinkingHabitDefinition[] = [
  {
    key: "no_past_week_drinks",
    label: "Does not drink",
    description: "A survey-based proxy for people who reported zero drinks in the previous seven days.",
    sourceBuckets: ["no_risk"]
  },
  {
    key: "one_to_two_weekly_drinks",
    label: "Drinks lightly",
    description: "Maps to the survey's low weekly alcohol-use category.",
    sourceBuckets: ["low_risk"]
  },
  {
    key: "three_to_six_weekly_drinks",
    label: "Drinks moderately",
    description: "Maps to the survey's moderate weekly alcohol-use category.",
    sourceBuckets: ["moderate_risk"]
  },
  {
    key: "seven_plus_weekly_drinks",
    label: "Drinks regularly",
    description: "Maps to the highest weekly alcohol-use category used in this version.",
    sourceBuckets: ["high_risk"]
  },
  {
    key: "avoids_heavy_drinking",
    label: "Avoids heavy drinking",
    description: "Derived as anything below the highest weekly alcohol-use bucket.",
    sourceBuckets: ["no_risk", "low_risk", "moderate_risk"]
  }
];

export const DRINKING_HABIT_OPTIONS = Object.fromEntries(
  DRINKING_HABITS.map((habit) => [habit.key, habit])
) as Record<DrinkingHabitKey, DrinkingHabitDefinition>;

export const DRINKING_AGE_BANDS: readonly DrinkingAgeBand[] = [
  { key: "18 to 22 years", min: 18, max: 22 },
  { key: "23 to 34 years", min: 23, max: 34 },
  { key: "35 to 44 years", min: 35, max: 44 },
  { key: "45 to 54 years", min: 45, max: 54 },
  { key: "55 to 64 years", min: 55, max: 64 },
  { key: "65 years and older", min: 65, max: null }
] as const;
