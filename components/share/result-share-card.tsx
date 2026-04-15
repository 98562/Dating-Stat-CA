"use client";

import { siteConfig } from "@/config/site";
import { BrandMark } from "@/components/brand/site-brand";
import { Badge } from "@/components/ui/badge";
import {
  formatOneInX,
  formatPeople,
  formatStrictness
} from "@/lib/format";
import { getResultInterpretation } from "@/lib/result-insights";
import { selectKeyShareFilters } from "@/lib/share/selectKeyShareFilters";
import type { CalculationResult, CalculatorFilters } from "@/lib/types";

interface ResultShareCardProps {
  filters: CalculatorFilters;
  result: CalculationResult;
  compact?: boolean;
}

export function ResultShareCard({
  filters,
  result,
  compact = false
}: ResultShareCardProps) {
  const interpretation = getResultInterpretation(result);
  const keyFilters = selectKeyShareFilters(filters, compact ? 3 : 4);

  return (
    <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#fffdf9_0%,#ffffff_58%,#f7fbfa_100%)] p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-700">
              {siteConfig.productLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-900">{siteConfig.shortName}</p>
          </div>
        </div>
        <Badge tone="neutral">{formatStrictness(result.strictness)}</Badge>
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-sm font-medium text-ink-500">Estimated pool</p>
        <p className="font-serif text-3xl leading-tight text-ink-900">
          {formatPeople(result.finalPopulation)}
        </p>
        <p className="text-sm text-ink-600">{formatOneInX(result.oneInX)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {keyFilters.map((filter) => (
          <span
            key={filter}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-black/8"
          >
            {filter}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink-600">
        {compact ? interpretation.main : interpretation.subline}
      </p>
    </div>
  );
}
