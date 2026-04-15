import { describe, expect, it } from "vitest";

import { buildManualAssumptions } from "@/lib/data/loaders";
import { buildCustomManualAssumption } from "@/lib/manual-assumptions";
import { decodeShareState } from "@/lib/share/decodeState";
import { encodeShareState } from "@/lib/share/encodeState";
import type { CalculatorFilters } from "@/lib/types";

function buildFilters(): CalculatorFilters {
  const defaults = buildManualAssumptions();
  const customAssumption = buildCustomManualAssumption(defaults, "comfortable with pets", 0.55);

  return {
    geography: "on",
    ageRange: { min: 27, max: 35 },
    sex: "women",
    maritalStatus: "never_married",
    education: "masters_plus",
    income: "100k_plus",
    language: "bilingual",
    populationGroups: ["chinese", "korean"],
    drinkingHabits: ["no_past_week_drinks", "avoids_heavy_drinking"],
    heightPreference: {
      presetIds: ["178_plus"],
      customRanges: [{ minCm: 168, maxCm: 175 }, { minCm: 183, maxCm: null }],
      displayUnit: "imperial"
    },
    looksPreference: {
      preset: "custom",
      customShare: 0.14
    },
    adultOnly: true,
    manualAssumptions: [
      ...defaults.map((assumption) =>
        assumption.id === "non_smoker"
          ? { ...assumption, enabled: true, share: 0.62 }
          : assumption
      ),
      ...(customAssumption ? [customAssumption] : [])
    ]
  };
}

describe("compact share state", () => {
  it("round-trips calculator filters through the compact payload", () => {
    const defaults = buildManualAssumptions();
    const filters = buildFilters();
    const payload = encodeShareState(filters);
    const decoded = decodeShareState(payload, defaults);

    expect(decoded.ok).toBe(true);
    expect(decoded.filters).toEqual(filters);
  });

  it("falls back cleanly on malformed payloads", () => {
    const defaults = buildManualAssumptions();
    const decoded = decodeShareState("definitely-not-a-valid-share-payload", defaults);

    expect(decoded.ok).toBe(false);
    expect(decoded.error).toBeTruthy();
    expect(decoded.filters.sex).toBe("all");
    expect(decoded.filters.geography).toBe("canada");
  });
});
