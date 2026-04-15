import { launchConfig } from "@/config/launch";

export const privacyConfig = {
  analyticsEnabled: launchConfig.analyticsEnabled,
  advertisingEnabled: launchConfig.advertisingEnabled,
  consentUiEnabled:
    launchConfig.consentUiEnabled &&
    (launchConfig.analyticsEnabled || launchConfig.advertisingEnabled),
  storageKey: "ideal-partner-probability:consent-preferences:v1",
  categories: [
    {
      key: "necessary",
      label: "Necessary",
      description:
        "Required for core site behavior such as routing, rendering, and your saved privacy preferences.",
      required: true
    },
    {
      key: "analytics",
      label: "Analytics",
      description:
        "Optional measurement for understanding broad site usage and improving the product.",
      required: false
    },
    {
      key: "advertising",
      label: "Advertising",
      description:
        "Optional consent for future ad or sponsor technology if that layer is turned on later.",
      required: false
    }
  ]
} as const;
