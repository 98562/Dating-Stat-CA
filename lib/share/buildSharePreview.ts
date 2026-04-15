import { siteConfig } from "@/config/site";
import { GEO_LABELS } from "@/lib/constants";
import { formatOneInX, formatPeople, formatStrictness } from "@/lib/format";
import { getResultInterpretation } from "@/lib/result-insights";
import { selectKeyShareFilters } from "@/lib/share/selectKeyShareFilters";
import type { CalculationResult, CalculatorFilters } from "@/lib/types";

export interface SharePreviewData {
  geographyLabel: string;
  estimatedPool: string;
  oneInX: string;
  strictnessLabel: string;
  interpretation: string;
  keyFilters: string[];
  headline: string;
  subheadline: string;
  title: string;
  description: string;
}

export function buildSharePreview(
  filters: CalculatorFilters,
  result: CalculationResult,
  keyFilterCount = 4
): SharePreviewData {
  const geographyLabel = GEO_LABELS[filters.geography];
  const estimatedPool = formatPeople(result.finalPopulation);
  const oneInX = formatOneInX(result.oneInX);
  const strictnessLabel = formatStrictness(result.strictness);
  const interpretation = getResultInterpretation(result).main;
  const keyFilters = selectKeyShareFilters(filters, keyFilterCount);
  const headline = `${estimatedPool} in ${geographyLabel}`;
  const subheadline = `${oneInX}. ${interpretation}`;
  const title = `${siteConfig.productLabel} | ${oneInX} in ${geographyLabel}`;
  const description = `Roughly ${estimatedPool} match this setup in ${geographyLabel}. ${strictnessLabel}. Filters: ${keyFilters.join(", ")}.`;

  return {
    geographyLabel,
    estimatedPool,
    oneInX,
    strictnessLabel,
    interpretation,
    keyFilters,
    headline,
    subheadline,
    title,
    description
  };
}
