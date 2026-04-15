import Link from "next/link";

import { AdSlotInline } from "@/components/ads/ad-slot";
import { CalculatorShell } from "@/components/calculator/calculator-shell";
import { MissingDatasetState } from "@/components/content/dataset-state";
import { FaqList } from "@/components/content/faq-list";
import { FeaturedPresets } from "@/components/content/featured-presets";
import { SectionHeading } from "@/components/content/section-heading";
import { Disclosure } from "@/components/ui/disclosure";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  homepageExplainer,
  homepageHero,
  homepageSections
} from "@/config/copy/homepage";
import { featureFlags } from "@/config/features";
import { seoConfig } from "@/config/seo";
import { faqItems } from "@/content/faq";
import { buildMetadata } from "@/lib/seo/metadata";
import { decodeFilters } from "@/lib/filter-query";
import { buildManualAssumptions, loadNormalizedDataset } from "@/lib/data/loaders";

export const metadata = buildMetadata({
  title: seoConfig.productName,
  description: seoConfig.defaultDescription,
  path: "/"
});

export default async function Page({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const defaults = buildManualAssumptions();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialFilters = decodeFilters(resolvedSearchParams, defaults);

  try {
    const dataset = await loadNormalizedDataset();

    return (
      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-6 xl:px-8">
        <section className="grid gap-8 xl:grid-cols-[1fr,0.72fr] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">
              {homepageHero.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink-900 md:text-6xl">
              {homepageHero.title}
            </h1>
            <p className="mt-4 hidden max-w-3xl text-lg text-ink-600 sm:block">
              {homepageHero.subtitle}
            </p>
            <p className="mt-4 text-base text-ink-600 sm:hidden">
              Part published data, part estimate, part your own assumptions.
            </p>
            <div className="mt-5 inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-ink-700 shadow-soft">
              {homepageHero.note}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-white shadow-soft"
              >
                {homepageHero.primaryCtaLabel}
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-900 ring-1 ring-black/10"
              >
                {homepageHero.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-4 sm:hidden">
              <Disclosure
                title="How it works"
                description="Short version first. The fuller explanation can stay tucked away."
              >
                <div className="grid gap-3 pt-1 text-sm text-ink-600">
                  {homepageExplainer.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </Disclosure>
            </div>
          </div>

          <Card className="hidden xl:block">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 text-sm text-ink-600">
              {homepageExplainer.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <SectionHeading
            eyebrow="Quick try"
            title={homepageSections.calculatorTitle}
            description="Set the main filters here, get a compact read immediately, and open the full calculator if you want the deeper breakdown."
            className="mb-6"
          />
          <CalculatorShell dataset={dataset} initialFilters={initialFilters} mode="preview" />
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Presets"
            title={homepageSections.presetsTitle}
            description="Preset cards inherit the Men+ or Women+ choice from the calculator above, so they stop short of guessing that part for you."
            className="mb-6"
          />
          <FeaturedPresets />
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="FAQ"
            title={homepageSections.faqTitle}
            description={homepageSections.faqDescription}
            className="mb-6"
          />
          <FaqList items={faqItems.slice(0, 4)} />
        </section>

        <section className="mt-16">
          <Card className="border-black/5 bg-white/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About this tool</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="max-w-5xl text-sm leading-7 text-ink-600">
                {seoConfig.crawlerDescription}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 space-y-4">
          <Disclosure
            title="Methodology notes"
            description="The limitations are still visible, just kept lower on the page."
          >
            <div className="grid gap-6 xl:grid-cols-[1fr,0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology teaser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
                  <p>
                    Observed means the share came directly from a published cross-tab. Estimated means the app had to combine compatible official distributions because the exact public combination does not exist. Assumption means you chose part of the narrowing yourself.
                  </p>
                  <p>Useful for perspective. Not a substitute for real life.</p>
                  <Link href="/methodology" className="font-medium text-accent-700">
                    Read the full methodology
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
                  <p>
                    The app uses official Canadian data where it can, estimates where it must, and labels assumptions clearly instead of pretending every preference is equally observable.
                  </p>
                  <Link href="/sources" className="font-medium text-accent-700">
                    Browse source notes
                  </Link>
                </CardContent>
              </Card>
            </div>
          </Disclosure>
        </section>

        {featureFlags.adSlotsEnabled ? (
          <section className="mt-16">
            <AdSlotInline
              enabled={featureFlags.adSlotsEnabled}
              fallbackVariant="future"
              heightPreset="sm"
            />
          </section>
        ) : null}
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Unavailable right now"
          title="The calculator data is temporarily unavailable"
          description="The calculator needs the local normalized dataset to render live results."
          className="mb-8"
        />
        <MissingDatasetState />
      </div>
    );
  }
}
