import { launchConfig } from "@/config/launch";
import { monetizationConfig } from "@/config/monetization";
import { privacyConfig } from "@/config/privacy";
import { productConfig } from "@/config/product";

export const featureFlags = {
  adultOnly: productConfig.adultOnly,
  compareMode: launchConfig.compareModeEnabled,
  adSlotsEnabled: monetizationConfig.adsEnabled,
  supportEnabled: monetizationConfig.supportEnabled,
  analyticsEnabled: privacyConfig.analyticsEnabled,
  advertisingEnabled: privacyConfig.advertisingEnabled,
  consentUiEnabled: privacyConfig.consentUiEnabled,
  provinceRankingEnabled: launchConfig.advancedExperimentalFeaturesEnabled,
  manualAssumptionsEnabled: true,
  extraFilterGroupsEnabled: launchConfig.advancedExperimentalFeaturesEnabled
} as const;
