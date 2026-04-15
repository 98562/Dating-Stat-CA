import type { Citation } from "@/lib/types";

interface ApplyAssumptionShareStepInput {
  id: string;
  label: string;
  filterValue: string;
  currentPopulation: number;
  share: number;
  citation: Citation;
  explanation: string;
  note: string;
  derivation: string;
  selectedValues?: string[];
}

export function applyAssumptionShareStep({
  id,
  label,
  filterValue,
  currentPopulation,
  share,
  citation,
  explanation,
  note,
  derivation,
  selectedValues
}: ApplyAssumptionShareStepInput) {
  return {
    id,
    label,
    filterValue,
    sourceType: "assumption" as const,
    citation,
    denominator: currentPopulation,
    share,
    numeratorShare: share,
    priorPopulation: currentPopulation,
    remainingPopulation: Math.max(0, currentPopulation * share),
    explanation,
    note,
    derivation,
    selectedValues,
    confidenceLevel: "low" as const,
    conditioningUsed: [],
    omittedConditioning: []
  };
}
