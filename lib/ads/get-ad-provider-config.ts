import { monetizationConfig } from "@/config/monetization";

export function getAdProviderConfig() {
  const clientId = monetizationConfig.adsense.clientId.trim();
  const shouldInitialize = Boolean(clientId);

  return {
    provider: monetizationConfig.adProvider,
    clientId,
    scriptSrc: monetizationConfig.adsense.scriptSrc,
    shouldInitialize
  } as const;
}
