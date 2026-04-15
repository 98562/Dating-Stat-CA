import type { HeightRange } from "@/config/filters/height";

export function mergeOverlappingRanges(ranges: HeightRange[]) {
  if (!ranges.length) return [];

  const sorted = [...ranges].sort((left, right) => left.minCm - right.minCm);
  const merged: HeightRange[] = [];

  for (const range of sorted) {
    const previous = merged.at(-1);

    if (!previous) {
      merged.push({ ...range });
      continue;
    }

    const previousMax = previous.maxCm ?? Number.POSITIVE_INFINITY;
    const currentMax = range.maxCm ?? Number.POSITIVE_INFINITY;

    if (range.minCm <= previousMax + 1) {
      previous.maxCm =
        previous.maxCm === null || range.maxCm === null
          ? null
          : Math.max(previous.maxCm, range.maxCm);
      if (currentMax === Number.POSITIVE_INFINITY) {
        previous.maxCm = null;
      }
      continue;
    }

    merged.push({ ...range });
  }

  return merged;
}
