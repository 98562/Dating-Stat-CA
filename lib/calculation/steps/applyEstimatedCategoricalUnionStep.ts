import type { Citation } from "@/lib/types";

interface ApplyEstimatedCategoricalUnionStepInput {
  id: string;
  label: string;
  filterValue: string;
  currentPopulation: number;
  share: number;
  citation: Citation;
  explanation: string;
  note: string;
  derivation: string;
  selectedValues: string[];
  confidenceLevel?: "high" | "medium" | "low";
}

export function applyEstimatedCategoricalUnionStep({
  id,
  label,
  filterValue,
  currentPopulation,
  share,
  citation,
  explanation,
  note,
  derivation,
  selectedValues,
  confidenceLevel
}: ApplyEstimatedCategoricalUnionStepInput) {
  return {
    id,
    label,
    filterValue,
    sourceType: "estimated" as const,
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
    confidenceLevel,
    conditioningUsed: [],
    omittedConditioning: []
  };
}
