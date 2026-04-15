import { filterImpactCopy, filterImpactThresholds } from "@/config/copy/filterImpact";
import {
  interpretationCopy,
  interpretationQualitySubline
} from "@/config/copy/interpretations";
import type { CalculationResult, CalculationStep } from "@/lib/types";

export function getResultInterpretation(result: CalculationResult) {
  const base = interpretationCopy[result.strictness];
  const assumptionCount = result.steps.filter((step) => step.sourceType === "assumption").length;
  const estimatedCount = result.steps.filter((step) => step.sourceType === "estimated").length;

  let subline = base.fallbackSubline;
  if (assumptionCount > 0) {
    subline = interpretationQualitySubline.assumption;
  } else if (estimatedCount > 0) {
    subline = interpretationQualitySubline.estimated;
  } else {
    subline = interpretationQualitySubline.observed;
  }

  return {
    main: base.main,
    subline
  };
}

export function getFilterImpactNote(
  step: CalculationStep,
  relevantPopulation: number
) {
  if (step.share > filterImpactThresholds.noticeable) {
    return null;
  }

  const copy = filterImpactCopy[step.sourceType];
  const stageShare = relevantPopulation > 0 ? step.priorPopulation / relevantPopulation : 1;

  if (stageShare <= filterImpactThresholds.lateStagePoolShare) {
    return copy.lateStage;
  }

  if (step.share <= filterImpactThresholds.substantial) {
    return copy.substantial;
  }

  if (step.share <= filterImpactThresholds.meaningful) {
    return copy.meaningful;
  }

  return copy.noticeable;
}
