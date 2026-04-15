"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteBrand } from "@/components/brand/site-brand";
import { primaryNav } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useLiveCalculatorLocation } from "@/lib/use-live-calculator-location";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const locationState = useLiveCalculatorLocation();
  const withCurrentQuery = (href: string) =>
    locationState.query ? `${href}?${locationState.query}` : href;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-sand-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 md:px-6 xl:px-8">
        <Link href={withCurrentQuery("/")} className="min-w-0">
          <SiteBrand compact />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            const href =
              item.href === "/" || item.href === "/calculator"
                ? withCurrentQuery(item.href)
                : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition",
                  active ? "bg-white text-ink-900 shadow-soft" : "hover:bg-white/70"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {pathname === "/calculator" ? (
            <Link href={withCurrentQuery("/")} className="hidden sm:block">
              <Button>Home preview</Button>
            </Link>
          ) : (
            <Link href={withCurrentQuery("/calculator")} className="hidden sm:block">
              <Button>Full calculator</Button>
            </Link>
          )}
          {pathname === "/calculator" ? (
            <Link href={withCurrentQuery("/")} className="sm:hidden">
              <Button className="px-3">Home</Button>
            </Link>
          ) : (
            <Link href={withCurrentQuery("/calculator")} className="sm:hidden">
              <Button className="px-3">Full</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
