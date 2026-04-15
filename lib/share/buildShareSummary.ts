import { buildSharePreview } from "@/lib/share/buildSharePreview";
import { buildShareUrl } from "@/lib/share/buildShareUrl";
import type { CalculationResult, CalculatorFilters } from "@/lib/types";

export function buildShareSummary(filters: CalculatorFilters, result: CalculationResult) {
  const preview = buildSharePreview(filters, result, 4);
  const link = buildShareUrl(filters);

  return [
    `This setup leaves roughly ${preview.estimatedPool} in ${preview.geographyLabel}.`,
    `That works out to ${preview.oneInX}.`,
    `Key filters: ${preview.keyFilters.join(", ")}.`,
    `Read: ${preview.strictnessLabel}.`,
    preview.interpretation,
    link
  ].join("\n");
}

export function buildShareDescription(filters: CalculatorFilters, result: CalculationResult) {
  const preview = buildSharePreview(filters, result, 3);

  return `Shared result: ${preview.estimatedPool} in ${preview.geographyLabel}. ${preview.oneInX}. Key filters: ${preview.keyFilters.join(", ")}. ${preview.interpretation}`;
}
