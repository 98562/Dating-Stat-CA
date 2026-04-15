import React from "react";
import { ImageResponse } from "next/og";

import { ShareImageTemplate } from "@/components/share/share-image-template";
import { siteConfig } from "@/config/site";
import { buildSharePreview } from "@/lib/share/buildSharePreview";
import { resolveSharedResult } from "@/lib/share/resolveSharedResult";

export async function GET(
  _request: Request,
  context: { params: Promise<{ payload: string }> }
) {
  const { payload } = await context.params;
  const shared = await resolveSharedResult(payload);

  const preview =
    shared.ok && shared.result
      ? buildSharePreview(shared.decoded.filters, shared.result, 4)
      : {
          geographyLabel: "Canada",
          estimatedPool: "Shared result",
          oneInX: "Compact calculator link",
          strictnessLabel: "Shared setup",
          interpretation: "This shared setup could not be fully restored.",
          keyFilters: ["Open calculator", "Check the link", "Try again"],
          headline: "Shared calculator result",
          subheadline: "Fallback share state",
          title: `${siteConfig.productLabel} | Shared result`,
          description: "A shared Canada Dating Pool Calculator link."
        };

  return new ImageResponse(
    React.createElement(ShareImageTemplate, {
      preview,
      variant: "story"
    }),
    {
      width: 1080,
      height: 1920
    }
  );
}
