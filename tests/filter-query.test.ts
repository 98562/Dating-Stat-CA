import { describe, expect, it } from "vitest";

import { buildManualAssumptions } from "@/lib/data/loaders";
import { decodeFilters, encodeFilters } from "@/lib/filter-query";
import { buildCustomManualAssumption } from "@/lib/manual-assumptions";

describe("filter query custom assumptions", () => {
  it("round-trips custom optional filters through the readable query format", () => {
    const defaults = buildManualAssumptions();
    const customAssumption = buildCustomManualAssumption(
      defaults,
      "okay with long distance",
      0.47
    );

    const filters = {
      geography: "bc" as const,
      ageRange: { min: 26, max: 36 },
      sex: "women" as const,
      maritalStatus: "never_married" as const,
      education: "bachelors_plus" as const,
      income: "80k_plus" as const,
      language: "english" as const,
      populationGroups: [],
      drinkingHabits: [],
      heightPreference: {
        presetIds: [],
        customRanges: [],
        displayUnit: "cm" as const
      },
      looksPreference: {
        preset: "any" as const,
        customShare: 0.1
      },
      adultOnly: true,
      manualAssumptions: [
        ...defaults,
        ...(customAssumption ? [customAssumption] : [])
      ]
    };

    const query = encodeFilters(filters);
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    const decoded = decodeFilters(params, buildManualAssumptions());
    const decodedCustom = decoded.manualAssumptions.find((assumption) => assumption.isCustom);

    expect(decodedCustom?.label).toBe("okay with long distance");
    expect(decodedCustom?.share).toBeCloseTo(0.47);
    expect(decodedCustom?.enabled).toBe(true);
  });
});
