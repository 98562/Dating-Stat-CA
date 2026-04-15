"use client";

import { AdSlotInline, AdSlotSidebar, AdSlotTop } from "@/components/ads/ad-slot";
import type { CalculatorLayoutProps } from "@/components/calculator/calculator-layout-types";
import { FilterPanel } from "@/components/calculator/filter-panel";
import { PreviewContext } from "@/components/calculator/preview-context";
import { ResultsPanel } from "@/components/calculator/results-panel";
import { ShareActions } from "@/components/share/share-actions";
import { featureFlags } from "@/config/features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DesktopCalculatorLayout({
  filterPanelProps,
  resultsPanelProps
}: CalculatorLayoutProps) {
  const { filters, result, dataset, mode } = resultsPanelProps;

  return (
    <div className="hidden space-y-6 lg:block">
      {mode === "full" && featureFlags.adSlotsEnabled ? (
        <AdSlotTop
          enabled={featureFlags.adSlotsEnabled}
          fallbackVariant="future"
          heightPreset="sm"
          className="hidden lg:block"
        />
      ) : null}

      <div
        className={
          mode === "full"
            ? "grid gap-6 xl:grid-cols-[440px,minmax(0,1fr)] 2xl:grid-cols-[480px,minmax(0,1fr),280px]"
            : "grid gap-6 xl:grid-cols-[minmax(0,1.9fr),minmax(320px,0.95fr)] xl:items-start"
        }
      >
        <div className="space-y-6">
          <FilterPanel
            {...filterPanelProps}
            defaultOpenDisclosures={mode === "full"}
          />
        </div>

        <div className={mode === "preview" ? "space-y-6 xl:sticky xl:top-24 xl:self-start" : "space-y-6"}>
          <ResultsPanel {...resultsPanelProps} />

          {mode === "full" && featureFlags.adSlotsEnabled ? (
            <AdSlotInline
              enabled={featureFlags.adSlotsEnabled}
              fallbackVariant="sponsored"
              heightPreset="sm"
            />
          ) : null}
        </div>

        {mode === "full" ? (
          <div className="hidden 2xl:block">
            <div className="sticky top-24 space-y-6">
              {featureFlags.adSlotsEnabled ? (
                <AdSlotSidebar
                  enabled={featureFlags.adSlotsEnabled}
                  fallbackVariant="reserved"
                  heightPreset="lg"
                />
              ) : null}
              <Card>
                <CardHeader>
                  <CardTitle>Reading the output</CardTitle>
                  <CardDescription>
                    A quick guide to the result panel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
                  <p>
                    The big number is the estimated count of people remaining after every active
                    filter.
                  </p>
                  <p>
                    The denominator stays explicit so percentages never float without context.
                  </p>
                  <p>
                    If the badge says Estimated or Assumption, treat the result as a useful guide rather than an exact count.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>

      {mode === "preview" ? (
        <div className="grid gap-6 xl:grid-cols-[0.78fr,1.22fr] xl:items-start">
          <PreviewContext dataset={dataset} filters={filters} result={result} />
          <ShareActions
            filters={filters}
            result={result}
            title="Share this setup"
            description="Share a compact link or a short summary without exposing the full raw filter query."
          />
        </div>
      ) : null}
    </div>
  );
}
