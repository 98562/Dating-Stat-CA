import { describe, expect, it } from "vitest";

import { calculateProbability } from "@/lib/calculator";
import { buildManualAssumptions, loadNormalizedDataset } from "@/lib/data/loaders";
import { buildSharePreview } from "@/lib/share/buildSharePreview";
import { buildShareImagePathFromPayload } from "@/lib/share/buildShareImageUrl";
import { encodeShareState } from "@/lib/share/encodeState";
import type { CalculatorFilters } from "@/lib/types";

async function buildScenario() {
  const dataset = await loadNormalizedDataset();
  const defaults = buildManualAssumptions();
  const filters: CalculatorFilters = {
    geography: "on",
    ageRange: { min: 26, max: 34 },
    sex: "women",
    maritalStatus: "never_married",
    education: "bachelors_plus",
    income: "80k_plus",
    language: "english",
    populationGroups: [],
    drinkingHabits: [],
    heightPreference: {
      presetIds: ["170_plus"],
      customRanges: [],
      displayUnit: "cm"
    },
    looksPreference: {
      preset: "any",
      customShare: 0.5
    },
    adultOnly: true,
    manualAssumptions: defaults
  };

  return {
    filters,
    result: calculateProbability(dataset, filters)
  };
}

describe("share preview helpers", () => {
  it("builds human-readable share preview content", async () => {
    const { filters, result } = await buildScenario();
    const preview = buildSharePreview(filters, result, 3);

    expect(preview.title).toContain("Canada Dating Pool Calculator");
    expect(preview.estimatedPool).toContain("people");
    expect(preview.oneInX).toContain("1 in");
    expect(preview.keyFilters.length).toBeLessThanOrEqual(3);
  }, 15000);

  it("builds dedicated image paths for story and social preview variants", async () => {
    const { filters } = await buildScenario();
    const payload = encodeShareState(filters);

    expect(buildShareImagePathFromPayload(payload, "story")).toContain("/share-image");
    expect(buildShareImagePathFromPayload(payload, "opengraph")).toContain("/opengraph-image");
  });
});
