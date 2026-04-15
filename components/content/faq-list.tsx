import { Disclosure } from "@/components/ui/disclosure";
import type { FaqItem } from "@/content/faq";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Disclosure
          key={item.question}
          title={item.question}
          defaultOpen={index === 0}
        >
          <p className="text-sm leading-7 text-ink-600">{item.answer}</p>
        </Disclosure>
      ))}
    </div>
  );
}
