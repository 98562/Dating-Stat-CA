import { SectionHeading } from "@/components/content/section-heading";
import { MissingDatasetState } from "@/components/content/dataset-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sourceUsageById } from "@/content/source-usage";
import { loadNormalizedDataset } from "@/lib/data/loaders";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Sources",
  description:
    "Review the official Statistics Canada tables and source notes behind the calculator's geography, age, sex, relationship, education, income, and language filters.",
  path: "/sources"
});

export default async function SourcesPage() {
  try {
    const dataset = await loadNormalizedDataset();

    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6">
        <SectionHeading
          eyebrow="Sources"
          title="Official inputs, documented limitations"
          description="Each source shows what it powers, what year it reflects, and where its limits begin."
          className="mb-8"
        />

        <div className="grid gap-4">
          {Object.values(dataset.sources).map((source) => {
            const details = sourceUsageById[source.id];

            return (
              <Card key={source.id}>
                <CardHeader>
                  <CardTitle>{source.title}</CardTitle>
                  <CardDescription>{source.yearLabel}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 pt-0 md:grid-cols-[1.05fr,0.95fr]">
                  <div className="space-y-3 text-sm leading-7 text-ink-600">
                    <p><strong>Usage:</strong> {details?.usage ?? source.note}</p>
                    <p><strong>Notes:</strong> {source.note}</p>
                    <p><strong>Limitations:</strong> {details?.limitations ?? "See source note."}</p>
                  </div>
                  <div className="space-y-3 text-sm text-ink-600">
                    <p className="font-medium text-ink-900">Filters powered</p>
                    <div className="flex flex-wrap gap-2">
                      {(details?.filtersPowered ?? ["General"]).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    {source.tableId ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
                        Table {source.tableId}
                      </p>
                    ) : null}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-medium text-accent-700"
                    >
                      Open official source
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Unavailable right now"
          title="Source catalog unavailable"
          description="The source page depends on the normalized dataset manifest."
          className="mb-8"
        />
        <MissingDatasetState />
      </div>
    );
  }
}
