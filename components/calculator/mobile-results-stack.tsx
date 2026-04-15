"use client";

import { useEffect, useMemo, useState } from "react";

import { PRESETS } from "@/config/presets";
import { strictnessScale } from "@/config/copy/strictness";
import { SourceBadge } from "@/components/calculator/source-badge";
import { ShareActions } from "@/components/share/share-actions";
import { featureFlags } from "@/config/features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/select";
import {
  describeComparison,
  formatInteger,
  formatOneInX,
  formatPeople,
  formatPercent,
  formatStrictness
} from "@/lib/format";
import { buildPresetScenarioComparison, buildScenarioComparisons } from "@/lib/scenario-comparisons";
import { getFilterImpactNote, getResultInterpretation } from "@/lib/result-insights";
import { getStrictnessCopy } from "@/lib/strictness";
import type { CalculationResult, CalculatorFilters, NormalizedDataset } from "@/lib/types";

interface MobileResultsStackProps {
  dataset: NormalizedDataset;
  filters: CalculatorFilters;
  result: CalculationResult;
  activePresetId: string;
  mode: "preview" | "full";
  onOpenMethodology: () => void;
  onOpenSources: () => void;
}

function StrictnessMeter({
  level
}: {
  level: CalculationResult["strictness"];
}) {
  const activeIndex =
    strictnessScale.find((tier) => tier.level === level)?.meterIndex ??
    strictnessScale.length;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {strictnessScale.map((tier) => (
          <div
            key={tier.level}
            className={
              tier.meterIndex <= activeIndex
                ? "h-2 flex-1 rounded-full bg-accent-500"
                : "h-2 flex-1 rounded-full bg-sand-200"
            }
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">
        <span>Broad</span>
        <span>Very narrow</span>
      </div>
    </div>
  );
}

function MobileScenarioCard({
  title,
  leftLabel,
  rightLabel,
  leftResult,
  rightResult,
  note
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftResult: CalculationResult;
  rightResult: CalculationResult;
  note: string;
}) {
  const difference = rightResult.finalPopulation - leftResult.finalPopulation;

  return (
    <div className="rounded-3xl border border-black/5 bg-sand-50/70 p-4">
      <p className="font-medium text-ink-900">{title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {leftLabel}
          </p>
          <p className="mt-1 text-lg font-semibold text-ink-900">
            {formatPeople(leftResult.finalPopulation)}
          </p>
          <p className="text-sm text-ink-500">{formatOneInX(leftResult.oneInX)}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {rightLabel}
          </p>
          <p className="mt-1 text-lg font-semibold text-ink-900">
            {formatPeople(rightResult.finalPopulation)}
          </p>
          <p className="text-sm text-ink-500">{formatOneInX(rightResult.oneInX)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-ink-900">
        {difference === 0
          ? "These two versions currently land in the same place."
          : difference > 0
            ? `${rightLabel} adds about ${formatInteger(difference)} more people.`
            : `${leftLabel} keeps about ${formatInteger(Math.abs(difference))} more people.`}
      </p>
      <p className="mt-2 text-sm text-ink-600">{note}</p>
    </div>
  );
}

export function MobileResultsStack({
  dataset,
  filters,
  result,
  activePresetId,
  mode,
  onOpenMethodology,
  onOpenSources
}: MobileResultsStackProps) {
  const interpretation = getResultInterpretation(result);
  const shareOfRelevantPopulation =
    result.relevantPopulation > 0 ? result.finalPopulation / result.relevantPopulation : 0;
  const isEmpty = result.finalPopulation < 1;
  const zeroStep = result.steps.find((step) => step.remainingPopulation < 1);
  const scenarioComparisons = useMemo(
    () => buildScenarioComparisons(dataset, filters),
    [dataset, filters]
  );
  const [leftPresetId, setLeftPresetId] = useState(activePresetId || PRESETS[0]?.id || "");
  const [rightPresetId, setRightPresetId] = useState(PRESETS[1]?.id || PRESETS[0]?.id || "");

  useEffect(() => {
    if (activePresetId) {
      setLeftPresetId(activePresetId);
    }
  }, [activePresetId]);

  const presetScenario = useMemo(
    () =>
      filters.sex === "all"
        ? null
        : buildPresetScenarioComparison(dataset, filters, leftPresetId, rightPresetId),
    [dataset, filters, leftPresetId, rightPresetId]
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#fffdf9_0%,#ffffff_60%,#f7fbfa_100%)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge sourceType={result.quality} showSupport />
            <Badge tone="neutral">{formatStrictness(result.strictness)}</Badge>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">
              Live result
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink-900">
              {formatPeople(result.finalPopulation)}
            </h2>
            <p className="text-sm text-ink-600">{interpretation.main}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-black/5 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                1 in X
              </p>
              <p className="mt-2 text-xl font-semibold text-ink-900">
                {formatOneInX(result.oneInX)}
              </p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                Share
              </p>
              <p className="mt-2 text-xl font-semibold text-ink-900">
                {formatPercent(shareOfRelevantPopulation)}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Of {Math.round(result.relevantPopulation).toLocaleString("en-CA")} people.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Strictness
            </p>
            <div className="mt-3">
              <StrictnessMeter level={result.strictness} />
            </div>
            <p className="mt-3 text-lg font-semibold text-ink-900">
              {formatStrictness(result.strictness)}
            </p>
            <p className="mt-1 text-sm text-ink-500">{getStrictnessCopy(result.strictness)}</p>
          </div>
        </CardContent>
      </Card>

      <ShareActions
        filters={filters}
        result={result}
        description="Compact sharing stays easy to reach on mobile too."
      />

      <Disclosure
        title={mode === "full" ? "Deeper analysis" : "More detail"}
        description={
          mode === "full"
            ? "Open the log, comparisons, and place-sized context when you want the longer read."
            : "A little extra context, still lighter than the full desktop dashboard."
        }
      >
        <div className="space-y-4">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-4">
            <p className="text-sm font-medium text-ink-900">Interpretation</p>
            <p className="mt-2 text-sm text-ink-600">{interpretation.subline}</p>
          </div>

          <Disclosure
            title="Calculation log"
            description="Step-by-step, but stacked for a smaller screen."
            defaultOpen={mode === "full"}
          >
            <div className="space-y-3">
              <div className="rounded-3xl border border-black/5 p-4">
                <p className="font-medium text-ink-900">Start</p>
                <p className="mt-1 text-sm text-ink-500">
                  Latest population estimate for {dataset.populationEstimates[filters.geography].label}
                </p>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {formatPeople(result.relevantPopulation)}
                </p>
              </div>
              {result.steps.map((step) => {
                const impactNote = getFilterImpactNote(step, result.relevantPopulation);

                return (
                  <div
                    key={step.id}
                    className={
                      step.sourceType === "assumption"
                        ? "rounded-3xl border border-ink-900/10 bg-ink-900/[0.03] p-4"
                        : step.sourceType === "estimated"
                          ? "rounded-3xl border border-gold-300/40 bg-gold-100/20 p-4"
                          : "rounded-3xl border border-black/5 p-4"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">{step.label}</p>
                        <p className="text-sm text-ink-500">{step.filterValue}</p>
                      </div>
                      <SourceBadge sourceType={step.sourceType} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm">
                      <p className="text-ink-500">Previous: {formatPeople(step.priorPopulation)}</p>
                      <p className="font-medium text-ink-900">
                        Remaining: {formatPeople(step.remainingPopulation)}
                      </p>
                      <p className="text-ink-500">{formatPercent(step.share)} survived this step</p>
                    </div>
                    <p className="mt-3 text-sm text-ink-500">{step.explanation}</p>
                    {impactNote ? (
                      <div className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm text-ink-700 ring-1 ring-black/5">
                        {impactNote}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Disclosure>

          {mode === "full" && featureFlags.compareMode ? (
            <Disclosure
              title="Scenario comparisons"
              description="See how nearby versions of your filters change the pool."
            >
              <div className="space-y-4">
                {scenarioComparisons.map((scenario) => (
                  <MobileScenarioCard key={scenario.id} {...scenario} />
                ))}
                <div className="rounded-3xl border border-black/5 bg-sand-50/70 p-4">
                  <p className="font-medium text-ink-900">Preset A vs Preset B</p>
                  {filters.sex === "all" ? (
                    <p className="mt-2 text-sm text-ink-600">
                      Choose who you are filtering for first, then the preset comparison becomes available.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                          Preset A
                        </span>
                        <Select value={leftPresetId} onChange={(event) => setLeftPresetId(event.target.value)}>
                          {PRESETS.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.label}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                          Preset B
                        </span>
                        <Select value={rightPresetId} onChange={(event) => setRightPresetId(event.target.value)}>
                          {PRESETS.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.label}
                            </option>
                          ))}
                        </Select>
                      </label>
                      {presetScenario ? <MobileScenarioCard {...presetScenario} /> : null}
                    </div>
                  )}
                </div>
              </div>
            </Disclosure>
          ) : null}

          <div className="rounded-3xl border border-black/5 bg-sand-50 p-4">
            <p className="text-sm font-medium text-ink-900">Equivalent size comparison</p>
            {result.comparison ? (
              <>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {describeComparison(result.comparison.place, result.comparison.ratio)}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Nearest reference place: {result.comparison.place.label}.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-600">
                No clean place comparison is available for this result yet.
              </p>
            )}
          </div>
        </div>
      </Disclosure>

      <Disclosure
        title="Methodology and trust labels"
        description="Compressed for mobile, with the longer notes still one tap away."
      >
        <div className="space-y-4">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-4 text-sm text-ink-600">
            <p>
              Observed means directly sourced, Estimated means derived from available data, and Assumption means chosen by you.
            </p>
            <p className="mt-2">
              This estimates people matching published traits, not compatibility or dating intent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onOpenMethodology}>
              Full methodology
            </Button>
            <Button variant="secondary" onClick={onOpenSources}>
              Sources
            </Button>
          </div>
        </div>
      </Disclosure>

      {isEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>No visible matches in the current funnel</CardTitle>
            <CardDescription>That means the stack is now very tight, not necessarily literally impossible.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-ink-600">
            {zeroStep ? (
              <p>
                The sharpest drop currently happens at <strong>{zeroStep.label}</strong>.
              </p>
            ) : (
              <p>Try widening the age range or opening one or two tighter filters first.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
