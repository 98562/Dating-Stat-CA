import { Badge } from "@/components/ui/badge";
import { formatSourceType, formatSourceTypeSupport } from "@/lib/format";
import type { SourceType } from "@/lib/types";

export function SourceBadge({
  sourceType,
  showSupport
}: {
  sourceType: SourceType;
  showSupport?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge
        tone={
          sourceType === "observed"
            ? "observed"
            : sourceType === "estimated"
              ? "estimated"
              : "assumption"
        }
      >
        {formatSourceType(sourceType)}
      </Badge>
      {showSupport ? (
        <span className="text-[11px] font-medium text-ink-500">
          {formatSourceTypeSupport(sourceType)}
        </span>
      ) : null}
    </div>
  );
}
