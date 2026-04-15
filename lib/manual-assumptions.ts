import type { ManualAssumptionSelection } from "@/lib/types";

export const MAX_CUSTOM_MANUAL_ASSUMPTIONS = 3;
export const CUSTOM_MANUAL_ASSUMPTION_PREFIX = "custom_assumption_";
export const CUSTOM_MANUAL_ASSUMPTION_DESCRIPTION =
  "Custom optional filter. This is your assumption, not an official dataset.";
export const DEFAULT_CUSTOM_MANUAL_ASSUMPTION_SHARE = 0.5;

export function isCustomManualAssumption(assumption: Pick<ManualAssumptionSelection, "isCustom">) {
  return assumption.isCustom;
}

export function getCustomManualAssumptions(assumptions: ManualAssumptionSelection[]) {
  return assumptions.filter(isCustomManualAssumption);
}

export function buildCustomManualAssumption(
  assumptions: ManualAssumptionSelection[],
  label: string,
  share = DEFAULT_CUSTOM_MANUAL_ASSUMPTION_SHARE
): ManualAssumptionSelection | null {
  const trimmedLabel = label.trim();

  if (!trimmedLabel) {
    return null;
  }

  const customAssumptions = getCustomManualAssumptions(assumptions);
  if (customAssumptions.length >= MAX_CUSTOM_MANUAL_ASSUMPTIONS) {
    return null;
  }

  const highestExistingIndex = customAssumptions.reduce((highest, assumption) => {
    const suffix = Number(assumption.id.replace(CUSTOM_MANUAL_ASSUMPTION_PREFIX, ""));
    return Number.isFinite(suffix) ? Math.max(highest, suffix) : highest;
  }, 0);

  return {
    id: `${CUSTOM_MANUAL_ASSUMPTION_PREFIX}${highestExistingIndex + 1}`,
    label: trimmedLabel,
    description: CUSTOM_MANUAL_ASSUMPTION_DESCRIPTION,
    defaultShare: share,
    enabled: true,
    share,
    isCustom: true
  };
}
