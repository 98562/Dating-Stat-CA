import Link from "next/link";

import { SectionHeading } from "@/components/content/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { legalLinks } from "@/config/legal";
import { privacyConfig } from "@/config/privacy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Privacy",
  description:
    "Read the privacy notes covering analytics, future ads, shareable URLs, and the lack of account data in the app.",
  path: "/privacy"
});

export default function PrivacyPage() {
  const sections = [
    {
      title: "Overview",
      paragraphs: [
        "This site is a small public web app. It does not require an account, and normal calculator use is designed to stay in the browser after the page loads.",
        "The calculator supports age ranges 18 and above only. Shared links and restored states are kept within that supported range."
      ]
    },
    {
      title: "What the site stores in your browser",
      paragraphs: [
        "The app may store a small amount of browser state that is necessary for the site to work properly, such as routing state or shareable calculator settings in the URL.",
        "For the initial public launch, optional analytics and advertising are off, and the site does not show a live privacy-preferences panel because there is nothing optional to opt into."
      ]
    },
    {
      title: "How calculator inputs are handled",
      paragraphs: [
        "During normal use, the live calculator logic runs client-side in the browser after the page loads.",
        "The server may still deliver the page, metadata, and normalized datasets needed to run the app, but ordinary filtering does not require an account or a user profile."
      ]
    },
    {
      title: "Sharing behavior",
      paragraphs: [
        "A share link is only created when you explicitly use the sharing controls.",
        "Those links carry the calculator state so the same result can be reopened later. If you do not use sharing, there is no separate share record created just from using the calculator."
      ]
    },
    {
      title: "Cookies, local storage, and similar technology",
      paragraphs: [
        "This launch does not intentionally turn on optional analytics cookies, advertising cookies, or ad-network scripts.",
        "If the site later adds optional analytics or ads, this page should be updated to explain what changes and what choices visitors have."
      ]
    },
    {
      title: "Analytics and advertising status",
      paragraphs: [
        `Analytics active right now: ${privacyConfig.analyticsEnabled ? "yes" : "no"}.`,
        `Advertising active right now: ${privacyConfig.advertisingEnabled ? "yes" : "no"}.`
      ]
    },
    {
      title: "Questions and contact",
      paragraphs: legalLinks.privacyEmailHref
        ? ["Privacy questions can be sent to the contact listed below."]
        : legalLinks.supportHref
          ? ["A public support link is available for privacy-related questions."]
          : ["The site does not currently publish a dedicated privacy inbox."]
    },
    {
      title: "Changes to this page",
      paragraphs: [
        "This page may be updated as the site changes. If analytics, advertising, or other storage behavior are introduced later, the privacy notes should be updated to reflect that."
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Privacy"
        title="Privacy notes for a small public web app"
        description="Plain-language notes about what the site stores, how sharing works, and what is not active in the initial launch."
        className="mb-8"
      />
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current privacy posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-ink-600">
            <p>Accounts: none.</p>
            <p>Calculator age floor: 18+.</p>
            <p>Optional analytics active now: {privacyConfig.analyticsEnabled ? "yes" : "no"}.</p>
            <p>Optional advertising active now: {privacyConfig.advertisingEnabled ? "yes" : "no"}.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm text-ink-600">
            {legalLinks.privacyEmailHref ? (
              <Link href={legalLinks.privacyEmailHref} className="font-medium text-accent-700">
                Contact us about privacy
              </Link>
            ) : legalLinks.supportHref ? (
              <Link href={legalLinks.supportHref} className="font-medium text-accent-700">
                Use the support link for privacy questions
              </Link>
            ) : (
              <p>No dedicated privacy inbox is listed for this launch.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm leading-7 text-ink-600">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
