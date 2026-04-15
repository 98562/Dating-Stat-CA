import Link from "next/link";

import { SourceBadge } from "@/components/calculator/source-badge";
import { SectionHeading } from "@/components/content/section-heading";
import { SupportPageSections } from "@/components/content/support-page-sections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { methodologyFlow, methodologySections } from "@/content/page-copy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Methodology",
  description:
    "Learn what Observed, Estimated, and Assumption mean in the calculator and why some demographic combinations cannot be published directly.",
  path: "/methodology"
});

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Methodology"
        title="How the calculator gets its numbers"
        description="The app estimates people matching selected traits, not literal dating intent, compatibility, or mutual enthusiasm."
        className="mb-8"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-3">
            <SourceBadge sourceType="observed" />
            <CardTitle>Observed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-7 text-ink-600">
            {methodologySections[0]?.body}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-3">
            <SourceBadge sourceType="estimated" />
            <CardTitle>Estimated</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-7 text-ink-600">
            {methodologySections[1]?.body}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-3">
            <SourceBadge sourceType="assumption" />
            <CardTitle>Assumption</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-7 text-ink-600">
            {methodologySections[2]?.body}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1fr,0.88fr]">
        <Card>
          <CardHeader>
            <CardTitle>Filter pipeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-3 text-sm leading-7 text-ink-600">
              {methodologyFlow.map((item, index) => (
                <li key={item}>
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-xs font-semibold text-ink-700">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why exact combinations are not always possible</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm leading-7 text-ink-600">
            <p>
              Public data tables are finite. Statistics Canada publishes many useful cross-tabs, but not every combination of geography, age, sex, marital status, education, income, and language in one place.
            </p>
            <p>
              That means the app sometimes has to condition on the best compatible dimensions available and openly label the remainder as estimated. The alternative would be false precision, which is more misleading than useful.
            </p>
            <p>
              If you want to inspect the data tables behind the calculator, the <Link href="/sources" className="font-medium text-accent-700">sources page</Link> is the next stop.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <SupportPageSections
          sections={[
            {
              title: "What the result means",
              body:
                "The final output is best read as an estimate of people matching the selected published traits, not a count of actual partners, app matches, or future soulmates."
            },
            {
              title: "Why methodology is not buried",
              body:
                "A result without its data quality context is only half a product. This app keeps the trust labels and source notes close to the calculation on purpose."
            }
          ]}
        />
      </div>
    </div>
  );
}
