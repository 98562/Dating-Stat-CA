import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SupportSection {
  title: string;
  body: string;
}

export function SupportPageSections({
  sections
}: {
  sections: SupportSection[];
}) {
  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-7 text-ink-600">
            {section.body}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
