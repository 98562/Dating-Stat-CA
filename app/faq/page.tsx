import { FaqList } from "@/components/content/faq-list";
import { SectionHeading } from "@/components/content/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faqGroups } from "@/content/faq";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "FAQ",
  description:
    "Plain-language answers about what the calculator is doing, where the data come from, and why the result should not be treated too literally.",
  path: "/faq"
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions people actually ask before taking the number too seriously"
        description="Short, plain-language answers about what the calculator does, what it does not do, and how the data behave."
        className="mb-8"
      />
      <div className="space-y-8">
        {faqGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <p className="text-sm text-ink-600">{group.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <FaqList items={group.items} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
