import { cache } from "react";

import { calculateProbability } from "@/lib/calculator";
import { buildManualAssumptions, loadNormalizedDataset } from "@/lib/data/loaders";
import { decodeShareState } from "@/lib/share/decodeState";

export const resolveSharedResult = cache(async (payload: string) => {
  const defaults = buildManualAssumptions();
  const decoded = decodeShareState(payload, defaults);

  try {
    const dataset = await loadNormalizedDataset();

    if (!decoded.ok) {
      return {
        ok: false as const,
        decoded,
        dataset,
        result: null
      };
    }

    return {
      ok: true as const,
      decoded,
      dataset,
      result: calculateProbability(dataset, decoded.filters)
    };
  } catch {
    return {
      ok: decoded.ok as boolean,
      decoded,
      dataset: null,
      result: null
    };
  }
});
