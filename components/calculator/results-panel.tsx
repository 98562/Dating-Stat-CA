"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, DatabaseZap, Info, Sparkles } from "lucide-react";

import { PRESETS } from "@/config/presets";
import { strictnessScale } from "@/config/copy/strictness";
import { SourceBadge } from "@/components/calculator/source-badge";
import { ShareActions } from "@/components/share/share-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/select";
import { featureFlags } from "@/config/features";
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

export interface ResultsPanelProps {
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
    <div className="space-y-3">
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
      <div className="flex justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-ink-400">
        <span>Broad</span>
        <span>Very narrow</span>
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  supporting
}: {
  label: string;
  value: string;
  supporting: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl md:text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-ink-500">{supporting}</CardContent>
    </Card>
  );
}

function ScenarioCard({
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
    <div className="rounded-[28px] border border-black/5 bg-sand-50/70 p-4">
      <div className="space-y-1">
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {leftLabel}
          </p>
          <p className="mt-2 text-xl font-semibold text-ink-900">
            {formatPeople(leftResult.finalPopulation)}
          </p>
          <p className="mt-1 text-sm text-ink-500">{formatOneInX(leftResult.oneInX)}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {rightLabel}
          </p>
          <p className="mt-2 text-xl font-semibold text-ink-900">
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

export function ResultsPanel({
  dataset,
  filters,
  result,
  activePresetId,
  mode,
  onOpenMethodology,
  onOpenSources
}: ResultsPanelProps) {
  const interpretation = getResultInterpretation(result);
  const isEmpty = result.finalPopulation < 1;
  const zeroStep = result.steps.find((step) => step.remainingPopulation < 1);
  const shareOfRelevantPopulation =
    result.relevantPopulation > 0 ? result.finalPopulation / result.relevantPopulation : 0;
  const previewSteps = [
    { label: "Start", value: result.relevantPopulation, sourceType: "observed" as const },
    ...result.steps.slice(0, 3).map((step) => ({
      label: step.filterValue,
      value: step.remainingPopulation,
      sourceType: step.sourceType
    }))
  ];
  const [leftPresetId, setLeftPresetId] = useState(activePresetId || PRESETS[0]?.id || "");
  const [rightPresetId, setRightPresetId] = useState(PRESETS[1]?.id || PRESETS[0]?.id || "");

  useEffect(() => {
    if (activePresetId) {
      setLeftPresetId(activePresetId);
    }
  }, [activePresetId]);

  const scenarioComparisons = useMemo(
    () => buildScenarioComparisons(dataset, filters),
    [dataset, filters]
  );
  const presetScenario = useMemo(
    () =>
      filters.sex === "all"
        ? null
        : buildPresetScenarioComparison(dataset, filters, leftPresetId, rightPresetId),
    [dataset, filters, leftPresetId, rightPresetId]
  );

  if (mode === "preview") {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#fffdf9_0%,#ffffff_60%,#f7fbfa_100%)]">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SourceBadge sourceType={result.quality} showSupport />
              <Badge tone="neutral">{formatStrictness(result.strictness)}</Badge>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">
                Quick read
              </p>
              <h2 className="font-serif text-3xl leading-tight text-ink-900 md:text-4xl">
                {formatPeople(result.finalPopulation)}
              </h2>
              <p className="text-sm text-ink-600">{interpretation.main}</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
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
                Share of selected geography
              </p>
              <p className="mt-2 text-xl font-semibold text-ink-900">
                {formatPercent(shareOfRelevantPopulation)}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Of {Math.round(result.relevantPopulation).toLocaleString("en-CA")} people.
              </p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                Strictness
              </p>
              <p className="mt-2 text-xl font-semibold text-ink-900">
                {formatStrictness(result.strictness)}
              </p>
              <p className="mt-1 text-sm text-ink-500">{getStrictnessCopy(result.strictness)}</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                Interpretation
              </p>
              <p className="mt-2 text-sm font-medium text-ink-900">{interpretation.subline}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mini funnel</CardTitle>
            <CardDescription>
              A compact look at how the first few steps change the pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
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
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-black/5 bg-white/80 px-4 py-3 text-sm text-ink-600">
          <p>
            Short version: some steps are observed, some estimated, and some chosen by you.{" "}
            <button
              type="button"
              onClick={onOpenMethodology}
              className="font-medium text-accent-700"
            >
              How this works
            </button>
          </p>
        </div>

        {isEmpty ? (
          <Card>
            <CardHeader>
              <CardTitle>No visible matches in the current funnel</CardTitle>
              <CardDescription>
                That means the stack is now very tight, not necessarily literally impossible.
              </CardDescription>
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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(31,122,111,0.12),transparent_40%),linear-gradient(135deg,#fffdf9_0%,#ffffff_55%,#f7fbfa_100%)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral">
              Probability lens for {dataset.populationEstimates[filters.geography].label}
            </Badge>
            <SourceBadge sourceType={result.quality} showSupport />
            <Badge tone="neutral">{formatStrictness(result.strictness)}</Badge>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
                Live estimate
              </p>
              <h1 className="font-serif text-4xl leading-tight text-ink-900 md:text-5xl">
                {formatPeople(result.finalPopulation)}
              </h1>
              <p className="max-w-2xl text-base text-ink-700">{result.explanation}</p>
            </div>
            <div className="rounded-[28px] border border-black/5 bg-white/90 p-5 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                Strictness meter
              </p>
              <div className="mt-3">
                <StrictnessMeter level={result.strictness} />
              </div>
              <p className="mt-2 text-2xl font-semibold text-ink-900">
                {formatStrictness(result.strictness)}
              </p>
              <p className="mt-2 max-w-xs text-sm text-ink-500">
                {getStrictnessCopy(result.strictness)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <HeroStat
            label={`Estimated matches in ${dataset.populationEstimates[filters.geography].label}`}
            value={formatPeople(result.finalPopulation)}
            supporting={`Result denominator: ${Math.round(result.relevantPopulation).toLocaleString("en-CA")} people in the selected geography.`}
          />
          <HeroStat
            label="1 in X people"
            value={formatOneInX(result.oneInX)}
            supporting="A probability lens for this filtered population, not a guarantee of dating intent."
          />
          <HeroStat
            label="Share of relevant population"
            value={formatPercent(result.finalPopulation / result.relevantPopulation)}
            supporting={`Of ${Math.round(result.relevantPopulation).toLocaleString("en-CA")} people in ${dataset.populationEstimates[filters.geography].label}.`}
          />
        </CardContent>
      </Card>

      <Disclosure
        title="Calculation log"
        description="The full calculator keeps the step-by-step log open by default."
        defaultOpen
      >
        <div className="space-y-3">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-4">
            <div className="grid grid-cols-[1.2fr,1fr,1fr,auto] gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              <span>Filter</span>
              <span>Previous pool</span>
              <span>Remaining</span>
              <span>Method</span>
            </div>
          </div>
          <div className="rounded-3xl border border-black/5 p-4">
            <div className="grid gap-4 md:grid-cols-[1.2fr,1fr,1fr,auto] md:items-start">
              <div>
                <p className="font-medium text-ink-900">Start</p>
                <p className="text-sm text-ink-500">
                  Latest population estimate for {dataset.populationEstimates[filters.geography].label}
                </p>
              </div>
              <p className="text-sm text-ink-700">{formatPeople(result.relevantPopulation)}</p>
              <p className="text-sm font-medium text-ink-900">
                {formatPeople(result.relevantPopulation)}
              </p>
              <SourceBadge sourceType="observed" showSupport />
            </div>
            <p className="mt-3 text-sm text-ink-500">
              This is the current official population baseline before any filters are applied.
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
                <div className="grid gap-4 md:grid-cols-[1.2fr,1fr,1fr,auto] md:items-start">
                  <div>
                    <p className="font-medium text-ink-900">{step.label}</p>
                    <p className="text-sm text-ink-500">{step.filterValue}</p>
                  </div>
                  <p className="text-sm text-ink-700">{formatPeople(step.priorPopulation)}</p>
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {formatPeople(step.remainingPopulation)}
                    </p>
                    <p className="text-xs text-ink-500">
                      {formatPercent(step.share)} survived this step
                    </p>
                  </div>
                  <SourceBadge sourceType={step.sourceType} showSupport />
                </div>
                <p className="mt-3 text-sm text-ink-500">{step.explanation}</p>
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
        <Card className="border-black/5 bg-white/95">
          <CardHeader>
            <CardTitle>Scenario comparison</CardTitle>
            <CardDescription>
              Compare nearby versions of your filters to see which changes matter most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {scenarioComparisons.map((scenario) => (
              <ScenarioCard key={scenario.id} {...scenario} />
            ))}

            <div className="rounded-[28px] border border-black/5 bg-sand-50/70 p-4">
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
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
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
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
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

                  {presetScenario ? <ScenarioCard {...presetScenario} /> : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-black/5 bg-white/95">
        <CardHeader>
          <CardTitle>What these numbers mean</CardTitle>
          <CardDescription>
            The fast version, without making the result sound grander than it is.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 md:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Count
            </p>
            <p className="mt-2 text-sm text-ink-700">
              The big number is the estimated pool after every active filter has been applied.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Rarity
            </p>
            <p className="mt-2 text-sm text-ink-700">
              &quot;1 in X&quot; is a rarity lens for the current stack, not a promise about real-world dating odds.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Read
            </p>
            <p className="mt-2 text-sm font-medium text-ink-900">{interpretation.main}</p>
            <p className="mt-1 text-sm text-ink-600">{interpretation.subline}</p>
          </div>
        </CardContent>
      </Card>

      <ShareActions
        filters={filters}
        result={result}
        description="Share a cleaner link, readable summary, or image without exposing the full filter query."
      />

      <Card className="border-black/5 bg-white/95">
        <CardHeader>
          <CardTitle>Equivalent size comparison</CardTitle>
          <CardDescription>
            A looser place-based comparison, moved out of the headline stats so long place names do not break the panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {result.comparison ? (
            <>
              <p className="text-lg font-medium text-ink-900">
                {describeComparison(result.comparison.place, result.comparison.ratio)}
              </p>
              <p className="text-sm text-ink-600">
                Nearest reference place: {result.comparison.place.label}. This is just a scale reference, not a location forecast.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-600">
              No clean place comparison is available for this result yet.
            </p>
          )}
        </CardContent>
      </Card>

      {isEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>No visible matches in the current funnel</CardTitle>
            <CardDescription>Canada is large. Your filter stack may disagree.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
            <p>
              The current selection collapses the estimated pool to fewer than one person. That does not mean zero people literally exist; it means the selected published distributions leave the pool effectively off the grid.
            </p>
            {zeroStep ? (
              <p>
                The sharpest drop currently happens at <strong>{zeroStep.label}</strong>, which is shown as <strong>{zeroStep.sourceType}</strong>.
              </p>
            ) : null}
            <p>
              Try widening age, geography, education, income, population-group, or height constraints first. If a subjective assumption is active, that slider may also be doing some heavy lifting.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>How this is calculated</CardTitle>
            <CardDescription>
              Transparent enough to be useful, restrained enough to avoid fake precision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm text-ink-600">
            <div className="rounded-3xl bg-sand-50 p-4">
              <p>
                This calculator estimates how many people in Canada roughly match your selected traits using official data where possible, reasonable estimation where needed, and explicit user assumptions when the data simply do not exist.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 text-accent-700" />
                <p>
                  The live starting population uses the latest quarterly estimate; most demographic shares come from the 2021 Census, while height uses an official Canadian health survey.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BookOpenText className="mt-0.5 h-4 w-4 text-accent-700" />
                  <p>
                  &quot;Single&quot; in public datasets usually means a legal or household status, not actively on an app or currently looking.
                  </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-accent-700" />
                  <p>
                  Drinking habits and height are estimated from survey-style or health-survey data, and attractiveness is assumption-only. Some filters are statistical. Some are personal.
                  </p>
              </div>
            </div>
            <Button variant="secondary" onClick={onOpenMethodology}>
              Read the full methodology
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Result quality</CardTitle>
            <Button variant="secondary" onClick={onOpenSources}>
              <DatabaseZap className="mr-2 h-4 w-4" />
              Sources
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between rounded-3xl bg-accent-50 p-4">
              <div>
                <p className="font-medium text-accent-700">Observed</p>
                <p className="text-sm text-ink-600">Based on published data.</p>
              </div>
              <Badge tone="observed">Observed</Badge>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-gold-100/70 p-4">
              <div>
                <p className="font-medium text-gold-500">Estimated</p>
                <p className="text-sm text-ink-600">Derived from available data.</p>
              </div>
              <Badge tone="estimated">Estimated</Badge>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-ink-900 p-4 text-white">
              <div>
                <p className="font-medium">Assumption</p>
                <p className="text-sm text-white/75">User-supplied input, clearly marked.</p>
              </div>
              <Badge tone="assumption">Assumption</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
