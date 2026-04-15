import { cn } from "@/lib/utils";

type AdPlacement = "top" | "inline" | "sidebar" | "footer";
type HeightPreset = "sm" | "md" | "lg";
type FallbackVariant = "sponsored" | "reserved" | "future";

interface AdSlotProps {
  placement: AdPlacement;
  enabled?: boolean;
  heightPreset?: HeightPreset;
  fallbackVariant?: FallbackVariant;
  className?: string;
}

const heightClasses: Record<HeightPreset, string> = {
  sm: "min-h-[96px]",
  md: "min-h-[140px]",
  lg: "min-h-[280px]"
};

const fallbackCopy: Record<FallbackVariant, { title: string; body: string }> = {
  sponsored: {
    title: "Sponsored space",
    body: "Reserved for approved sponsored content, with stable layout and no surprise jumping."
  },
  reserved: {
    title: "Reserved placement",
    body: "Held open for approved sponsored or house inventory, separate from support and editorial content."
  },
  future: {
    title: "Reserved space",
    body: "This space is reserved so approved sponsored content can be added later without shifting the layout."
  }
};

export function AdSlot({
  placement,
  enabled = true,
  heightPreset = "md",
  fallbackVariant = "future",
  className
}: AdSlotProps) {
  const copy = fallbackCopy[fallbackVariant];
  const statusLabel = enabled ? "Reserved" : "Reserved";
  const title = enabled ? copy.title : "Reserved placement";
  const body = enabled
    ? copy.body
    : "Ads are currently off. This space stays reserved so approved inventory can be added later without shifting the layout.";

  return (
    <div
      aria-label={`${placement} ad slot`}
      className={cn(
        "rounded-[28px] border border-dashed border-black/10 bg-white/80 p-4 shadow-soft",
        heightClasses[heightPreset],
        className
      )}
    >
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
            {placement} placement
          </p>
          <span className="rounded-full bg-sand-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">
            {statusLabel}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-ink-900">{title}</p>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdSlotTop(props: Omit<AdSlotProps, "placement">) {
  return <AdSlot placement="top" {...props} />;
}

export function AdSlotInline(props: Omit<AdSlotProps, "placement">) {
  return <AdSlot placement="inline" {...props} />;
}

export function AdSlotSidebar(props: Omit<AdSlotProps, "placement">) {
  return <AdSlot placement="sidebar" {...props} />;
}

export function AdSlotFooter(props: Omit<AdSlotProps, "placement">) {
  return <AdSlot placement="footer" {...props} />;
}
