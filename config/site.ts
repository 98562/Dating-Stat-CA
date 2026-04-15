import { legalLinks } from "@/config/legal";
import { productConfig } from "@/config/product";
import { seoConfig } from "@/config/seo";

export const siteConfig = {
  name: seoConfig.defaultTitle,
  shortName: seoConfig.brandName,
  productLabel: seoConfig.productName,
  description: seoConfig.defaultDescription,
  tagline: productConfig.disclaimer,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://datingpool.ca",
  ogImage: "/opengraph-image",
  feedbackHref: legalLinks.supportHref
};

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/methodology", label: "Methodology" },
  { href: "/sources", label: "Sources" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" }
];

export const footerNav = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/methodology", label: "Methodology" },
  { href: "/sources", label: "Sources" }
];
