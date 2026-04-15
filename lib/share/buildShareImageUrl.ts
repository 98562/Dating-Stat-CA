import { siteConfig } from "@/config/site";
import { buildSharePath, buildShareUrl } from "@/lib/share/buildShareUrl";
import type { CalculatorFilters } from "@/lib/types";

export type ShareImageVariant = "story" | "opengraph";

export function buildShareImagePathFromPayload(
  payload: string,
  variant: ShareImageVariant = "story"
) {
  return variant === "story" ? `/s/${payload}/share-image` : `/s/${payload}/opengraph-image`;
}

export function buildShareImageUrlFromPayload(
  payload: string,
  variant: ShareImageVariant = "story"
) {
  return new URL(buildShareImagePathFromPayload(payload, variant), siteConfig.url).toString();
}

export function buildShareImageUrl(
  filters: CalculatorFilters,
  variant: ShareImageVariant = "story"
) {
  const shareUrl = buildShareUrl(filters);
  const payload = buildSharePath(filters).split("/").at(-1) ?? "";
  return payload ? buildShareImageUrlFromPayload(payload, variant) : shareUrl;
}
