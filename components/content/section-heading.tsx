import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-serif text-3xl leading-tight text-ink-900 md:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-base text-ink-600">{description}</p> : null}
    </div>
  );
}
