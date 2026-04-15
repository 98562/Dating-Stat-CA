import { CalculatorShell } from "@/components/calculator/calculator-shell";
import { MissingDatasetState } from "@/components/content/dataset-state";
import { SectionHeading } from "@/components/content/section-heading";
import { buildManualAssumptions, loadNormalizedDataset } from "@/lib/data/loaders";
import { decodeFilters } from "@/lib/filter-query";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Calculator",
  description:
    "Use the full Canada-focused calculator with the detailed step log, source notes, and fuller methodology context.",
  path: "/calculator"
});

export default async function CalculatorPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const defaults = buildManualAssumptions();
  const initialFilters = decodeFilters(resolvedSearchParams, defaults);

  try {
    const dataset = await loadNormalizedDataset();

    return (
      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-6 xl:px-8">
        <SectionHeading
          eyebrow="Full calculator"
          title="Full calculator"
          description="This view keeps the detailed calculation log, source notes, and methodology notes close at hand."
          className="mb-8"
        />
        <CalculatorShell dataset={dataset} initialFilters={initialFilters} mode="full" />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Unavailable right now"
          title="Calculator data unavailable"
          description="The route loaded, but the normalized dataset did not."
          className="mb-8"
        />
        <MissingDatasetState />
      </div>
    );
  }
}
