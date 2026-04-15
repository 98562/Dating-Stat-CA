import type { HeightRange } from "@/config/filters/height";

import { mergeOverlappingRanges } from "@/lib/calculation/utils/mergeOverlappingRanges";

export function normalizeRanges(ranges: HeightRange[]) {
  const sanitized = ranges
    .map((range) => {
      const min = Math.max(120, Math.round(range.minCm));
      const max =
        range.maxCm === null ? null : Math.max(min, Math.round(range.maxCm));

      return {
        minCm: min,
        maxCm: max
      };
    })
    .filter((range) => range.maxCm === null || range.maxCm >= range.minCm);

  return mergeOverlappingRanges(sanitized);
}
