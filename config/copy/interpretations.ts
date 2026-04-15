import type { StrictnessLevel, SourceType } from "@/lib/types";

export const interpretationCopy: Record<
  StrictnessLevel,
  {
    main: string;
    fallbackSubline: string;
  }
> = {
  broad: {
    main: "Fairly open-ended by the standards of this tool.",
    fallbackSubline: "One or two extra filters would change this more than you might think."
  },
  selective: {
    main: "Somewhat selective, but still broad enough to be plausible.",
    fallbackSubline: "This is still a pool with some breathing room."
  },
  quite_selective: {
    main: "A relatively narrow pool.",
    fallbackSubline: "At this point, each added preference starts to matter more."
  },
  narrow: {
    main: "This is becoming quite specific.",
    fallbackSubline: "The number is still useful, but it is now more illustrative than casual."
  },
  very_narrow: {
    main: "At this point, the pool is statistically quite small.",
    fallbackSubline: "Best read as perspective rather than a literal forecast."
  }
};

export const interpretationQualitySubline: Record<SourceType, string> = {
  observed: "A relatively large share of this result still comes from directly published tables.",
  estimated: "Some of this narrowing comes from combining the best available public distributions.",
  assumption: "Some of this narrowing comes from choices you supplied rather than published data."
};
