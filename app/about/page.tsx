import Link from "next/link";

import { SectionHeading } from "@/components/content/section-heading";
import { SupportPageSections } from "@/components/content/support-page-sections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { legalLinks } from "@/config/legal";
import { monetizationConfig } from "@/config/monetization";
import { aboutSections } from "@/content/page-copy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn the product philosophy behind the calculator and why it emphasizes transparency over meme-style certainty.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="About"
        title="A public data tool built for clarity"
        description="The product philosophy is simple: keep the calculator sharp, the copy respectful, and the uncertainty visible."
        className="mb-8"
      />
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What kind of site this is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-ink-600">
            <p>Calculator age floor: 18+.</p>
            <p>Uses official data where practical, estimates where necessary, and labels assumptions clearly.</p>
            <p>Not a matchmaking service and not a substitute for real-life judgment.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
            {monetizationConfig.supportEnabled && legalLinks.supportHref ? (
              <>
                <p>{monetizationConfig.supportDescription}</p>
                <Link href={legalLinks.supportHref} className="font-medium text-accent-700">
                  Open support / feedback
                </Link>
              </>
            ) : legalLinks.supportHref ? (
              <Link href={legalLinks.supportHref} className="font-medium text-accent-700">
                Open the public contact link
              </Link>
            ) : (
              <p>This release keeps contact surfaces minimal. Privacy notes and site policies are linked in the footer.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <SupportPageSections sections={aboutSections} />
    </div>
  );
}
