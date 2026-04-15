"use client";

import { SourceBadge } from "@/components/calculator/source-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPeople, formatPercent } from "@/lib/format";
import type { CalculationResult, CalculatorFilters, NormalizedDataset } from "@/lib/types";

interface PreviewContextProps {
  dataset: NormalizedDataset;
  filters: CalculatorFilters;
  result: CalculationResult;
}

export function PreviewContext({
  dataset,
  filters,
  result
}: PreviewContextProps) {
  const mostConsequentialStep = result.steps.reduce<CalculationResult["steps"][number] | null>(
    (currentWorst, step) => {
      if (!currentWorst || step.share < currentWorst.share) {
        return step;
      }

      return currentWorst;
    },
    null
  );

  return (
    <Card className="bg-white/80">
      <CardHeader className="space-y-1 p-5 pb-0">
        <CardTitle>Quick context</CardTitle>
        <CardDescription>A supporting read, not a second feature block.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5 p-5 pt-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-sand-50 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            Denominator
          </p>
          <p className="mt-1 text-sm font-medium text-ink-900">
            {Math.round(result.relevantPopulation).toLocaleString("en-CA")}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {dataset.populationEstimates[filters.geography].label}
          </p>
        </div>
        {mostConsequentialStep ? (
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Biggest drop
            </p>
            <p className="mt-1 text-sm font-medium text-ink-900">{mostConsequentialStep.label}</p>
            <p className="mt-1 text-xs text-ink-500">
              {formatPercent(mostConsequentialStep.share)} survived.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Biggest drop
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Add a couple more filters and this will light up.
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-black/5 bg-sand-50 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            Quality
          </p>
          <div className="mt-2">
            <SourceBadge sourceType={result.quality} showSupport />
          </div>
          <p className="mt-2 text-xs text-ink-500">
            {result.finalPopulation < 1
              ? "Currently below one estimated person."
              : `${formatPeople(result.finalPopulation)} remain.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
