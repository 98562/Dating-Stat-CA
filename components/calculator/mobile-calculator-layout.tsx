"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CalculatorLayoutProps } from "@/components/calculator/calculator-layout-types";
import { FilterPanel } from "@/components/calculator/filter-panel";
import { SourceBadge } from "@/components/calculator/source-badge";
import { ShareActions } from "@/components/share/share-actions";
import { featureFlags } from "@/config/features";
import { PRESETS } from "@/config/presets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
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
import { getFilterImpactNote, getResultInterpretation } from "@/lib/result-insights";
import { buildPresetScenarioComparison, buildScenarioComparisons } from "@/lib/scenario-comparisons";
import type { CalculationResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function SummaryMetric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/85 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function MobileScenarioCard({
  title,
  description,
  leftLabel,
  rightLabel,
  leftResult,
  rightResult,
  note
}: {
  title: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  leftResult: CalculationResult;
  rightResult: CalculationResult;
  note: string;
}) {
  const factor =
    leftResult.finalPopulation > 0 && rightResult.finalPopulation > 0
      ? rightResult.finalPopulation / leftResult.finalPopulation
      : null;
  const difference = rightResult.finalPopulation - leftResult.finalPopulation;

  return (
    <div className="rounded-[28px] border border-black/5 bg-sand-50/80 p-4">
      <div className="space-y-1">
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {leftLabel}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink-900">
            {formatPeople(leftResult.finalPopulation)}
          </p>
          <p className="mt-1 text-sm text-ink-500">{formatOneInX(leftResult.oneInX)}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {rightLabel}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink-900">
            {formatPeople(rightResult.finalPopulation)}
          </p>
          <p className="mt-1 text-sm text-ink-500">{formatOneInX(rightResult.oneInX)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-ink-600">
        <p className="font-medium text-ink-900">
          {difference === 0
            ? "These two versions currently land in the same place."
            : difference > 0
              ? `${rightLabel} adds about ${formatInteger(difference)} more people.`
              : `${leftLabel} keeps about ${formatInteger(Math.abs(difference))} more people.`}
        </p>
        {factor ? (
          <p className="mt-1">
            That is roughly {factor >= 1 ? factor.toFixed(1) : (1 / factor).toFixed(1)}x{" "}
            {factor >= 1 ? "larger" : "smaller"} on the right-hand side.
          </p>
        ) : null}
        <p className="mt-2">{note}</p>
      </div>
    </div>
  );
}

export function MobileCalculatorLayout({
  filterPanelProps,
  resultsPanelProps
}: CalculatorLayoutProps) {
  const { dataset, filters, result, activePresetId, mode, onOpenMethodology, onOpenSources } =
    resultsPanelProps;
  const interpretation = getResultInterpretation(result);
  const shareOfRelevantPopulation =
    result.relevantPopulation > 0 ? result.finalPopulation / result.relevantPopulation : 0;
  const isEmpty = result.finalPopulation < 1;
  const zeroStep = result.steps.find((step) => step.remainingPopulation < 1);
  const mostConsequentialStep = useMemo(
    () =>
      result.steps.reduce<CalculationResult["steps"][number] | null>((currentWorst, step) => {
        if (!currentWorst || step.share < currentWorst.share) {
          return step;
        }

        return currentWorst;
      }, null),
    [result.steps]
  );
  const previewSteps = [
    { label: "Start", value: result.relevantPopulation, sourceType: "observed" as const },
    ...result.steps.slice(0, 3).map((step) => ({
      label: step.filterValue,
      value: step.remainingPopulation,
      sourceType: step.sourceType
    }))
  ];
  const scenarioComparisons = useMemo(
    () => (mode === "full" ? buildScenarioComparisons(dataset, filters) : []),
    [dataset, filters, mode]
  );
  const [leftPresetId, setLeftPresetId] = useState(activePresetId || PRESETS[0]?.id || "");
  const [rightPresetId, setRightPresetId] = useState(PRESETS[1]?.id || PRESETS[0]?.id || "");
  const stickyAnchorRef = useRef<HTMLDivElement | null>(null);
  const stickyShellRef = useRef<HTMLDivElement | null>(null);
  const stickyPanelRef = useRef<HTMLDivElement | null>(null);
  const [stickyActive, setStickyActive] = useState(false);

  useEffect(() => {
    if (activePresetId) {
      setLeftPresetId(activePresetId);
    }
  }, [activePresetId]);

  useEffect(() => {
    function updateStickyState() {
      const anchor = stickyAnchorRef.current;
      const shell = stickyShellRef.current;
      const stickyPanel = stickyPanelRef.current;

      if (!anchor || !shell || !stickyPanel) {
        return;
      }

      const stickyTop = 80;
      const anchorTop = anchor.getBoundingClientRect().top;
      const shellBottom = shell.getBoundingClientRect().bottom;
      const stickyHeight = stickyPanel.getBoundingClientRect().height;
      const nextActive =
        anchorTop <= stickyTop && shellBottom > stickyTop + stickyHeight + 12;

      setStickyActive((current) => (current === nextActive ? current : nextActive));
    }

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  const presetScenario = useMemo(
    () =>
      filters.sex === "all" || mode !== "full"
        ? null
        : buildPresetScenarioComparison(dataset, filters, leftPresetId, rightPresetId),
    [dataset, filters, leftPresetId, mode, rightPresetId]
  );

  return (
    <div className="space-y-4 lg:hidden">
      <div ref={stickyShellRef} className="rounded-[32px] border border-black/5 bg-white shadow-soft">
        <div ref={stickyAnchorRef} className="h-px" />
        <div
          ref={stickyPanelRef}
          className={cn(
            "sticky top-20 z-20 rounded-t-[32px] border-b bg-[linear-gradient(135deg,rgba(255,253,249,0.88)_0%,rgba(255,255,255,0.82)_58%,rgba(247,251,250,0.8)_100%)] backdrop-blur-[10px] transition-[box-shadow,background-color,border-color,transform] duration-200 ease-out",
            stickyActive
              ? "border-black/8 shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
              : "border-black/5 shadow-none"
          )}
        >
          <CardHeader className="space-y-2 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge sourceType={result.quality} showSupport />
              <Badge tone="neutral">{formatStrictness(result.strictness)}</Badge>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-700">
                  Live result
                </p>
                <h2 className="font-serif text-[1.65rem] leading-tight text-ink-900">
                  {formatPeople(result.finalPopulation)}
                </h2>
              </div>
              <p className="text-right text-xs font-medium text-ink-500">
                {formatStrictness(result.strictness)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 border-t border-black/5 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <SummaryMetric label="1 in X" value={formatOneInX(result.oneInX)} />
              <SummaryMetric label="Share" value={formatPercent(shareOfRelevantPopulation)} />
            </div>
            <p className="text-xs text-ink-600">{interpretation.main}</p>
            {isEmpty ? (
              <div className="rounded-2xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2.5 text-xs text-ink-600">
                <p className="font-medium text-ink-900">This stack is currently off the grid.</p>
                <p className="mt-1">
                  {zeroStep
                    ? `The sharpest drop currently lands at ${zeroStep.label}.`
                    : "That usually means one or two filters are doing most of the work."}
                </p>
              </div>
            ) : null}
          </CardContent>
          <div
            className={cn(
              "pointer-events-none h-4 bg-gradient-to-b from-white/60 to-white/0 transition-opacity duration-200",
              stickyActive ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        <div className="rounded-b-[32px] bg-white">
          <FilterPanel
            {...filterPanelProps}
            showQuickSetup
            showAdvancedSections
            hidePanelHeader
            cardClassName="rounded-none border-0 bg-transparent shadow-none"
            contentClassName="px-5 pb-5 pt-4"
            panelTitle={mode === "preview" ? "Core filters" : "Full filter stack"}
            panelDescription={
              mode === "preview"
                ? "The homepage keeps every main filter here, with optional assumptions left for the full calculator."
                : "The full calculator keeps the complete filter stack in one place, including optional assumptions."
            }
          />
        </div>
      </div>

      <ShareActions
        filters={filters}
        result={result}
        compact
        title={mode === "preview" ? "Share this setup" : "Share this result"}
        description="Compact link, short summary, and native share where supported."
      />

      {mode === "preview" ? (
        <Disclosure
          title="More result detail"
          description="A little extra context without turning the homepage into the full dashboard."
        >
          <div className="space-y-4">
            <div className="space-y-3">
              {previewSteps.map((step) => (
                <div
                  key={`${step.label}-${step.value}`}
                  className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{step.label}</p>
                      <p className="text-sm text-ink-500">{formatPeople(step.value)}</p>
                    </div>
                    <SourceBadge sourceType={step.sourceType} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                  Denominator
                </p>
                <p className="mt-1 text-sm text-ink-900">
                  {Math.round(result.relevantPopulation).toLocaleString("en-CA")} people in{" "}
                  {dataset.populationEstimates[filters.geography].label}.
                </p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                  Biggest narrowing step
                </p>
                {mostConsequentialStep ? (
                  <>
                    <p className="mt-1 text-sm font-medium text-ink-900">
                      {mostConsequentialStep.label}: {mostConsequentialStep.filterValue}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      {formatPercent(mostConsequentialStep.share)} survived this step.
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-ink-500">
                    Add a few filters and the main narrowing step will show up here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Disclosure>
      ) : (
        <>
          <Disclosure
            title="Calculation log"
            description="The step-by-step log stays available without taking over the first screen."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
                <p className="text-sm font-medium text-ink-900">Start</p>
                <p className="mt-1 text-sm text-ink-500">
                  Latest population estimate for{" "}
                  {dataset.populationEstimates[filters.geography].label}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-700">{formatPeople(result.relevantPopulation)}</p>
                  <SourceBadge sourceType="observed" showSupport />
                </div>
              </div>

              {result.steps.map((step) => {
                const impactNote = getFilterImpactNote(step, result.relevantPopulation);

                return (
                  <div
                    key={step.id}
                    className={
                      step.sourceType === "assumption"
                        ? "rounded-2xl border border-ink-900/10 bg-ink-900/[0.03] p-4"
                        : step.sourceType === "estimated"
                          ? "rounded-2xl border border-gold-300/40 bg-gold-100/20 p-4"
                          : "rounded-2xl border border-black/5 bg-white p-4"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">{step.label}</p>
                        <p className="text-sm text-ink-500">{step.filterValue}</p>
                      </div>
                      <SourceBadge sourceType={step.sourceType} />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/80 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                          Previous pool
                        </p>
                        <p className="mt-1 text-sm font-medium text-ink-900">
                          {formatPeople(step.priorPopulation)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                          Remaining
                        </p>
                        <p className="mt-1 text-sm font-medium text-ink-900">
                          {formatPeople(step.remainingPopulation)}
                        </p>
                        <p className="mt-1 text-xs text-ink-500">
                          {formatPercent(step.share)} survived this step
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-ink-600">{step.explanation}</p>
                    {impactNote ? (
                      <div className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm text-ink-700 ring-1 ring-black/5">
                        {impactNote}
                      </div>
                    ) : null}
                    {step.note ? <p className="mt-2 text-xs text-ink-500">{step.note}</p> : null}
                    {step.derivation ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {step.derivation}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Disclosure>

          {featureFlags.compareMode ? (
            <Disclosure
              title="Scenario comparison"
              description="A faster way to see what happens when nearby versions of your filters are applied."
            >
              <div className="space-y-4">
                {scenarioComparisons.map((scenario) => (
                  <MobileScenarioCard key={scenario.id} {...scenario} />
                ))}

                <div className="rounded-[28px] border border-black/5 bg-sand-50/80 p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-ink-900">Preset A vs Preset B</p>
                    <p className="text-sm text-ink-500">
                      A direct preset comparison using the same currently selected target sex.
                    </p>
                  </div>

                  {filters.sex === "all" ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-black/10 bg-white px-4 py-3 text-sm text-ink-600">
                      Choose who you are filtering for first, then the preset comparison becomes available.
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid gap-3">
                        <label className="space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                            Preset A
                          </span>
                          <Select
                            value={leftPresetId}
                            onChange={(event) => setLeftPresetId(event.target.value)}
                          >
                            {PRESETS.map((preset) => (
                              <option key={preset.id} value={preset.id}>
                                {preset.label}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                            Preset B
                          </span>
                          <Select
                            value={rightPresetId}
                            onChange={(event) => setRightPresetId(event.target.value)}
                          >
                            {PRESETS.map((preset) => (
                              <option key={preset.id} value={preset.id}>
                                {preset.label}
                              </option>
                            ))}
                          </Select>
                        </label>
                      </div>

                      {presetScenario ? <div className="mt-4"><MobileScenarioCard {...presetScenario} /></div> : null}
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Equivalent size comparison
                  </p>
                  {result.comparison ? (
                    <>
                      <p className="mt-2 text-sm font-medium text-ink-900">
                        {describeComparison(result.comparison.place, result.comparison.ratio)}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">
                        Nearest reference place: {result.comparison.place.label}. This is a scale
                        reference, not a location forecast.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ink-500">
                      No clean place comparison is available for this result yet.
                    </p>
                  )}
                </div>
              </div>
            </Disclosure>
          ) : (
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                Equivalent size comparison
              </p>
              {result.comparison ? (
                <>
                  <p className="mt-2 text-sm font-medium text-ink-900">
                    {describeComparison(result.comparison.place, result.comparison.ratio)}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    Nearest reference place: {result.comparison.place.label}. This is a scale
                    reference, not a location forecast.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-500">
                  No clean place comparison is available for this result yet.
                </p>
              )}
            </div>
          )}
        </>
      )}

      <Disclosure
        title="How this works"
        description="Keep the caveats short here. The fuller methodology stays one tap away."
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            This calculator mixes published Canadian data, derived estimates, and clearly marked
            assumptions. It is a perspective tool, not relationship science.
          </p>
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-accent-50 px-4 py-3">
              <div>
                <p className="font-medium text-accent-700">Observed</p>
                <p className="text-sm text-ink-600">Based on published data.</p>
              </div>
              <Badge tone="observed">Observed</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gold-100/70 px-4 py-3">
              <div>
                <p className="font-medium text-gold-500">Estimated</p>
                <p className="text-sm text-ink-600">Derived from available data.</p>
              </div>
              <Badge tone="estimated">Estimated</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 text-white">
              <div>
                <p className="font-medium">Assumption</p>
                <p className="text-sm text-white/75">Chosen by you.</p>
              </div>
              <Badge tone="assumption">Assumption</Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600">
            <p>
              Some survey-based filters, especially height and drinking habits, are best read as
              estimates. Subjective filters stay explicit so the app never pretends they came from
              a table in Ottawa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onOpenMethodology}>
              Read the full methodology
            </Button>
            <Button variant="secondary" onClick={onOpenSources}>
              Open sources
            </Button>
          </div>
        </div>
      </Disclosure>
    </div>
  );
}
