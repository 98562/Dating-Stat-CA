"use client";

import Script from "next/script";

import { getAdProviderConfig } from "@/lib/ads/get-ad-provider-config";

export function AdProvider() {
  const config = getAdProviderConfig();

  if (!config.shouldInitialize || config.provider !== "adsense") {
    return null;
  }

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`${config.scriptSrc}?client=${config.clientId}`}
      crossOrigin="anonymous"
    />
  );
}
