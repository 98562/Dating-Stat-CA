"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, ImageUp, Link2 } from "lucide-react";

import { ResultShareCard } from "@/components/share/result-share-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildShareDescription, buildShareSummary } from "@/lib/share/buildShareSummary";
import { buildShareImageUrl } from "@/lib/share/buildShareImageUrl";
import { buildShareUrl } from "@/lib/share/buildShareUrl";
import { buildSharePreview } from "@/lib/share/buildSharePreview";
import { downloadShareImage, shareImage } from "@/lib/share/shareImage";
import type { CalculationResult, CalculatorFilters } from "@/lib/types";

interface ShareActionsProps {
  filters: CalculatorFilters;
  result: CalculationResult;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ShareActions({
  filters,
  result,
  title = "Share this result",
  description = "Short link, short summary, and native share where the browser supports it.",
  compact = false
}: ShareActionsProps) {
  const [status, setStatus] = useState("");
  const shareUrl = useMemo(() => buildShareUrl(filters), [filters]);
  const imageUrl = useMemo(() => buildShareImageUrl(filters, "story"), [filters]);
  const shareSummary = useMemo(() => buildShareSummary(filters, result), [filters, result]);
  const shareDescription = useMemo(
    () => buildShareDescription(filters, result),
    [filters, result]
  );
  const sharePreview = useMemo(() => buildSharePreview(filters, result, 3), [filters, result]);
  const imageFilename = useMemo(
    () =>
      `dating-pool-${Math.max(1, Math.round(result.finalPopulation))}-${filters.geography}.png`,
    [filters.geography, result.finalPopulation]
  );

  async function copyText(value: string, nextStatus: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(nextStatus);
    } catch {
      setStatus("Clipboard access was unavailable in this browser.");
    }
  }

  async function handleShareImage() {
    const outcome = await shareImage({
      title: sharePreview.title,
      text: shareDescription,
      url: shareUrl,
      imageUrl,
      filename: imageFilename
    });

    if (outcome === "shared") {
      setStatus("Share sheet opened with the card image.");
      return;
    }

    if (outcome === "cancelled") {
      setStatus("Image share was cancelled.");
      return;
    }

    if (outcome === "file-unsupported") {
      setStatus(
        "This browser can share links, but not image files. Use Download image, then share it from your device if needed."
      );
      return;
    }

    if (outcome === "unsupported") {
      setStatus(
        "Native image sharing is not available here. Download image, Copy summary, or Copy link instead."
      );
      return;
    }

    setStatus("The share image could not be prepared. Download image is still available.");
  }

  async function handleDownloadImage() {
    const downloaded = await downloadShareImage(imageUrl, imageFilename);
    setStatus(
      downloaded
        ? "Share card image downloaded."
        : "Opened the share image directly because download handling was limited in this browser."
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} On supported mobile devices, you can pass the card image into your system
          share sheet. Whether Instagram appears there depends on the device and browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <ResultShareCard filters={filters} result={result} compact={compact} />

        <div className="rounded-[24px] border border-black/5 bg-sand-50/80 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button className="w-full justify-center sm:w-auto" onClick={handleShareImage}>
              <ImageUp className="mr-2 h-4 w-4" />
              Share image
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center sm:w-auto"
              onClick={handleDownloadImage}
            >
              <Download className="mr-2 h-4 w-4" />
              Download image
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center sm:w-auto"
              onClick={() => copyText(shareSummary, "Share summary copied.")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy summary
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center sm:w-auto"
              onClick={() => copyText(shareUrl, "Compact link copied.")}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-ink-600">
            <Check className="h-4 w-4 text-accent-700" />
            <p>The compact link stays under the hood; the image and summary are the share surface.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-sand-50 px-4 py-3 text-sm text-ink-600">
          <p className="font-medium text-ink-900">Share summary</p>
          <p className="mt-1 whitespace-pre-line">{shareSummary.split("\n").slice(0, 4).join("\n")}</p>
          <p className="mt-2 text-xs text-ink-500">
            The compact share URL stays under the hood unless you explicitly copy the link.
          </p>
        </div>

        {status ? (
          <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-ink-600">
            {status}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
