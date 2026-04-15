import type { StrictnessLevel } from "@/lib/types";

export const strictnessScale: Array<{
  level: StrictnessLevel;
  minShare: number;
  label: string;
  description: string;
  meterIndex: number;
}> = [
  {
    level: "broad",
    minShare: 0.1,
    label: "Broad",
    description: "There is still plenty of room left in the pool.",
    meterIndex: 1
  },
  {
    level: "selective",
    minShare: 0.03,
    label: "Selective",
    description: "You are filtering meaningfully, but not dramatically yet.",
    meterIndex: 2
  },
  {
    level: "quite_selective",
    minShare: 0.008,
    label: "Quite selective",
    description: "The result is now clearly narrower than the starting population.",
    meterIndex: 3
  },
  {
    level: "narrow",
    minShare: 0.0015,
    label: "Narrow",
    description: "The stack is getting specific enough to noticeably compress the pool.",
    meterIndex: 4
  },
  {
    level: "very_narrow",
    minShare: 0,
    label: "Very narrow",
    description: "Small changes now have outsized effects on the final count.",
    meterIndex: 5
  }
];
