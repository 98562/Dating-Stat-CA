import Link from "next/link";

import { AdSlotFooter } from "@/components/ads/ad-slot";
import { SiteBrand } from "@/components/brand/site-brand";
import { PrivacyPreferencesControl } from "@/components/layout/privacy-preferences-control";
import { legalLinks } from "@/config/legal";
import { monetizationConfig } from "@/config/monetization";
import { footerNav, siteConfig } from "@/config/site";
import { featureFlags } from "@/config/features";

export function SiteFooter() {
  const showFooterAd = featureFlags.adSlotsEnabled;

  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="mx-auto max-w-[1500px] px-4 py-12 md:px-6 xl:px-8">
        <div className={showFooterAd ? "grid gap-8 lg:grid-cols-[1.2fr,0.8fr]" : "grid gap-8"}>
          <div className="space-y-4">
            <SiteBrand showTagline />
            <p className="max-w-2xl text-sm text-ink-600">{siteConfig.description}</p>
            {monetizationConfig.supportEnabled ? (
              <div className="rounded-[28px] border border-black/5 bg-sand-50/80 p-4">
                <p className="text-sm font-semibold text-ink-900">{monetizationConfig.supportLabel}</p>
                <p className="mt-1 text-sm text-ink-600">{monetizationConfig.supportDescription}</p>
                {legalLinks.supportHref ? (
                  <Link
                    href={legalLinks.supportHref}
                    className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 ring-1 ring-black/10 transition hover:bg-sand-50"
                  >
                    Open support link
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-sand-100 px-3 py-2 text-sm text-ink-700 transition hover:bg-sand-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <PrivacyPreferencesControl />
          </div>

          {showFooterAd ? (
            <AdSlotFooter
              enabled={featureFlags.adSlotsEnabled}
              fallbackVariant="reserved"
              heightPreset="sm"
            />
          ) : null}
        </div>
      </div>
    </footer>
  );
}
