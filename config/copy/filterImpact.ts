import type { SourceType } from "@/lib/types";

export const filterImpactThresholds = {
  noticeable: 0.6,
  meaningful: 0.35,
  substantial: 0.12,
  lateStagePoolShare: 0.15
};

export const filterImpactCopy: Record<
  SourceType,
  {
    noticeable: string;
    meaningful: string;
    substantial: string;
    lateStage: string;
  }
> = {
  observed: {
    noticeable: "This preference had a noticeable effect.",
    meaningful: "This is one of the more consequential filters in the stack.",
    substantial: "This filter removed a substantial share of the remaining pool.",
    lateStage: "At this stage, each added preference has a larger effect."
  },
  estimated: {
    noticeable: "This preference had a noticeable effect.",
    meaningful: "This estimated step narrowed the result considerably.",
    substantial: "This is one of the sharper drops in the stack.",
    lateStage: "At this stage, each added preference has a larger effect."
  },
  assumption: {
    noticeable: "This assumption had a noticeable effect.",
    meaningful: "This assumption narrowed the result considerably.",
    substantial: "This assumption removed a substantial share of the remaining pool.",
    lateStage: "At this stage, user assumptions are carrying a lot of the narrowing."
  }
};
