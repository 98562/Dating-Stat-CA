import { launchConfig } from "@/config/launch";
import { legalLinks } from "@/config/legal";

export const monetizationConfig = {
  adsEnabled: launchConfig.adsEnabled,
  supportEnabled: launchConfig.supportEnabled && Boolean(legalLinks.supportHref),
  supportLabel: "Support the project",
  supportDescription:
    "Support links stay separate from ad inventory so the calculator does not feel monetization-first.",
  advertisingEnabled: launchConfig.advertisingEnabled,
  adProvider: "adsense",
  adsense: {
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",
    scriptSrc: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  }
} as const;
