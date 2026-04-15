import { beforeAll, describe, expect, it } from "vitest";

import { calculateProbability } from "@/lib/calculator";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { buildManualAssumptions, loadNormalizedDataset } from "@/lib/data/loaders";
import type { CalculatorFilters, NormalizedDataset } from "@/lib/types";

let dataset: NormalizedDataset;

function createBroadFilters(
  overrides: Partial<CalculatorFilters> = {}
): CalculatorFilters {
  return {
    ...DEFAULT_FILTERS,
    geography: "canada",
    ageRange: { min: 25, max: 34 },
    sex: "all",
    maritalStatus: "all",
    education: "all",
    income: "all",
    language: "all",
    populationGroups: [],
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
    manualAssumptions: buildManualAssumptions(),
    ...overrides
  };
}

function getStep(result: ReturnType<typeof calculateProbability>, id: string) {
  const step = result.steps.find((item) => item.id === id);
  expect(step, `Expected step "${id}" to exist`).toBeDefined();
  return step!;
}

beforeAll(async () => {
  dataset = await loadNormalizedDataset();
});

describe("calculator math regression checks", () => {
  it("keeps the broad age-only baseline above zero", () => {
    const result = calculateProbability(dataset, createBroadFilters());

    expect(result.finalPopulation).toBeGreaterThan(1_000_000);
    expect(result.steps.some((step) => step.id === "population_group")).toBe(false);
    expect(result.steps.some((step) => step.id === "height")).toBe(false);
  });

  it("treats population-group multi-select as a union instead of collapsing to zero", () => {
    const chinese = calculateProbability(
      dataset,
      createBroadFilters({ populationGroups: ["chinese"] })
    );
    const korean = calculateProbability(
      dataset,
      createBroadFilters({ populationGroups: ["korean"] })
    );
    const combined = calculateProbability(
      dataset,
      createBroadFilters({ populationGroups: ["chinese", "korean"] })
    );

    expect(chinese.finalPopulation).toBeGreaterThan(1_000);
    expect(korean.finalPopulation).toBeGreaterThan(100);
    expect(combined.finalPopulation).toBeGreaterThan(chinese.finalPopulation);
    expect(combined.finalPopulation).toBeGreaterThan(korean.finalPopulation);

    const combinedStep = getStep(combined, "population_group");
    expect(combinedStep.sourceType).toBe("observed");
    expect(combinedStep.filterValue).toContain("Chinese");
    expect(combinedStep.filterValue).toContain("Korean");
  });

  it("keeps the official non-visible-minority category materially above zero", () => {
    const result = calculateProbability(
      dataset,
      createBroadFilters({ populationGroups: ["not_a_visible_minority"] })
    );

    expect(result.finalPopulation).toBeGreaterThan(1_000);
    expect(getStep(result, "population_group").share).toBeGreaterThan(0.01);
  });

  it("keeps taller height thresholds rare but not effectively impossible", () => {
    const medium = calculateProbability(
      dataset,
      createBroadFilters({
        heightPreference: {
          presetIds: ["168_to_175"],
          customRanges: [],
          displayUnit: "cm"
        }
      })
    );
    const tall = calculateProbability(
      dataset,
      createBroadFilters({
        heightPreference: {
          presetIds: ["178_plus"],
          customRanges: [],
          displayUnit: "cm"
        }
      })
    );
    const veryTall = calculateProbability(
      dataset,
      createBroadFilters({
        heightPreference: {
          presetIds: ["183_plus"],
          customRanges: [],
          displayUnit: "cm"
        }
      })
    );

    expect(medium.finalPopulation).toBeGreaterThan(tall.finalPopulation);
    expect(tall.finalPopulation).toBeGreaterThan(100);
    expect(veryTall.finalPopulation).toBeGreaterThan(10);
    expect(getStep(tall, "height").sourceType).toBe("estimated");
  });

  it("applies drinking-habit multi-select as a union of survey buckets", () => {
    const none = calculateProbability(
      dataset,
      createBroadFilters({ drinkingHabits: ["no_past_week_drinks"] })
    );
    const light = calculateProbability(
      dataset,
      createBroadFilters({ drinkingHabits: ["one_to_two_weekly_drinks"] })
    );
    const combined = calculateProbability(
      dataset,
      createBroadFilters({
        drinkingHabits: ["no_past_week_drinks", "one_to_two_weekly_drinks"]
      })
    );

    expect(none.finalPopulation).toBeGreaterThan(light.finalPopulation);
    expect(light.finalPopulation).toBeGreaterThan(100_000);
    expect(combined.finalPopulation).toBeGreaterThan(none.finalPopulation);
    expect(getStep(combined, "drinking").sourceType).toBe("estimated");
  });

  it("keeps the derived avoids-heavy-drinking category above the single heavy-drinking bucket", () => {
    const avoidsHeavy = calculateProbability(
      dataset,
      createBroadFilters({ drinkingHabits: ["avoids_heavy_drinking"] })
    );
    const heavy = calculateProbability(
      dataset,
      createBroadFilters({ drinkingHabits: ["seven_plus_weekly_drinks"] })
    );

    expect(avoidsHeavy.finalPopulation).toBeGreaterThan(heavy.finalPopulation);
    expect(getStep(avoidsHeavy, "drinking").filterValue).toContain("Avoids heavy drinking");
  });

  it("merges overlapping custom height ranges before applying the share", () => {
    const merged = calculateProbability(
      dataset,
      createBroadFilters({
        heightPreference: {
          presetIds: [],
          customRanges: [{ minCm: 170, maxCm: 190 }],
          displayUnit: "cm"
        }
      })
    );
    const overlapping = calculateProbability(
      dataset,
      createBroadFilters({
        heightPreference: {
          presetIds: [],
          customRanges: [
            { minCm: 170, maxCm: 180 },
            { minCm: 180, maxCm: 190 }
          ],
          displayUnit: "cm"
        }
      })
    );

    expect(overlapping.finalPopulation).toBeCloseTo(merged.finalPopulation, 6);
    expect(getStep(overlapping, "height").filterValue).toBe("170-190 cm");
  });

  it("applies the looks filter as an explicit assumption step", () => {
    const result = calculateProbability(
      dataset,
      createBroadFilters({
        looksPreference: {
          preset: "very_selective",
          customShare: 0.1
        }
      })
    );

    const step = getStep(result, "looks");
    expect(step.sourceType).toBe("assumption");
    expect(step.share).toBeCloseTo(0.1, 6);
    expect(step.filterValue).toContain("10%");
  });
});
