import { legalConfig } from "@/config/legal";
import { SectionHeading } from "@/components/content/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms",
  description:
    "Read the terms covering informational use, limitations, service changes, and acceptable use.",
  path: "/terms"
});

export default function TermsPage() {
  const hasSiteDetails = Boolean(legalConfig.operatorName || legalConfig.governingLaw);
  const sections = [
    {
      title: "Overview",
      paragraphs: [
        "By using this site, you agree to use it as a public informational web tool and to do so lawfully.",
        "These terms are written in plain language for a small public site rather than as a long enterprise contract."
      ]
    },
    {
      title: "Informational and entertainment use",
      paragraphs: [
        "This calculator is a light statistical and entertainment tool. It estimates how selected traits narrow a potential pool; it is not a matchmaking service and it is not designed to make decisions for you."
      ]
    },
    {
      title: "No guarantee of accuracy",
      paragraphs: [
        "The site uses official data where practical, but some results rely on estimation and some rely on user assumptions. That means the output should be treated as informative perspective, not guaranteed fact."
      ]
    },
    {
      title: "Not professional advice",
      paragraphs: [
        "Nothing on this site is legal, financial, medical, relationship, or professional advice. Use your own judgment instead of treating the calculator as a decision engine."
      ]
    },
    {
      title: "User responsibility and acceptable use",
      paragraphs: [
        "Use the site respectfully and lawfully. Do not use it to harass, target, exploit, or demean people or groups.",
        "Do not interfere with the service, attempt to break it, or misuse the sharing features in ways that are deceptive or abusive."
      ]
    },
    {
      title: "Availability and changes",
      paragraphs: [
        "The site may change over time. Features, data sources, wording, and availability may be updated, limited, or removed without notice."
      ]
    },
    {
      title: "Limitation of liability",
      paragraphs: [
        "To the extent allowed by applicable law, the site is provided without guarantees, and the site owner is not responsible for losses that result from outages, errors, or reliance on the estimates."
      ]
    },
    {
      title: "Contact",
      paragraphs: [
        "If the site publishes a support or privacy contact, that information should be used for questions about operation, privacy, or policy."
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Terms"
        title="Terms for using the calculator"
        description="Plain-language terms for a small public web app."
        className="mb-8"
      />
      {hasSiteDetails ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Site details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-ink-600">
            {legalConfig.operatorName ? <p>Site operator: {legalConfig.operatorName}</p> : null}
            {legalConfig.governingLaw ? <p>Governing law: {legalConfig.governingLaw}.</p> : null}
          </CardContent>
        </Card>
      ) : null}
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
