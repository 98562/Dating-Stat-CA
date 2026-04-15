import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface SiteBrandProps {
  className?: string;
  compact?: boolean;
  showEdition?: boolean;
  showTagline?: boolean;
}

const markSizes = {
  sm: "h-9 w-9 rounded-2xl",
  md: "h-11 w-11 rounded-[18px]",
  lg: "h-14 w-14 rounded-[22px]"
} as const;

export function BrandMark({ className, size = "md" }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center border border-black/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(246,241,234,0.96))] shadow-soft",
        markSizes[size],
        className
      )}
    >
      <svg viewBox="0 0 64 64" className="h-[68%] w-[68%]">
        <defs>
          <linearGradient id="brand-fill" x1="12" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1f7a6f" />
            <stop offset="1" stopColor="#15665d" />
          </linearGradient>
        </defs>
        <rect x="11" y="15" width="42" height="10" rx="5" fill="url(#brand-fill)" opacity="0.94" />
        <rect x="18" y="29" width="28" height="9" rx="4.5" fill="#203139" opacity="0.88" />
        <rect x="24" y="43" width="16" height="8" rx="4" fill="#b4842f" opacity="0.96" />
        <circle cx="49" cy="18" r="4.5" fill="#c96e52" />
      </svg>
    </span>
  );
}

export function SiteBrand({
  className,
  compact = false,
  showEdition = true,
  showTagline = false
}: SiteBrandProps) {
  const showProductLabel = showEdition && siteConfig.productLabel !== siteConfig.shortName;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandMark size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        {showProductLabel ? (
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-700">
            {siteConfig.productLabel}
          </p>
        ) : null}
        <p
          className={cn(
            "truncate font-semibold text-ink-900",
            compact ? "text-sm md:text-base" : "text-base md:text-lg"
          )}
        >
          {siteConfig.shortName}
        </p>
        {showTagline ? (
          <p className="truncate text-sm text-ink-500">{siteConfig.tagline}</p>
        ) : null}
      </div>
    </div>
  );
}
