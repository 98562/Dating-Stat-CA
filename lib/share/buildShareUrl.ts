import { siteConfig } from "@/config/site";
import { encodeShareState } from "@/lib/share/encodeState";
import type { CalculatorFilters } from "@/lib/types";

export function buildSharePath(filters: CalculatorFilters) {
  return `/s/${encodeShareState(filters)}`;
}

export function buildSharePathFromPayload(payload: string) {
  return `/s/${payload}`;
}

export function buildShareUrl(filters: CalculatorFilters) {
  return new URL(buildSharePath(filters), siteConfig.url).toString();
}
