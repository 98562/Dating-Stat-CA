import type { Citation, SourceType } from "@/lib/types";

interface ApplyObservedCategoricalUnionStepInput {
  id: string;
  label: string;
  selectedValues: string[];
  selectedLabels: string[];
  countsByValue: Record<string, number>;
  denominatorCount: number;
  currentPopulation: number;
  sourceType: SourceType;
  citation: Citation;
  explanation: string;
  note: string;
  derivation: string;
  confidenceLevel?: "high" | "medium" | "low";
}

export function applyObservedCategoricalUnionStep({
  id,
  label,
  selectedValues,
  selectedLabels,
  countsByValue,
  denominatorCount,
  currentPopulation,
  sourceType,
  citation,
  explanation,
  note,
  derivation,
  confidenceLevel
}: ApplyObservedCategoricalUnionStepInput) {
  const numerator = selectedValues.reduce((sum, key) => sum + (countsByValue[key] ?? 0), 0);
  const numeratorShare = denominatorCount === 0 ? 0 : numerator / denominatorCount;

  return {
    id,
    label,
    filterValue: selectedLabels.join(", "),
    sourceType,
    citation,
    denominator: currentPopulation,
    share: numeratorShare,
    numeratorShare,
    priorPopulation: currentPopulation,
    remainingPopulation: Math.max(0, currentPopulation * numeratorShare),
    explanation,
    note,
    derivation,
    selectedValues: selectedLabels,
    confidenceLevel,
    conditioningUsed: [],
    omittedConditioning: []
  };
}
