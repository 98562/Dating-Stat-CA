import { strictnessScale } from "@/config/copy/strictness";
import type { StrictnessLevel } from "@/lib/types";

export function getStrictnessLevel(share: number): StrictnessLevel {
  for (const tier of strictnessScale) {
    if (share >= tier.minShare) {
      return tier.level;
    }
  }

  return "very_narrow";
}

export function getStrictnessCopy(level: StrictnessLevel) {
  return (
    strictnessScale.find((tier) => tier.level === level)?.description ??
    "The funnel remains numerically grounded."
  );
}
