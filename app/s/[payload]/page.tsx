import Link from "next/link";
import type { Metadata } from "next";

import { CalculatorShell } from "@/components/calculator/calculator-shell";
import { MissingDatasetState } from "@/components/content/dataset-state";
import { SectionHeading } from "@/components/content/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productConfig } from "@/config/product";
import { siteConfig } from "@/config/site";
import { buildSharePreview } from "@/lib/share/buildSharePreview";
import { buildShareDescription } from "@/lib/share/buildShareSummary";
import { buildShareImagePathFromPayload } from "@/lib/share/buildShareImageUrl";
import { resolveSharedResult } from "@/lib/share/resolveSharedResult";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params
}: {
  params: Promise<{ payload: string }>;
}): Promise<Metadata> {
  const { payload } = await params;
  const shared = await resolveSharedResult(payload);

  if (!shared.ok || !shared.result) {
    return buildMetadata({
      title: `${siteConfig.productLabel} | Shared result`,
      description: "A compact shared calculator link for the Canada Dating Pool Calculator.",
      path: `/s/${payload}`,
      imagePath: buildShareImagePathFromPayload(payload, "opengraph")
    });
  }

  const preview = buildSharePreview(shared.decoded.filters, shared.result, 3);

  return {
    ...buildMetadata({
      title: preview.title,
      description: buildShareDescription(shared.decoded.filters, shared.result),
      path: `/s/${payload}`,
      imagePath: buildShareImagePathFromPayload(payload, "opengraph")
    }),
    robots: {
      index: false,
      follow: true
    }
  };
}

export default async function SharedCalculatorPage({
  params
}: {
  params: Promise<{ payload: string }>;
}) {
  const { payload } = await params;
  const shared = await resolveSharedResult(payload);

  if (!shared.dataset) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Unavailable right now"
          title="Calculator data unavailable"
          description="The shared route loaded, but the normalized dataset did not."
          className="mb-8"
        />
        <MissingDatasetState />
      </div>
    );
  }

  if (!shared.ok) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 xl:px-8">
        <SectionHeading
          eyebrow="Shared result"
          title="That shared link could not be restored"
          description={
            shared.decoded.error ??
            "The shared link could not be read, so the calculator opened with its default settings instead."
          }
          className="mb-8"
        />
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Open the calculator with default settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm text-ink-600">
            <p>
              The link may be malformed, truncated, or from an unsupported future share format. The app did not crash; it just could not trust that payload.
            </p>
            <Link href="/calculator">
              <Button>Open calculator</Button>
            </Link>
          </CardContent>
        </Card>
        <CalculatorShell dataset={shared.dataset} initialFilters={shared.decoded.filters} mode="full" />
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-6 xl:px-8">
        <SectionHeading
        eyebrow="Shared result"
        title="Opened from a shared result link"
        description={`This link restores the same calculator setup in the full calculator while keeping age ranges at ${productConfig.minimumAge}+.`}
        className="mb-8"
      />
      <CalculatorShell dataset={shared.dataset} initialFilters={shared.decoded.filters} mode="full" />
    </div>
  );
}
